import React, { useEffect, useState } from 'react';

import { BITBOX } from 'bitbox-sdk';
import { SignatureTemplate } from 'cashscript';
import { stringify } from '@bitauth/libauth';
import { getUserWallet } from '../../wallet';
import { getNFTContract } from '../../contracts';
import { reclaimAmount } from '../../utils';
import { Utils } from 'slpjs';

const bitbox = new BITBOX();

/**
 * First input must be from the address which holds the genesis transaction.
 * Second should be the that is spending
 */

const TokenTypes = {
  Clild: '0x41' // Genesis and Send
}

const ActionTypes = {
  GENESIS: 'GENESIS',
  MINT: 'MINT',
  SEND: 'SEND',
  COMMIT: 'COMMIT'
}

const defaultSymbol = 'PIKACHU'
const defaultName = 'PIKACHU'
const defaultDocumentURI = 'Electric Mouse 0.4m 6.0kg'
const defaulDocumentHash = 'C590A115139B7B80F2EC2273D16D657D'
//const defaulDocumentHash = 'Electric Mouse 0.4m 6.0kg'
const defaultDecimals = '0x00'
/**
 * Only set 0x4c00 when in the genesis transcation
 * Otherwise set 0x41 in the send or mint transaction
 */
// const defaulBaton = '0x4c00'

const defaulBaton = '0x02'
// const defaulBaton = '0x4c00'
const defaultInitialQuantity = '0x0000000000000001'


