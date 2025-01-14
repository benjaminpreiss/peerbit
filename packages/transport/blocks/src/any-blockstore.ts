import { Blocks } from "@peerbit/blocks-interface";
import {
	cidifyString,
	codecCodes,
	createBlock,
	defaultHasher,
	stringifyCid
} from "./block.js";
import * as Block from "multiformats/block";
import { waitFor } from "@peerbit/time";
import { PeerId } from "@libp2p/interface/peer-id";
import { PublicSignKey } from "@peerbit/crypto";
import { AnyStore, createStore } from "@peerbit/any-store";

export class AnyBlockStore implements Blocks {
	private _store: AnyStore;
	private _opening: Promise<any>;
	private _onClose: (() => any) | undefined;
	constructor(store: AnyStore = createStore()) {
		this._store = store;
	}

	async get(
		cid: string,
		options?: {
			raw?: boolean;
			links?: string[];
			timeout?: number;
			hasher?: any;
		}
	): Promise<Uint8Array | undefined> {
		const cidObject = cidifyString(cid);
		try {
			const bytes = await this._store.get(cid);
			if (!bytes) {
				return undefined;
			}
			const codec = codecCodes[cidObject.code];
			const block = await Block.decode({
				bytes,
				codec,
				hasher: options?.hasher || defaultHasher
			});
			return (block as Block.Block<Uint8Array, any, any, any>).bytes;
		} catch (error: any) {
			if (
				typeof error?.code === "string" &&
				error?.code?.indexOf("LEVEL_NOT_FOUND") !== -1
			) {
				return undefined;
			}
			throw error;
		}
	}

	async put(bytes: Uint8Array): Promise<string> {
		const block = await createBlock(bytes, "raw");
		const cid = stringifyCid(block.cid);
		const bbytes = block.bytes;
		await this._store.put(cid, bbytes);
		return cid;
	}

	async rm(cid: string): Promise<void> {
		await this._store.del(cid);
	}

	async *iterator(): AsyncGenerator<[string, Uint8Array], void, void> {
		for await (const [key, value] of this._store.iterator()) {
			yield [key, value];
		}
	}

	async has(cid: string) {
		return !!(await this._store.get(cid));
	}

	async start(): Promise<void> {
		await this._store.open();

		try {
			this._opening = waitFor(() => this._store.status() === "open", {
				delayInterval: 100,
				timeout: 10 * 1000,
				stopperCallback: (fn) => {
					this._onClose = fn;
				}
			});
			await this._opening;
		} finally {
			this._onClose = undefined;
		}
	}

	async stop(): Promise<void> {
		this._onClose && this._onClose();
		return this._store.close();
	}

	status() {
		return this._store.status();
	}
	async waitFor(peer: PeerId | PublicSignKey): Promise<void> {
		return; // Offline storage // TODO this feels off resolving
	}
}
