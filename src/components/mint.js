import React, { useEffect, useState } from 'react';

import { BITBOX } from 'bitbox-sdk';
import { Contract, SignatureTemplate, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';
import path from 'path';
import { stringify } from '@bitauth/libauth';

// const tx = await contract.functions
//   .spend(alicePk, new SignatureTemplate(alice))
//   .withOpReturn([
//     '0x534c5000', // Lokad ID
//     '0x01', // Token type
//     'GENESIS', // Action
//     'PNT', // Symbol
//     'Point', // Name
//     '', // Document URI
//     '', // Document hash
//     '0x08', // Decimals
//     '0x02', // Minting baton vout
//     // '0x0000000000000001', // Initial quantity
//     '0x0000000005F5E100', // Initial quantity

//   ])
//   .to(contract.address, 546)
//   // .to(contract.address, 1000)
//   .send();

const TokenTypes = {
  One: '0x01',
}

const ActionTypes = {
  GENESIS: 'GENESIS',
  MINT: 'MINT',
  SEND: 'SEND',
  COMMIT: 'COMMIT'
}

const defaulBaton = '0x02'
const defaulTokenId = '0xe2d82a5c2a1254184f9259c85d8501d942bbd499688ff591b2d86619bbe6eca2'
const defaultAmount = '0x0000000000010000'

const Mint = () => {
  const lokadId = 0x534c5000
  const [tokenType, setTokenType] = useState(TokenTypes.One)
  const [actionType, setActionType] = useState(ActionTypes.MINT)
  const [baton, setBaton] = useState(defaulBaton)
  const [tokenId, setTokenId] = useState(defaulTokenId)
  const [amount, setAmount] = useState(defaultAmount)

  const handleTokenChange = (event) => {
    setTokenType(event.target.value)
  }

  const handleActionChange = (event) => {
    setActionType(event.target.value)
  }

  const handleBatonChange = (event) => {
    setBaton(event.target.value)
  }

  const handleTokenIdChange = (event) => {
    setTokenId(event.target.value)
  }

  const handleAmountChange = (event) => {
    setAmount(event.target.value)
  }

  const handleSubmit = () => {
    console.log(
      lokadId,
      tokenType,
      actionType,
      baton,
      tokenId,
      amount
    )
  }

  return (
    <div className="box column mr-2">
      <div className="title has-text-centered">Mint</div>

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
                <option>{ActionTypes.MINT}</option>
              </select>
            </div>
            <p className="help">Tip: (4 bytes, ascii)</p>
        </div>
      </div>

      <div className="field">
        <label className="label">Baton vout</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={baton} onChange={handleBatonChange}/>
        </div>
        <p className="help">Tip: Include `0x` before hex value. (0 bytes or 1 byte between 0x02-0xff)</p>
        <p className="help">Mint Baton is a certain characteristic of the address that has a right to issue more tokens. Some tokens can have mint baton and some not, depending on how the token creator had it configured.</p>
      </div>

      <div className="field">
        <label className="label">Token ID</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={tokenId} onChange={handleTokenIdChange}/>
        </div>
        <p className="help">Example: 0xe2d82a5c2a1254184f9259c85d8501d942bbd499688ff591b2d86619bbe6eca2 (32 bytes)</p>
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div className="field">
        <label className="label">Additional Token Quantity</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={amount} onChange={handleAmountChange}/>
        </div>
        <p className="help">Example: 0x0000000000010000 (8 byte integer)</p>
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div class="control">
        <button onClick={handleSubmit} class="button is-primary">Submit `Mint` Transaction</button>
      </div>

    </div>
  )
}

export default Mint