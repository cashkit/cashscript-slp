import { BITBOX } from 'bitbox-sdk';
import { Contract, ElectrumNetworkProvider } from 'cashscript';
import { compileString } from 'cashc';


export const getContract = async (artifact, pk) => {
  const bitbox = new BITBOX();

  const alicePkh = bitbox.Crypto.hash160(pk);

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
              0x02,
              0x0000000000001388
          ]);
          // Calculate leftover money after fee (1000 sats)
          // Add change output if the remainder can be used
          // otherwise donate the remainder to the miner
          // int minerFee = 1000;
          int changeAmount = int(bytes(tx.value)) - minerFee;
          // int dust = 546;
          // require(changeAmount > dust);
  
          if (changeAmount >= (minerFee / 2)) {
              bytes32 change = new OutputP2SH(bytes8(changeAmount), hash160(tx.bytecode));
              require(hash256(announcement + change) == tx.hashOutputs);
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
  const artifact = compileString(`
pragma cashscript ^0.6.0;

contract Pokemon(bytes20 owner) {
    // Require pk to match stored owner and signature to match
    function spend(pubkey pk, sig s) {
        require(hash160(pk) == owner);
        require(checkSig(s, pk));
    }

    /**
    * Can only be called by the creater of the contract.
    */
    function createToken(
        pubkey pk,
        sig s,
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
            0x01,
            bytes(actionType),
            bytes(symbol),
            bytes(name),
            bytes(documentURI),
            bytes(documentHash),
            0x08,
            0x02,
            0x000000E8D4A51000
        ]);
        // Calculate leftover money after fee (1000 sats)
        // Add change output if the remainder can be used
        // otherwise donate the remainder to the miner
        // int minerFee = 1000;
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
  const contract = getContract(artifact, pk)
  return contract
}

