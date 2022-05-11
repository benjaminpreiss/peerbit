
import OrbitDB from 'orbit-db';
import { Identity } from 'orbit-db-identity-provider';
import { TrustResolver } from './trust';
import { CONTRACT_ACCESS_CONTROLLER } from './acl';
import { ReplicationRequest, Shard, ShardChain, SHARD_NAME_FIELD, SHARD_STORE_OBJECT_TYPE_FIELD, SHARD_STORE_TYPE_FIELD, StoreBuilder, TypedBehaviours } from './shard';
import * as IPFS from 'ipfs';
import { IPFS as IPFSInstance } from 'ipfs-core-types'
import { Constructor, deserialize, serialize } from '@dao-xyz/borsh';
import BN from 'bn.js'
import Store from 'orbit-db-store';
import FeedStore from 'orbit-db-feedstore';
import DocumentStore from 'orbit-db-docstore';
import { BinaryDocumentStore, BINARY_DOCUMENT_STORE_TYPE } from '@dao-xyz/orbit-db-bdocstore';
/* const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebrtcStar = require('libp2p-webrtc-star')
const wrtc = require('wrtc')
const Mplex = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const Secio = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')
const Gossipsub = require('libp2p-gossipsub') */

interface Post {
  content: string;
}

interface Block {
  index: number,

  // Post DB
  posts: string

}
interface Root {
  blocks: string
}


interface IPFSInstanceExtended extends IPFSInstance {
  libp2p: any
}

OrbitDB.addDatabaseType(BINARY_DOCUMENT_STORE_TYPE, BinaryDocumentStore as any)

export class ShardedDB {
  public node: IPFSInstanceExtended = undefined;
  public orbitDB: OrbitDB = undefined;
  public defaultOptions: ICreateOptions = undefined;
  /*   public pieces: DocumentStore<any> = undefined; */
  public IPFS: typeof IPFS = undefined;

  public latestMessages: Map<string, any> = new Map() // by topic
  public rootId: string;


  public replicationCapacity: number | undefined = undefined
  public behaviours: TypedBehaviours