const Genesis = () => {
  const lokadId = '0x534c5000'
  const [tokenType, setTokenType] = useState(TokenTypes.Clild)
  const [actionType, setActionType] = useState(ActionTypes.GENESIS)
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [name, setName] = useState(defaultName)
  const [documentURI, setDocumentURI] = useState(defaultDocumentURI)
  const [documentHash, setDocumentHash] = useState(defaulDocumentHash)
  const [decimals, setDecimals] = useState(defaultDecimals)
  const [baton, setBaton] = useState(defaulBaton)
  const [initialQuantity, setInitialQuantity] = useState(defaultInitialQuantity)

  const handleTokenChange = (event) => {
    setTokenType(event.target.value)
  }

  const handleActionChange = (event) => {
    setActionType(event.target.value)
  }

  const handleSymbolChange = (event) => {
    setSymbol(event.target.value.toUpperCase())
  }

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDocumentURIChange = (event) => {
    setDocumentURI(event.target.value)
  }

  const handleDocumentHashChange = (event) => {
    setDocumentHash(event.target.value)
  }

  const handleDecimalChange = (event) => {
    setDecimals(event.target.value)
  }

  const handleBatonChange = (event) => {
    setBaton(event.target.value)
  }

  const handleInitialQuantityChange = (event) => {
    setInitialQuantity(event.target.value)
  }

  const handleSubmit = async () => {
    const [alice, alicePk] = getUserWallet()
    const [bob, bobPk] = getUserWallet()
    const contract = await getNFTContract(alicePk)

    let inputVal = 0

    const _Utxos = (await contract.getUtxos())
    .sort((a, b) => b.satoshis - a.satoshis)

    let groupInputTxId = "110426292c63fe0db0932b4dc1c49594127e9b2e1a6d66a3e5696a830de9f3dd"

    const groupInputUtxo = _Utxos
    .filter(u => u.txid === groupInputTxId)
    .filter(s => s.satoshis === 546)

    const funderUtxos = (await contract.getUtxos())
    .sort((a, b) => b.satoshis - a.satoshis)
    .slice(0, 1);

    const transactionInputs = []
    //@ts-ignore
    transactionInputs.push(...groupInputUtxo, ...funderUtxos)

    // const cashAddr = bitbox.ECPair.toCashAddress(bob);
    // const slpRecipient = Utils.toSlpAddress(cashAddr)
    // console.log(slpRecipient)

    //const cashAddr = bitbox.ECPair.toCashAddress(alice);
    // const slpRecipient = Utils.toSlpAddress(cashAddr)
    // console.log(slpRecipient)

    const slpRecipient = Utils.toSlpAddress(contract.address)
    console.log(slpRecipient)

    // await bitbox.Address.utxo(cashAddr)
    //   .then((res) => {
    //     console.log("alice utxos: ", res)
    //     //@ts-ignore
    //     res.utxos.forEach((u) => {
    //       if (u.txid === groupInputTxId){
    //         groupInputUtxo = u
    //       }
    //     })
    //   })
    //   .catch((e) => console.log(e))

    // @ts-ignore
    if (transactionInputs.length < 1){
      console.log("No utxo available for this address", contract.address)
      //return
    } else {
      transactionInputs.forEach((u, idx) => {
        console.log(u)
        // @ts-ignore
        inputVal += u.satoshis
      });
      
    }
    
    //const minerFee = parseInt(contract.bytesize)
    const minerFee = 621 // Close to min relay fee of the network.
    const dust = 546
    const change = inputVal - minerFee - dust

    console.log(
      "\n Input Value: ", inputVal,
      "\n minerFee: ", minerFee,
      "\n change: ", change,
    )

    console.log(
      "\n lokadId", lokadId,
      "\n tokenType", tokenType,
      "\n actionType", actionType,
      "\n symbol", symbol,
      "\n name", name,
      "\n documentURI", documentURI, 
      "\n documentHash", documentHash,
      "\n decimals", decimals,
      "\n initialQuantity", initialQuantity
    )

    /**
     * Reclaim funds through Trransaction builder
     */

    //await reclaimAmount(contract)

    /**
     * Reclaim funds through contract's reclaim method.
     */

    // let constructReclaim = contract.functions.reclaim(alicePk, new SignatureTemplate(alice))
    // Utxos.forEach((u, idx) => {
    //   let fee = 0;
    //   if (idx === 0){ fee = 461 }
    //   constructReclaim.to("bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0", u.satoshis - fee)
    // });
    // const tx = await constructReclaim.send()

    // const cashAddr = bitbox.ECPair.toCashAddress(alice);
    // const slpRecipient = Utils.toSlpAddress(cashAddr)

    // //const slpRecipient = Utils.toSlpAddress(contract.address)
    // console.log(cashAddr, slpRecipient)
    
    // const alicePkh = bitbox.Crypto.hash160(alicePk);

    if (groupInputUtxo) {
      const txn = contract.functions.createNFTChild(
        alicePk,
        new SignatureTemplate(alice),
        // actionType,
        // symbol,
        // name,
        // documentURI,
        // documentHash,
        // minerFee
      ).withOpReturn([
        lokadId, // Lokad ID
        tokenType, // Token type
        actionType, // Action
        symbol, // Symbol
        name, // Name
        documentURI, // Document URI
        documentHash, // Document hash
        decimals, // Decimals
        '',
        // baton,
        initialQuantity
      ])
      //txn.from(groupInputUtxo)
      transactionInputs.forEach((u, idx) => {
        txn.from(u)
      });
      txn.withHardcodedFee(minerFee)
      txn.to(slpRecipient, dust)
      //txn.to(slpRecipient, 546)
      txn.to(contract.address, change)

      let tx = await txn.send()
      //console.log('transaction details:', txn);

      console.log('transaction details:', stringify(tx));
    }

    

  }

  return (
    <div className="box column mr-2">
      <div className="title box">Genesis</div>

      <div className="field">
        <label className="label">Lokad Id</label>
        <div className="control">
            0x534c5000
            <p className="help">Tip: (0x534c5000 == SLP) (4 bytes, ascii)</p>
        </div>
      </div>

      <div className="field">
        <label className="label">Token Type</label>
        <div className="control">
          <div className="select" onChange={handleTokenChange}>
              <select>
                <option value={TokenTypes.Clild}>{TokenTypes.Clild}</option>
              </select>
            </div>
            <p className="help">Tip: (1 to 2 byte integer)</p>
        </div>
      </div>

      <div className="field">
        <label className="label">Action</label>
        <div className="control">
          <div className="select" onChange={handleActionChange}>
              <select>
                <option>{ActionTypes.GENESIS}</option>
              </select>
            </div>
            <p className="help">Tip:  (7 bytes, ascii)</p>
        </div>
      </div>

      <div className="field">
        <label className="label">Symbol</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={symbol} onChange={handleSymbolChange}/>
        </div>
        <p className="help">Example: POKE (0 to ∞ bytes, suggested utf-8)</p>
      </div>

      <div className="field">
        <label className="label">Name</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={name} onChange={handleNameChange}/>
        </div>
        <p className="help">Pokemons  (0 to ∞ bytes, suggested utf-8)</p>
      </div>

      <div className="field">
        <label className="label">Document URI</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={documentURI} onChange={handleDocumentURIChange}/>
        </div>
        <p className="help">Example: https://pokemonfaucent.com (0 to ∞ bytes, suggested ascii)</p>
        <p className="help">Tip: Can be an empty string</p>
      </div>

      <div className="field">
        <label className="label">Document Hash</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={documentHash} onChange={handleDocumentHashChange}/>
        </div>
        <p className="help">Tip: Can be an empty string (0 bytes or 32 bytes)</p>
      </div>

      <div className="field">
        <label className="label">Decimals</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={decimals} onChange={handleDecimalChange}/>
        </div>
        <p className="help">Example: 0x08 (1 byte in range 0x00-0x09)</p>
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div className="field">
        <label className="label">Baton</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={baton} onChange={handleBatonChange}/>
        </div>
        <p className="help">Example: 0x02 (0 bytes, or 1 byte in range 0x02-0xff)</p>
        <p className="help">Mint Baton is a certain characteristic of the address that has a right to issue more tokens. Some tokens can have mint baton and some not, depending on how the token creator had it configured.</p>
      </div>

      <div className="field">
        <label className="label">Initial Quantity</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={initialQuantity} onChange={handleInitialQuantityChange}/>
        </div>
        <p className="help">Example: 0x0000000005F5E100 (8 byte integer)</p>
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div className="control">
        <button onClick={handleSubmit} className="button is-primary">Submit Child Genesis</button>
      </div>

    </div>
  )
}

export default Genesis