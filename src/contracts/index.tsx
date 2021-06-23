import { BITBOX } from 'bitbox-sdk';
import { Contract, ElectrumNetworkProvider, BitboxNetworkProvider } from 'cashscript';
import { compileString } from 'cashc';


export const getContract = async (artifact, pk) => {
  const bitbox = new BITBOX();

  const pkh = bitbox.Crypto.hash160(pk);

  // Initialise a network provider for network operations on MAINNET
  // @ts-ignore
  const provider = new BitboxNetworkProvider('mainnet', bitbox);
  //const provider = new ElectrumNetworkProvider('mainnet');

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: pkh)
  const contract = new Contract(artifact, [pkh], provider);
  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());
  console.log('contract opcount:', contract.opcount);
  console.log('contract bytesize:', contract.bytesize);
  return contract
}

export const getNFTContract = async (pk) => {
  const artifact = compileString(`
  pragma cashscript ^0.6.0;

  contract Pokemon(bytes20 owner) {
      // Require pk to match stored owner and signature to match
      function reclaim(pubkey pk, sig s) {
          require(hash160(pk) == owner);
          require(checkSig(s, pk));
      }
  
      function createNFTChild(pubkey pk, sig s) {
          require(hash160(pk) == owner);
          require(checkSig(s, pk));
      }
  
      /**
      * Can only be called by the creater of the contract.
      */
      function createNFTGroup(
          pubkey pk,
          sig s,
          bytes20 recipientPkh,
          string actionType,
          string symbol,
          string name,
          string documentURI,
          string documentHash,
          int minerFee,
      ) {  
  
          require(hash160(pk) == owner);
          require(checkSig(s, pk));
  
          bytes announcement = new OutputNullData([
              0x534c5000,
              0x81,
              bytes(actionType),
              bytes(symbol),
              bytes(name),
              bytes(documentURI),
              bytes(documentHash),
              0x00,
              0xff, // Trick: Keep this number above the number of transactions you would expect.
              0x0000000000001388
          ]);
          // Calculate leftover money after fee (1000 sats)
          // Add change output if the remainder can be used
          // otherwise donate the remainder to the miner
          // int minerFee = 1000;
          int dust = 546;
          int changeAmount = int(bytes(tx.value)) - dust - minerFee;
  
          // require(changeAmount > dust);
  
          if (changeAmount >= minerFee) {
              bytes34 recipient = new OutputP2PKH(bytes8(dust), recipientPkh);
              bytes32 change = new OutputP2SH(bytes8(changeAmount), hash160(tx.bytecode));
              require(hash256(announcement + recipient + change) == tx.hashOutputs);
          } else {
              require(hash256(announcement) == tx.hashOutputs);
          }
      }
  }
`)
  const contract = getContract(artifact, pk)
  return contract
}

export const getSLPContract = async (pk) => {
  console.log(pk)
  const contractFetch = await fetch('PokemonSLP.cash') // Inside public folder.
  const source = await contractFetch.text();
  const artifact = compileString(source)
  const contract = getContract(artifact, pk)
  return contract
}