  constructor() {
    this.IPFS = IPFS;
  }
  async create(options: { shardingTopic?: string, rootDB?: string, local: boolean, repo: string, identity?: Identity, trustProvider?: TrustResolver, behaviours: TypedBehaviours } = {
    local: false, repo: './ipfs', rootDB: undefined, shardingTopic: undefined, behaviours: {
      stores: {},
      typeMap: {}
    }
  }): Promise<void> {

    this.behaviours = options.behaviours;
    this.behaviours.typeMap[ShardChain.name] = ShardChain;

    // Create IPFS instance
    const ipfsOptions = options.local ? {
      preload: { enabled: false },
      repo: options.repo,
      EXPERIMENTAL: { pubsub: true },
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] }
      }
    } : {
      relay: { enabled: true, hop: { enabled: true, active: true } },
      repo: options.repo,
      EXPERIMENTAL: { pubsub: true },
      config: {
        Addresses: {
          Swarm: [
            `/ip4/0.0.0.0/tcp/0`,
            `/ip4/127.0.0.1/tcp/0/ws`
            //'/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
            // '/dns4/secure-beyond-12878.herokuapp.com/tcp/80/ws/p2p-webrtc-star/'
            /*      '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                 '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                 '/ip4/127.0.0.1/tcp/13579/wss/p2p-webrtc-star' */
            //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            /*  '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/' */
          ]
        }
        /*      Addresses: {
               Swarm: [ */

        /*  `/ip4/0.0.0.0/tcp/0`,
         `/ip4/127.0.0.1/tcp/0/ws` */
        /*  '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
         '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
         '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/', */
        /*   ], */
        /*  API: `/ip4/127.0.0.1/tcp/0`,
         Gateway: `/ip4/127.0.0.1/tcp/0`,
         RPC: `/ip4/127.0.0.1/tcp/0` */
        /*   }*/
      }
    }

    /* '/ip4/0.0.0.0/tcp/0',
 '/ip4/0.0.0.0/tcp/0/ws',
 `/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/` */
    /*    
 const libp2p = await Libp2p.create({
   addresses: {
     listen: [
 
       '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
     ]
   },
   modules: {
     transport: [TCP, Websockets, WebrtcStar],
     streamMuxer: [Mplex],
     connEncryption: [NOISE, Secio],
     peerDiscovery: [Bootstrap, MDNS],
     dht: KadDHT,
     pubsub: Gossipsub
   },
   config: {
     transport: {
       [WebrtcStar.prototype[Symbol.toStringTag]]: {
         wrtc
       }
     },
     peerDiscovery: {
       bootstrap: {
         list: ['/ip4/127.0.0.1/tcp/63785/ipfs/12D3KooWLzqGooZH35FaFQokh5xyc4P6HEn3aWpoXjQkieytTDdL']
       }
     },
     dht: {
       enabled: true,
       randomWalk: {
         enabled: true
       }
     }
   }
 })
 await libp2p.start();
 this.node = libp2p; */
    this.node = await IPFS.create(ipfsOptions)
    this.rootId = options.shardingTopic;
    await this._init({
      identity: options.identity,
      rootDB: options.rootDB,
      trustProvider: options.trustProvider
    });

  }


  async _init(options: { identity?: Identity, trustProvider?: TrustResolver, rootDB?: string } = {}): Promise<void> {
    const peerInfo = await this.node.id()
    this.orbitDB = await OrbitDB.createInstance(this.node,
      {
        identity: options.identity,
        directory: './orbit-db/' + peerInfo.id
      })
    this.defaultOptions = {
      accessController: {
        //write: [this.orbitDB.identity.id],
        type: CONTRACT_ACCESS_CONTROLLER,
        trustProvider: options.trustProvider
      } as any,
      replicate: true,
      directory: './orbit-db-stores/' + peerInfo.id
    }

    const docStoreOptions = {
      ...this.defaultOptions,
      indexBy: 'hash',
    }
    /*  this.pieces = await this.orbitDB.docstore('pieces', docStoreOptions)
     await this.pieces.load();
 
     */

    /* 
     await this.loadFixtureData({
       'username': Math.floor(Math.random() * 1000000),
       'posts': this.posts.id,
       'nodeId': peerInfo.id
     }) */

    this.node.libp2p.connectionManager.on('peer:connect', this.handlePeerConnected.bind(this))
    await this.node.pubsub.subscribe(peerInfo.id, (msg: any) => {
      this.latestMessages.set(peerInfo.id, msg);
      console.log('GOT MESSAGE :)')
      this.handleMessageReceived(msg)
    }) // this.handleMessageReceived.bind(this)

    if (this["onready"]) (this as any).onready();
  }

  getShardingTopic(): string {
    return this.rootId + "-" + "sharding";
  }

  get shardChainChain(): ShardChain<BinaryDocumentStore<ShardChain<any>>> {

    // the shard of shards
    let shardChain = new ShardChain<BinaryDocumentStore<ShardChain<any>>>({
      shardChainName: this.rootId,
      storeType: BINARY_DOCUMENT_STORE_TYPE,
      objectType: ShardChain.name
    });
    shardChain.init({
      behaviours: this.behaviours,
      db: this,
      defaultOptions: this.defaultOptions
    })
    return shardChain;
  }


  async loadShardChain<B extends Store>(shardChainName: string, storeType: Constructor<B>, objectType?: Constructor<any>): Promise<ShardChain<B>> {

    let shardChains = await this.shardChainChain;
    let counter = await shardChains.getShardCounter();
    for (let i = 0; i < counter.value; i++) {
      let shard = await shardChains.getShard(i);
      await shard.loadBlocks();
      let results = shard.blocks.query(doc => doc) // TODO: FIX

      if (results.length == 1) {
        return results[0]
      }
      else if ((await results).length > 2) {
        throw new Error("Found more than 1 shard with name: " + shardChainName)
      }
    }

    // Create new shard, if not found
    let chain = await shardChains.getWritableShard();

    let newShardChain = new ShardChain<any>({
      shardChainName,
      storeType: storeType.name,
      objectType: objectType?.toString()
    });

    let bytes = serialize(newShardChain);
    await chain.loadBlocks()
    await chain.makeSpace(bytes.length);
    //await chain.blocks.put(bytes);

    return newShardChain;
  }


  /*  getFeedStoreShardChain<T>(shardChainName: string, type: string): ShardChain<FeedStore<T>> {
 
     let chain = new ShardChain<FeedStore<T>>({
       shardChainName: shardChainName,
       defaultOptions: this.defaultOptions,
       db: this,
       behaviours: this.behaviours,
       type: ''
       //storeBuilder: (a, b, c) => c.feed(a, b)
     });
     return chain;
   } */


  async subscribeForReplication(topic: string, capacity: number): Promise<void> {
    this.replicationCapacity = capacity;
    await this.node.pubsub.subscribe(topic, async (msg: any) => {
      try {
        let request = deserialize(msg.data, ReplicationRequest);
        let chain = new ShardChain<any>({
          shardChainName: request[SHARD_NAME_FIELD],
          storeType: request[SHARD_STORE_TYPE_FIELD],
          objectType: request[SHARD_STORE_OBJECT_TYPE_FIELD]
        });

        chain.init({
          defaultOptions: this.defaultOptions,
          db: this,
          behaviours: this.behaviours,
        })

        let shardToReplicate = new Shard({
          index: request.index,
          chain,
          defaultOptions: this.defaultOptions
        });

        await shardToReplicate.replicate();
        const t = 1;

      } catch (error) {
        console.error('Invalid replication request');
      }
    }) // this.handleMessageReceived.bind(this)
  }





  async disconnect(): Promise<void> {
    await this.orbitDB.disconnect();
    await this.node.stop();

  }
  // async addNewPiece(hash, instrument = 'Piano') {
  // const existingPiece = this.getPieceByHash(hash)
  // if (existingPiece)
  // {
  // await this.updatePieceByHash(hash, instrument)
  //return
  /*  }
   const cid = await this.pieces.put({ hash, instrument })
   return cid
 } */

  /*  async addNewPost(post: Post): Promise<string> {
     // const existingPiece = this.getPieceByHash(hash)
     // if (existingPiece)
     {
       // await this.updatePieceByHash(hash, instrument)
       //return
     }
     const cid = await this.posts.add(post)
     return cid
   } */
  /* getAllPieces() {
    const pieces = this.pieces.get('')
    return pieces
  }

  getPieceByInstrument(instrument) {
    return this.pieces.query((piece) => piece["instrument"] === instrument)
  } */

  async getIpfsPeers() {
    const peers = await this.node.swarm.peers()
    return peers
  }

  async connectToPeer(multiaddr, protocol = '/p2p-circuit/ipfs/') {
    try {
      await this.node.swarm.connect(protocol + multiaddr)
    } catch (e) {
      throw (e)
    }
  }

  /* async loadFixtureData(fixtureData) {
    const fixtureKeys = Object.keys(fixtureData)
    for (let i in fixtureKeys) {
      let key = fixtureKeys[i]
      if (!this.user.get(key)) await this.user.set(key, fixtureData[key])
    }
  } */

  /* getAllProfileFields() {
    return this.user.all;
  } */

  handlePeerConnected(ipfsPeer) {
    const ipfsId = ipfsPeer.id
    if (this["onpeerconnect"]) (this as any).onpeerconnect(ipfsId)
  }

  async sendMessage(topic: string, message: any) {
    try {
      const msgString = JSON.stringify(message)
      const messageBuffer = Buffer.from(msgString)
      await this.node.pubsub.publish(topic, messageBuffer)
    } catch (e) {
      throw (e)
    }
  }

  handleMessageReceived(msg: any) {
    // 
  }
}
