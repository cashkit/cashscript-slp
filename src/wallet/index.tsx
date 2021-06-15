import { BITBOX } from 'bitbox-sdk';

const bitbox = new BITBOX();
// Initialise HD node and alice's keypair
const rootSeed = bitbox.Mnemonic.toSeed('CashSciptLambo');
const hdNode = bitbox.HDNode.fromSeed(rootSeed);

const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

const alicePk = bitbox.ECPair.toPublicKey(alice);

// console.log(alice.getAddress())
// bitbox.Address.utxo(alice.getAddress())
    // .then((res) => console.log(res))
    // .catch((e) => console.log(e))


export const getAliceWallet = () => {
  return [alice, alicePk]
}

export const getBobWallet = () => {
  return bob
}

