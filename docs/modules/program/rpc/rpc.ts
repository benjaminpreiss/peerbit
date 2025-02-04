/// [imports]
import { variant, field, serialize } from "@dao-xyz/borsh";
import { PublicSignKey } from "@peerbit/crypto";
import { Program } from "@peerbit/program";
import { RPC } from "@peerbit/rpc";
import { Peerbit } from "peerbit";
import { equals } from "uint8arrays";
/// [imports]

/// [definition-messages]
@variant("hello")
class Hello {
	constructor() {
		// add payload properties here
	}
}

@variant("world")
class World {
	constructor() {
		// add payload properties here
	}
}
/// [definition-messages]

/// [definition-roles]
class Role {}

@variant("responder")
class Responder extends Role {}

@variant("requester")
class Requester extends Role {}
/// [definition-roles]

/// [definition-program]
type Args = { role: Role };

@variant("rpc-test")
class RPCTest extends Program<Args> {
	@field({ type: RPC })
	rpc: RPC<Hello, World>;

	constructor() {
		super();
		this.rpc = new RPC();
	}

	async open(args?: Args): Promise<void> {
		await this.rpc.open({
			topic: "/rpc-test/this-should-be-something-unique",
			queryType: Hello,
			responseType: World,
			responseHandler:
				args?.role instanceof Responder
					? (hello, from) => {
							return new World();
					  }
					: undefined, // only create a response handler if we are to respond to requests
			subscriptionData: args?.role ? serialize(args.role) : undefined
		});
	}

	async getAllResponders(): Promise<PublicSignKey[]> {
		const allSubscribers = await this.node.services.pubsub.getSubscribers(
			this.rpc.rpcTopic
		);
		return [...(allSubscribers ? allSubscribers.values() : [])]
			.filter((x) => x.data && equals(x.data, serialize(new Responder())))
			.map((x) => x.publicKey);
	}
}

/// [definition-program]

/// [open]
const requester = await Peerbit.create();
const responder = await Peerbit.create();
await requester.dial(responder);

const rpcRequester = await requester.open(new RPCTest());

const rpcResponder = await responder.open(new RPCTest(), {
	args: { role: new Responder() }
});

// For testing purposes, wait for responder to be available
await rpcRequester.waitFor(responder.identity.publicKey);
/// [open]

/// [request]
// Wait for 1 response, else timeout will be used as a stop condition
const responses = await rpcRequester.rpc.request(new Hello(), { amount: 1 });

// Now you can also explicitly send to the ones who has subscribers with the role "Responder"
// const responses = await rpcRequester.rpc.request(new Hello(), { to: await rpcRequester.getAllResponders() })

expect(responses).toHaveLength(1);
for (const response of responses) {
	expect(response.response).toBeInstanceOf(World);
}
/// [request]

await requester.stop();
await responder.stop();
