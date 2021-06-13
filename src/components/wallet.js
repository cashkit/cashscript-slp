import React, { useEffect, useState } from 'react';
import { BITBOX } from 'bitbox-sdk';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import { compileString } from 'cashc';


const artifact = compileString(`
pragma cashscript ^0.6.0;

contract Pokemon(bytes20 pkh) {
    // Require pk to match stored pkh and signature to match
    function spend(pubkey pk, sig s) {
        require(hash160(pk) == pkh);
        require(checkSig(s, pk));
    }

    function createPokemonSLP(
        pubkey pk,
        sig s,
        string actionType,
        string symbol,
        string name,
        string documentURI,
        string documentHash,
        int minerFee
    ) {
        require(checkSig(s, pk));

        // Create the memo.cash announcement output
        bytes announcement = new OutputNullData([
            0x534c5000,
            0x01,
            bytes(actionType),
            bytes(symbol),
            bytes(name),
            bytes(documentURI),
            bytes(documentHash),
            0x08,
            0x02,
            0x0000000005F5E100
        ]);
        // Calculate leftover money after fee (1000 sats)
        // Add change output if the remainder can be used
        // otherwise donate the remainder to the miner
        //int minerFee = 1000;
        int changeAmount = int(bytes(tx.value)) - minerFee;
        if (changeAmount >= (minerFee / 2)) {
            bytes32 change = new OutputP2SH(bytes8(changeAmount), hash160(tx.bytecode));
            require(tx.hashOutputs == hash256(announcement + change));
        } else {
            require(tx.hashOutputs == hash256(announcement));
        }
    }
}
`)

const bitbox = new BITBOX();
// Initialise HD node and alice's keypair
const rootSeed = bitbox.Mnemonic.toSeed('CashSciptLambo');
const hdNode = bitbox.HDNode.fromSeed(rootSeed);

const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));

const alicePk = bitbox.ECPair.toPublicKey(alice);

console.log(alice.getAddress())
bitbox.Address.utxo(alice.getAddress()).then((res) => console.log(res)).catch((e) => console.log(e))


export const getAliceWallet = () => {
  return [alice, alicePk]
}

export const getBobWallet = () => {
  return bob
}

export const getContract = async () => {
  const bitbox = new BITBOX();

  const alicePkh = bitbox.Crypto.hash160(alicePk);

  // Initialise a network provider for network operations on MAINNET
  const provider = new ElectrumNetworkProvider('mainnet');

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: alicePkh)
  const contract = new Contract(artifact, [alicePkh], provider);
  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());
  console.log('contract opcount:', contract.opcount);
  console.log('contract bytesize:', contract.bytesize);


  return contract

}
