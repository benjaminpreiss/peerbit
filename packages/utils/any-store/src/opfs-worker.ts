import { deserialize, serialize } from "@dao-xyz/borsh";
import { AnyStore } from "./interface.js";
import * as memory from "./opfs-worker-messages.js";

export class OPFSStoreWorker {
	level: string[];
	private _levels: Map<string, AnyStore>;
	private _rootStore: AnyStore;

	private _memoryIterator: Map<
		string,
		AsyncIterator<[string, ArrayBuffer], void, void>
	>;

	constructor() {
		const postMessageFn = postMessage;
		this._memoryIterator = new Map();
		this._levels = new Map();
		const createMemory = (
			root?: FileSystemDirectoryHandle,
			level: string[] = []
		): AnyStore => {
			let isOpen = false;

			let m: FileSystemDirectoryHandle = root!;

			// 'open' | 'closed' is just a virtual thing since OPFS is always open as soone as we get the FileSystemDirectoryHandle
			// TODO remove status? or assume not storage adapters can be closed?

			const open = async () => {
				isOpen = true;
				m = m || (await navigator.storage.getDirectory());
			};

			return {
				clear: async () => {
					for await (const key of m.keys()) {
						m.removeEntry(key, { recursive: true });
					}
				},

				del: async (key) => {
					try {
						return m.removeEntry(key, { recursive: true });
					} catch (error) {
						if (
							error instanceof DOMException &&
							error.name === "NotFoundError"
						) {
							return;
						} else {
							throw error;
						}
					}
				},

				get: async (key) => {
					try {
						const fileHandle = await m.getFileHandle(key);
						const buffer = await (await fileHandle.getFile()).arrayBuffer();
						return new Uint8Array(buffer);
					} catch (error) {
						if (
							error instanceof DOMException &&
							error.name === "NotFoundError"
						) {
							return;
						} else {
							throw error;
						}
					}
				},
				put: async (key, value) => {
					const fileHandle = await m.getFileHandle(key, { create: true });
					const writeFileHandle = await fileHandle.createSyncAccessHandle();
					writeFileHandle.write(value);
					writeFileHandle.close();
				},

				status: () => (isOpen ? "open" : "closed"),

				sublevel: async (name) => {
					const fileHandle = await m.getDirectoryHandle(name, { create: true });
					const sublevel = [...level, name];
					const subMemory = createMemory(fileHandle, sublevel);
					this._levels.set(memory.levelKey(sublevel), subMemory);
					await subMemory.open();
					return subMemory;
				},

				async *iterator(): AsyncGenerator<[string, Uint8Array], void, void> {
					for await (const v of m.values()) {
						if (v.kind == "file") {
							yield [
								v.name,
								new Uint8Array(await (await v.getFile()).arrayBuffer())
							];
						}
					}
				},
				close: async () => {
					isOpen = false;
					this._memoryIterator.clear();
				},
				open
			};
		};

		this._rootStore = createMemory();

		self.addEventListener("message", async (ev) => {
			const message = deserialize(ev["data"], memory.MemoryRequest);
			if (message instanceof memory.MemoryMessage) {
				const m =
					message.level.length === 0
						? this._rootStore
						: this._levels.get(memory.levelKey(message.level));
				if (!m) {
					throw new Error("Recieved memory message for an undefined level");
				} else if (message instanceof memory.REQ_Clear) {
					await m.clear();
					await this.respond(
						message,
						new memory.RESP_Clear({ level: message.level }),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Close) {
					await m.close();
					await this.respond(
						message,
						new memory.RESP_Close({ level: message.level }),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Del) {
					await m.del(message.key);
					await this.respond(
						message,
						new memory.RESP_Del({ level: message.level }),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Iterator_Next) {
					let iterator = this._memoryIterator.get(message.id);
					if (!iterator) {
						iterator = m.iterator()[Symbol.asyncIterator]();
						this._memoryIterator.set(message.id, iterator);
					}
					const next = await iterator.next();
					await this.respond(
						message,
						new memory.RESP_Iterator_Next({
							keys: next.done ? [] : [next.value[0]],
							values: next.done ? [] : [new Uint8Array(next.value[1])],
							level: message.level
						}),
						postMessageFn
					);
					if (next.done) {
						this._memoryIterator.delete(message.id);
					}
				} else if (message instanceof memory.REQ_Iterator_Stop) {
					this._memoryIterator.delete(message.id);
					await this.respond(
						message,
						new memory.RESP_Iterator_Stop({ level: message.level }),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Get) {
					const value = await m.get(message.key);
					await this.respond(
						message,
						new memory.RESP_Get({
							bytes: value ? new Uint8Array(value) : undefined,
							level: message.level
						}),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Open) {
					await m.open();
					await this.respond(
						message,
						new memory.RESP_Open({ level: message.level }),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Put) {
					await m.put(message.key, message.bytes);
					await this.respond(
						message,
						new memory.RESP_Put({ level: message.level }),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Status) {
					await this.respond(
						message,
						new memory.RESP_Status({
							status: await m.status(),
							level: message.level
						}),
						postMessageFn
					);
				} else if (message instanceof memory.REQ_Sublevel) {
					await m.sublevel(message.name);

					await this.respond(
						message,
						new memory.RESP_Sublevel({ level: message.level }),
						postMessageFn
					);
				}
			}
		});
	}

	async respond(
		request: memory.MemoryRequest,
		response: memory.MemoryRequest,
		postMessageFn = postMessage
	) {
		response.messageId = request.messageId;
		const bytes = serialize(response);
		postMessageFn(bytes, { transfer: [bytes.buffer] });
	}
}

new OPFSStoreWorker();
