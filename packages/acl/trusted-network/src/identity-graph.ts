import { field, serialize, variant } from "@dao-xyz/borsh";
import { BinaryDocumentStore } from "@dao-xyz/orbit-db-bdocstore";
import { Key, PublicSignKey, PUBLIC_KEY_WIDTH } from "@dao-xyz/peerbit-crypto";
// @ts-ignore
import { SystemBinaryPayload } from "@dao-xyz/bpayload";
import { DocumentQueryRequest, MemoryCompare, MemoryCompareQuery, QueryRequestV0, Result, ResultWithSource } from "@dao-xyz/query-protocol";
import { AccessController } from "@dao-xyz/orbit-db-store";
import { createHash } from "crypto";
import { joinUint8Arrays } from '@dao-xyz/borsh-utils'

export type RelationResolver = { resolve: (key: PublicSignKey, db: BinaryDocumentStore<Relation>) => Promise<Result[]>, next: (relation: AnyRelation) => PublicSignKey }

export const getFromByTo: RelationResolver = {
    resolve: async (to: PublicSignKey, db: BinaryDocumentStore<Relation>) => {
        const ser = serialize(to);
        return await db.queryHandler(new QueryRequestV0({
            type: new DocumentQueryRequest({
                queries: [
                    new MemoryCompareQuery({
                        compares: [
                            new MemoryCompare({
                                bytes: ser,
                                offset: 3n + 4n + 1n + 28n + BigInt(PUBLIC_KEY_WIDTH) // SystemBinaryPayload discriminator + Relation discriminator + AnyRelation discriminator + id length u32 + utf8 encoding + id chars + from key
                            })
                        ]
                    })
                ]
            })
        }));
    },
    next: (relation) => relation.from
}

export const getToByFrom: RelationResolver = {
    resolve: async (from: PublicSignKey, db: BinaryDocumentStore<Relation>) => {
        const ser = serialize(from);
        return await db.queryHandler(new QueryRequestV0({
            type: new DocumentQueryRequest({
                queries: [
                    new MemoryCompareQuery({
                        compares: [
                            new MemoryCompare({
                                bytes: ser,
                                offset: 3n + 4n + 1n + 28n // SystemBinaryPayload discriminator + Relation discriminator + AnyRelation discriminator + id length u32 + utf8 encoding + id chars
                            })
                        ]
                    })
                ]
            })
        }));
    },
    next: (relation) => relation.to
}







export async function* getPathGenerator(from: Key, db: BinaryDocumentStore<Relation>, resolver: RelationResolver) {
    let iter = [from];
    const visited = new Set();
    while (iter.length > 0) {
        const newIter = [];
        for (const value of iter) {
            const results = await resolver.resolve(value, db);
            for (const result of results) {
                if (result instanceof ResultWithSource) {
                    if (result.source instanceof AnyRelation) {
                        if (visited.has(result.source.id)) {
                            return;
                        }
                        visited.add(result.source.id);
                        yield result.source;

                        newIter.push(resolver.next(result.source));
                    }
                }
            }
        }
        iter = newIter;
    }
}


/**
 * Get path, to target.
 * @param start 
 * @param target 
 * @param db 
 * @returns 
 */
export const getTargetPath = async (start: Key, target: (key: Key) => boolean, db: BinaryDocumentStore<Relation>, resolver: RelationResolver): Promise<Relation[] | undefined> => {

    if (!db) {
        throw new Error("Not initalized")
    }

    let path: Relation[] = [];
    let current = start;
    if (target(current)) {
        return path;
    }

    const iterator = getPathGenerator(current, db, resolver);
    for await (const relation of iterator) {
        if (target(relation.from)) {
            return path;
        }
    }
    return undefined;
}


@variant(1)
export class Relation extends SystemBinaryPayload {

    @field({ type: 'string' })
    id: string;

}


@variant(0)
export class AnyRelation extends Relation {

    @field({ type: PublicSignKey })
    from: PublicSignKey

    @field({ type: PublicSignKey })
    to: PublicSignKey

    constructor(properties?: {
        to: PublicSignKey // signed by truster
        from: PublicSignKey
    }) {
        super();
        if (properties) {
            this.from = properties.from;
            this.to = properties.to;
            this.initializeId();
        }
    }

    initializeId() {
        this.id = AnyRelation.id(this.to, this.from);
    }

    static id(to: PublicSignKey, from: PublicSignKey) {
        // we do sha1 to make sure id has fix length, this is important because we want the byte offest of the `trustee` and `truster` to be fixed
        return createHash('sha1').update(joinUint8Arrays([serialize(to), serialize(from)])).digest('base64');
    }

}


export const getPath = async (start: Key, end: Key, db: BinaryDocumentStore<Relation>, resolver: RelationResolver): Promise<Relation[] | undefined> => {
    return getTargetPath(start, (key) => end.equals(key), db, resolver)
}



export const createIdentityGraphStore = (props: { name?: string, queryRegion?: string, accessController?: AccessController<any> }) => new BinaryDocumentStore<Relation>({
    indexBy: 'id',
    name: props?.name ? props?.name : '' + '_relation',
    accessController: undefined,
    objectType: Relation.name,
    queryRegion: props.queryRegion,
    clazz: Relation
})