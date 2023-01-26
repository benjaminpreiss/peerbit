import { LSession as SSession } from "@dao-xyz/libp2p-test-utils";
import { RecursivePartial } from "@libp2p/interfaces";
import { Datastore } from "interface-datastore";
import { createLibp2pExtended, Libp2pExtended } from "@dao-xyz/peerbit-libp2p";

export type LibP2POptions = {
	datastore?: RecursivePartial<Datastore> | undefined
};
export class LSession {

	private session: SSession<Libp2pExtended>;
	constructor(session: SSession<Libp2pExtended>) {
		this.session = session;
	}

	public get peers(): Libp2pExtended[] {
		return this.session.peers;
	}

	async connect(groups?: Libp2pExtended[][]) {
		await this.session.connect(groups);
		return;
	}
	async stop() {
		return this.session.stop();
	}

	static async connected(n: number) {
		const session = await LSession.disconnected(n);
		await session.connect();
		return session;
	}

	static async disconnected(n: number, options?: LibP2POptions) {
		const session: SSession<Libp2pExtended> =
			await SSession.disconnected<Libp2pExtended>(n, options);
		const peers = await Promise.all(session.peers.map(async (peer) => {
			const extended = await createLibp2pExtended(peer)
			await extended.start()
			return extended;
		}));
		session.peers = peers;

		return new LSession(session);
	}
}
