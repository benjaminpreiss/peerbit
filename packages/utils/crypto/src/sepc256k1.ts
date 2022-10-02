import { field, variant } from "@dao-xyz/borsh";
import { SignKey } from './key.js';
import { verifyMessage } from '@ethersproject/wallet'
import sodium from 'libsodium-wrappers';


@variant(1)
export class Secp256k1PublicKeyData extends SignKey {

    @field({ type: 'string' })
    address: string; // this is really an ethereum variant of the publickey, that is calculated by hashing the publickey

    constructor(properties?: { address: string }) {
        super();
        if (properties) {
            this.address = properties.address;
        }
    }

    equals(other: SignKey): boolean {
        if (other instanceof Secp256k1PublicKeyData) {
            return this.address === other.address;
        }
        return false;
    }
    toString(): string {
        return "secpt256k1/" + this.address
    }
}


export const verifySignatureSecp256k1 = async (signature: Uint8Array, publicKey: Secp256k1PublicKeyData, data: Uint8Array, signedHash = false): Promise<boolean> => {
    await sodium.ready;
    let signedData = signedHash ? await sodium.crypto_generichash(32, Buffer.from(data)) : data;
    const signerAddress = verifyMessage(signedData, Buffer.from(signature).toString());
    return (signerAddress === publicKey.address)
}