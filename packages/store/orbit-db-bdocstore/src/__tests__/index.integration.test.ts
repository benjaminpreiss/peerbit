
import { Constructor, field, option, serialize, variant } from '@dao-xyz/borsh';
import { BinaryDocumentStore } from '../document-store';
import { DocumentQueryRequest, Compare, FieldBigIntCompareQuery, QueryRequestV0, QueryResponseV0, SortDirection, FieldStringMatchQuery, ResultWithSource, FieldSort, MemoryCompareQuery, MemoryCompare } from '@dao-xyz/query-protocol';
import { disconnectPeers, getConnectedPeers, Peer } from '@dao-xyz/peer-test-utils';
import { CustomBinaryPayload } from '@dao-xyz/bpayload';
import { query, ReadWriteAccessController } from '@dao-xyz/orbit-db-query-store';

@variant("document")//@variant([1, 0])
class Document extends CustomBinaryPayload {

  @field({ type: 'string' })
  id: string;

  @field({ type: option('string') })
  name?: string;

  @field({ type: option('u64') })
  number?: bigint;


  constructor(opts?: Document) {
    super();
    if (opts) {
      Object.assign(this, opts);
    }
  }
}


const bigIntSort = (a, b) => (a > b || -(a < b)) as number

const typeMap: { [key: string]: Constructor<any> } = { [Document.name]: Document, };

const documentDbTestSetup = async (): Promise<{
  creator: Peer,
  observer: Peer,
  documentStoreCreator: BinaryDocumentStore<Document>/* 
  documentStoreObserver: BinaryDocumentStore<Document> */
}> => {


  let [peer, observer] = await getConnectedPeers(2);

  // Create store
  const controller = new SimpleRWAccessController();
  controller.allowAll = true;
  let documentStoreCreator = await peer.orbitDB.open(new BinaryDocumentStore<Document>({
    accessController: controller,
    queryRegion: 'world',
    indexBy: 'id',
    objectType: Document.name
  }), { typeMap })
  await documentStoreCreator.load();
  const observerStore = await BinaryDocumentStore.load(observer.orbitDB._ipfs, documentStoreCreator.address);
  observerStore.subscribeToQueries = false;
  observerStore.accessController.allowAll = true;
  let _documentStoreObserver = await observer.orbitDB.open(observerStore, { typeMap, replicate: false })
  /*   
   */
  /* expect(await peer.node.pubsub.ls()).toHaveLength(2); // replication and query topic
  expect(await observer.node.pubsub.ls()).toHaveLength(0); */

  return {
    creator: peer,
    observer,
    documentStoreCreator/* ,
    documentStoreObserver */
  }
}

@variant([0, 253])
export class SimpleRWAccessController<T> extends ReadWriteAccessController<T>
{
  async canAppend(a, b) {
    return true;
  }
  async canRead(a) {
    return true;
  }
}


