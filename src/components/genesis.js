import React, { useEffect, useState } from 'react';

import { BITBOX } from 'bitbox-sdk';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import path from 'path';
import { stringify } from '@bitauth/libauth';
import { getAliceWallet, getBobWallet, getContract } from './wallet';

const bitbox = new BITBOX();

const TokenTypes = {
  One: '0x01',
}

const ActionTypes = {
  GENESIS: 'GENESIS',
  MINT: 'MINT',
  SEND: 'SEND',
  COMMIT: 'COMMIT'
}

const defaultSymbol = 'POKE'
const defaultName = 'Pokemon'
const defaultDocumentURI = ' '
const defaulDocumentHash = 'CE114E4501D2F4E2DCEA3E17B546F339'
const defaultDecimals = '0x08'
const defaulBaton = '0x02'
const defaultInitialQuantity = '0x0000000005F5E100'

const Genesis = () => {
  const lokadId = '0x534c5000'
  const [tokenType, setTokenType] = useState(TokenTypes.One)
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
    const contract = await getContract()
    console.log(contract)
    const [alice, alicePk] = getAliceWallet()
    const bob = getBobWallet()


      //const utxosRes = await bitbox.Address.utxo("qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0")
      const utxosRes = await bitbox.Address.utxo(contract.address)
      //   .then((res) => console.log(res))
      //   .catch((e) => console.log(e))
    
      if (utxosRes.utxos.length < 1){
        console.log("No utxo available for this address", contract.address)
        return
      }
      const inputVal = utxosRes.utxos[0].satoshis
      //const minerFee = parseInt(contract.bytesize)
      const minerFee = 941 // Close to min relay fee of the network.
      const change = inputVal - minerFee

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
        "\n baton", baton,
        "\n initialQuantity", initialQuantity
      )
  

      // const tx = await contract.functions
      // .spend(alicePk, new SignatureTemplate(alice))
      // .to("bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0", change)
      // .send()

    const tx = await contract.functions
      .createPokemonSLP(
        alicePk,
        new SignatureTemplate(alice),
        actionType,
        symbol,
        name,
        documentURI,
        documentHash,
        minerFee
      ).withOpReturn([
        lokadId, // Lokad ID
        tokenType, // Token type
        actionType, // Action
        symbol, // Symbol
        name, // Name
        documentURI, // Document URI
        documentHash, // Document hash
        decimals, // Decimals
        baton, // Minting baton vout
        initialQuantity, // Initial quantity
      ])
      .withHardcodedFee(minerFee)
      .to(contract.address, change)
      .send();
    
    console.log('transaction details:', stringify(tx));

  }

  return (
    <div className="box column mr-2">
      <div className="title has-text-centered">Genesis</div>

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
                <option value={TokenTypes.One}>{TokenTypes.One}</option>
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
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div className="field">
        <label className="label">Initial Quantity</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={initialQuantity} onChange={handleInitialQuantityChange}/>
        </div>
        <p className="help">Example: 0x0000000005F5E100 (8 byte integer)</p>
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div class="control">
        <button onClick={handleSubmit} class="button is-primary">Submit Genesis</button>
      </div>

    </div>
  )
}

export default Genesis