import { Script, Crypto } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { SignatureAlgorithm } from 'cashscript';

export class ContractHelper {
  constructor(public keypair: ECPair) {}

  // Encode a baton and quantity into a byte sequence of 8 bytes (4 bytes per value)
  createMessage(baton: number, quantity: number): Buffer {
    const lhs = Buffer.alloc(4, 0);
    const rhs = Buffer.alloc(4, 0);
    new Script().encodeNumber(baton).copy(lhs);
    new Script().encodeNumber(quantity).copy(rhs);
    return Buffer.concat([lhs, rhs]);
  }

  // Encode a baton and quantity into a byte sequence of 8 bytes (4 bytes per value)
  createSingleMessage(quantity: number): Buffer {
    const lhs = Buffer.alloc(8, 0);
    new Script().encodeNumber(quantity).copy(lhs);
    return lhs
  }

  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(new Crypto().sha256(message), SignatureAlgorithm.SCHNORR).toRSBuffer();
  }
}
