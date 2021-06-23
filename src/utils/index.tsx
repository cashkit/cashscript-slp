import { Script, Crypto } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { SignatureAlgorithm } from 'cashscript';
import { BITBOX } from 'bitbox-sdk';

const bitbox = new BITBOX();
const transactionBuilder = new bitbox.TransactionBuilder('mainnet');


export class Signer {
  constructor(public keypair: ECPair) {}

  // Encode a baton and quantity into a byte sequence of 8 bytes (4 bytes per value)
  createMessage(baton: number, quantity: number): Buffer {
    const lhs = Buffer.alloc(4, 0);
    const rhs = Buffer.alloc(4, 0);
    new Script().encodeNumber(baton).copy(lhs);
    new Script().encodeNumber(quantity).copy(rhs);
    return Buffer.concat([lhs, rhs]);
  }

  // Encode a baton and messageType into a byte sequence of 8 bytes (4 bytes per value)
  createSingleMessage(messageType: number): Buffer {
    const lhs = Buffer.alloc(4, 0);
    new Script().encodeNumber(messageType).copy(lhs);
    return lhs
  }

  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(new Crypto().sha256(message), SignatureAlgorithm.SCHNORR).toRSBuffer();
  }
}

export const reclaimAmount = async (address, keyPair) => {

  let amount = 0
  const accountDetails = await bitbox.Address.utxo(address);
  //@ts-ignore
  const accountutxos = accountDetails.utxos;
  //const accountutxos = await account.getUtxos();
  console.log(accountutxos)
  accountutxos.forEach(u => {
    console.log(u)
    amount += u.satoshis
    transactionBuilder.addInput(u.txid, u.vout);
  });
  console.log(amount)
  let byteCount = bitbox.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 1 });
  // amount to send to receiver. It's the original amount - 1 sat/byte for tx size
  let sendAmount = amount - byteCount*3;
  console.log(sendAmount, byteCount)
  // add output w/ address and amount to send
  transactionBuilder.addOutput('bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0', sendAmount);
  //transactionBuilder.setLockTime(0)

  let redeemScript;    //empty redeemScript variable
  // sign w/ keyPair
  accountutxos.forEach((u, idx) => {
    transactionBuilder.sign(
      idx,
      keyPair,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      u.satoshis,
      transactionBuilder.signatureAlgorithms.SCHNORR
    );
  })
  
  let tx = transactionBuilder.build();
  let hex = tx.toHex();
  bitbox.RawTransactions.sendRawTransaction(hex)
    .then((result) => { console.log("Sent Raw Transaction: ", result); }, (err) => { console.log(err); });

}