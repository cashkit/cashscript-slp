# Pokemon NFT Demo


### Valid transactions

- NFT1-Group: https://explorer.bitcoin.com/bch/tx/110426292c63fe0db0932b4dc1c49594127e9b2e1a6d66a3e5696a830de9f3dd

    - Genesis: 5000

- NFT1-Child: https://explorer.bitcoin.com/bch/tx/546c0ca35ac4612a5ed800acc27b7c67888c874717fd1e385c07a9790240701b

    - Genesis: 1
    -  Document URI: (hex to utf8)456c656374726963204d6f75736520302e346d20362e306b67 = Electric Mouse 0.4m 6.0kg
    - Document hash: 4335393041313135313339423742383046324543323237334431364436353744 = C590A115139B7B80F2EC2273D16D657D

#### NFT1-Group & NFT1-Child contract.

<code>

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

            int dust = 546;
            int changeAmount = int(bytes(tx.value)) - dust - minerFee;

            if (changeAmount >= minerFee) {
                bytes34 recipient = new OutputP2PKH(bytes8(dust), recipientPkh);
                bytes32 change = new OutputP2SH(bytes8(changeAmount), hash160(tx.bytecode));
                require(hash256(announcement + recipient + change) == tx.hashOutputs);
            } else {
                require(hash256(announcement) == tx.hashOutputs);
            }
        }
    }
</code>