# Cashscript SLP

<h3> TOKENS </h3>

Valid transaction using the FT.cash contract with single OP_RETURN: https://explorer.bitcoin.com/bch/tx/a71eae6cd8864dca5e184f49093f1b0b9cb49572959354f9ad72e5d0c0a3fa8c

Valid transaction using the FT.cash contract with 2 OP_RETURN (SLP AND MEMO): https://explorer.bitcoin.com/bch/tx/9d1893ddedd9f1d041521c3f98508883856c3efde2406980dd3aa7af1c1b19bb

<h5> FT.cash </h5>

```js
pragma cashscript ^0.6.3;

contract FT(bytes20 owner) {
    // Warning: This method 'reclaim' should only be used in testing.
    // Backdoor to reclaim funds,
    function reclaim(pubkey pk, sig s) {
        require(checkSig(s, pk));
    }

    function createToken(
        pubkey pk,
        sig s,
        bytes20 recipientPkh,
        bytes lokadId,
        bytes tokenType,
        string actionType,
        string symbol,
        string name,
        string documentURI,
        string documentHash,
        bytes decimals,
        bytes baton,
        bytes initialQuantity,
        int minerFee,
        //string memoText
    ) {  
        require(hash160(pk) == owner);
        require(checkSig(s, pk));

        int dust = 546;

        bytes token = new OutputNullData([
            lokadId,
            tokenType,
            bytes(actionType),
            bytes(symbol),
            bytes(name),
            bytes(documentURI),
            bytes(documentHash),
            decimals,
            baton,
            initialQuantity
        ]);

        // bytes memo = new OutputNullData([
        //     0x6d02,
        //     bytes(memoText)
        // ]);

        int changeAmount = int(bytes(tx.value)) - minerFee - dust;
        if (changeAmount >= dust) {
            bytes34 recipient = new OutputP2PKH(bytes8(dust), recipientPkh);
            // Get the change back to the contract i.e Pay to Script Hash which is the current contract.
            bytes32 change = new OutputP2SH(bytes8(changeAmount), hash160(tx.bytecode));
            //require(hash256(token + recipient + change + memo) == tx.hashOutputs);
            require(hash256(token + recipient + change) == tx.hashOutputs);
        } else {
            require(hash256(token) == tx.hashOutputs);
        }

    }
}
```

<h5> Usage </h5>

```js
// Check the tokens/genesis.tsx

// import { hexToBin } from '@bitauth/libauth'
const lokadId = '0x534c5000'
...

const lokadIdBin = hexToBin(lokadId.substring(2))
...

const tx = await contract.functions
  .createToken(
    userPk,
    new SignatureTemplate(user),
    userPkh,
    lokadIdBin,
    ...
    minerFee,
  )
  .withOpReturn([
    lokadId,
    ...
    initialQuantity
  ])
  .to(slpRecipient, dust)
  .to(contract.address, change)
  // .withOpReturn([
  //   '0x6d02',
  //   strr,
  // ])
  .withHardcodedFee(minerFee)
  //.build()
  .send();
```

<h3> Valid transactions </h3>

- NFT1-Group: https://explorer.bitcoin.com/bch/tx/110426292c63fe0db0932b4dc1c49594127e9b2e1a6d66a3e5696a830de9f3dd

    - Genesis: 5000

- NFT1-Child: https://explorer.bitcoin.com/bch/tx/546c0ca35ac4612a5ed800acc27b7c67888c874717fd1e385c07a9790240701b

    - Genesis: 1
    -  Document URI: (hex to utf8)456c656374726963204d6f75736520302e346d20362e306b67 = Electric Mouse 0.4m 6.0kg
    - Document hash: 4335393041313135313339423742383046324543323237334431364436353744 = C590A115139B7B80F2EC2273D16D657D

<h3> NFT1-Group & NFT1-Child contract. </h3>

<h5> NFT.cash </h5>

```js
pragma cashscript ^0.6.0;

contract NFT(bytes20 owner) {
    // Warning: This method 'reclaim' should only be used in testing.
    // Backdoor to reclaim funds,
    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == owner);
        require(checkSig(s, pk));
    }

    // Warning: This method 'createNFTChild' should only be used in testing.
    // Backdoor to reclaim funds,
    function createNFTChild(pubkey pk, sig s) {
        require(hash160(pk) == owner);
        require(checkSig(s, pk));
    }

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
```

<h5> Meep </h5>

https://explorer.bitcoin.com/bch/tx/dc8cbc6486709dea0f23db356549a23d53714a1845172c034fec201cd55c203f

<img width="1288" alt="meep" src="https://user-images.githubusercontent.com/7335120/122131100-4b411d80-ce56-11eb-9b28-f35dfd2d553d.png">