describe('query', () => {

  it('match all', async () => {
    let {
      creator,
      observer,
      documentStoreCreator
    } = await documentDbTestSetup();

    let blocks = documentStoreCreator;

    let doc = new Document({
      id: '1',
      name: 'Hello world'
    });
    let doc2 = new Document({
      id: '2',
      name: 'Foo bar'
    });
    await blocks.put(doc);
    await blocks.put(doc2);

    let response: QueryResponseV0 = undefined;

    //await otherPeer.node.swarm.connect((await creatorPeer.node.id()).addresses[0].toString());
    await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
      type: new DocumentQueryRequest({
        queries: []
      })
    }), (r: QueryResponseV0) => {
      response = r;
    }, { waitForAmount: 1 })
    expect(response.results).toHaveLength(2);
    expect(((response.results[0]) as ResultWithSource).source).toMatchObject(doc);
    expect(((response.results[1]) as ResultWithSource).source).toMatchObject(doc2);
    await disconnectPeers([creator, observer]);

  });

  it('string', async () => {

    let {
      creator,
      observer,
      documentStoreCreator
    } = await documentDbTestSetup();

    let blocks = documentStoreCreator;

    let doc = new Document({
      id: '1',
      name: 'Hello world'
    });
    let doc2 = new Document({
      id: '2',
      name: 'Foo bar'
    });
    await blocks.put(doc);
    await blocks.put(doc2);

    let response: QueryResponseV0 = undefined;

    //await otherPeer.node.swarm.connect((await creatorPeer.node.id()).addresses[0].toString());
    await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
      type: new DocumentQueryRequest({
        queries: [new FieldStringMatchQuery({
          key: 'name',
          value: 'ello'
        })]
      })
    }), (r: QueryResponseV0) => {
      response = r;
    }, { waitForAmount: 1 })
    expect(response.results).toHaveLength(1);
    expect(((response.results[0]) as ResultWithSource).source).toMatchObject(doc);

    await disconnectPeers([creator, observer]);

  });

  it('offset size', async () => {

    let {
      creator,
      observer,
      documentStoreCreator
    } = await documentDbTestSetup();

    let blocks = documentStoreCreator;

    let doc = new Document({
      id: '1',
      name: 'hey'
    });
    let doc2 = new Document({
      id: '2',
      name: 'hey'
    });

    let doc3 = new Document({
      id: '3',
      name: 'hey'
    });

    await blocks.put(doc);
    await blocks.put(doc2);
    await blocks.put(doc3);

    let response: QueryResponseV0 = undefined;

    //await otherPeer.node.swarm.connect((await creatorPeer.node.id()).addresses[0].toString());
    await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
      type: new DocumentQueryRequest({
        queries: [new FieldStringMatchQuery({
          key: 'name',
          value: 'hey'
        })],
        size: 1n,
        offset: 1n
      })
    }),
      (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
    expect(response.results).toHaveLength(1);
    expect(((response.results[0]) as ResultWithSource).source).toMatchObject(doc2);

    await disconnectPeers([creator, observer]);

  });

  describe('sort', () => {
    it('sort offset ascending', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        name: 'hey',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        name: 'hey',
        number: 2n

      });

      let doc3 = new Document({
        id: '3',
        name: 'hey',
        number: 3n
      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;

      //await otherPeer.node.swarm.connect((await creatorPeer.node.id()).addresses[0].toString());
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldStringMatchQuery({
            key: 'name',
            value: 'hey'
          })],
          offset: 1n,
          sort: new FieldSort({
            key: ['number'],
            direction: SortDirection.Ascending
          })
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      expect(response.results).toHaveLength(2);
      expect(((response.results[0] as ResultWithSource).source as Document).id).toEqual(doc2.id);
      expect(((response.results[1] as ResultWithSource).source as Document).id).toEqual(doc3.id);
      await disconnectPeers([creator, observer]);

    });


    it('sort offset descending', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        name: 'hey',
        number: 1n
      });
      let doc2 = new Document({
        id: '2',
        name: 'hey',
        number: 2n

      });

      let doc3 = new Document({
        id: '3',
        name: 'hey',
        number: 3n

      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;

      //await otherPeer.node.swarm.connect((await creatorPeer.node.id()).addresses[0].toString());
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldStringMatchQuery({
            key: 'name',
            value: 'hey'
          })],
          offset: 1n,
          sort: new FieldSort({
            key: ['number'],
            direction: SortDirection.Descending
          })
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      expect(response.results).toHaveLength(2);
      expect(((response.results[0] as ResultWithSource).source as Document).id).toEqual(doc2.id);
      expect(((response.results[1] as ResultWithSource).source as Document).id).toEqual(doc.id);
      await disconnectPeers([creator, observer]);

    });
  })



  describe('number', () => {
    it('equal', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        number: 2n
      });


      let doc3 = new Document({
        id: '3',
        number: 3n
      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldBigIntCompareQuery({
            key: 'number',
            compare: Compare.Equal,
            value: 2n
          })]
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      expect(response.results).toHaveLength(1);
      expect(((response.results[0] as ResultWithSource).source as Document).number).toEqual(2n);
      await disconnectPeers([creator, observer]);
    });


    it('gt', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        number: 2n
      });


      let doc3 = new Document({
        id: '3',
        number: 3n
      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldBigIntCompareQuery({
            key: 'number',
            compare: Compare.Greater,
            value: 2n
          })]
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      expect(response.results).toHaveLength(1);
      expect(((response.results[0] as ResultWithSource).source as Document).number).toEqual(3n);
      await disconnectPeers([creator, observer]);
    });

    it('gte', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        number: 2n
      });


      let doc3 = new Document({
        id: '3',
        number: 3n
      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldBigIntCompareQuery({
            key: 'number',
            compare: Compare.GreaterOrEqual,
            value: 2n
          })]
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      response.results.sort((a, b) => bigIntSort(((a as ResultWithSource).source as Document).number, ((b as ResultWithSource).source as Document).number));
      expect(response.results).toHaveLength(2);
      expect(((response.results[0] as ResultWithSource).source as Document).number).toEqual(2n);
      expect(((response.results[1] as ResultWithSource).source as Document).number).toEqual(3n);
      await disconnectPeers([creator, observer]);
    });

    it('lt', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        number: 2n
      });


      let doc3 = new Document({
        id: '3',
        number: 3n
      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldBigIntCompareQuery({
            key: 'number',
            compare: Compare.Less,
            value: 2n
          })]
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      expect(response.results).toHaveLength(1);
      expect(((response.results[0] as ResultWithSource).source as Document).number).toEqual(1n);
      await disconnectPeers([creator, observer]);
    });

    it('lte', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      let doc = new Document({
        id: '1',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        number: 2n
      });

      let doc3 = new Document({
        id: '3',
        number: 3n
      });

      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new FieldBigIntCompareQuery({
            key: 'number',
            compare: Compare.LessOrEqual,
            value: 2n
          })]
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      response.results.sort((a, b) => bigIntSort(((a as ResultWithSource).source as Document).number, ((b as ResultWithSource).source as Document).number));
      expect(response.results).toHaveLength(2);
      expect(((response.results[0] as ResultWithSource).source as Document).number).toEqual(1n);
      expect(((response.results[1] as ResultWithSource).source as Document).number).toEqual(2n);
      await disconnectPeers([creator, observer]);
    });
  })

  describe('Memory compare query', () => {
    it('Can query by memory', async () => {

      let {
        creator,
        observer,
        documentStoreCreator
      } = await documentDbTestSetup();

      let blocks = documentStoreCreator;

      const numberToMatch = 123;
      let doc = new Document({
        id: '1',
        name: 'a',
        number: 1n
      });

      let doc2 = new Document({
        id: '2',
        name: 'b',
        number: BigInt(numberToMatch)

      });

      let doc3 = new Document({
        id: '3',
        name: 'c',
        number: BigInt(numberToMatch)
      });

      const bytes = serialize(doc3);
      const numberOffset = 26;
      expect(bytes[numberOffset]).toEqual(numberToMatch);
      await blocks.put(doc);
      await blocks.put(doc2);
      await blocks.put(doc3);

      let response: QueryResponseV0 = undefined;

      //await otherPeer.node.swarm.connect((await creatorPeer.node.id()).addresses[0].toString());
      await query(observer.node.pubsub, blocks.queryTopic, new QueryRequestV0({
        type: new DocumentQueryRequest({
          queries: [new MemoryCompareQuery({
            compares: [new MemoryCompare({
              bytes: new Uint8Array([123, 0, 0]), // add some 0  trailing so we now we can match more than the exact value
              offset: BigInt(numberOffset)
            })]
          })]
        })
      }), (r: QueryResponseV0) => {
        response = r;
      }, { waitForAmount: 1 })
      expect(response.results).toHaveLength(2);
      expect(((response.results[0] as ResultWithSource).source as Document).id).toEqual(doc2.id);
      expect(((response.results[1] as ResultWithSource).source as Document).id).toEqual(doc3.id);
      await disconnectPeers([creator, observer]);

    });


  })
}) 