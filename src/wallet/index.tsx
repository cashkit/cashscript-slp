import { BITBOX } from 'bitbox-sdk';

const bitbox = new BITBOX();
// Initialise HD node and user's keypair
const rootSeed = bitbox.Mnemonic.toSeed('CashScriptLambergini');
const hdNode = bitbox.HDNode.fromSeed(rootSeed);

const user = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

const userPk = bitbox.ECPair.toPublicKey(user);

const userPkh = bitbox.Crypto.hash160(userPk);

// console.log(user.getAddress())
// bitbox.Address.utxo(user.getAddress())
    // .then((res) => console.log(res))
    // .catch((e) => console.log(e))


export const getUserWallet = () => {
  return [user, userPk, userPkh]
}