import React, { useEffect, useState } from 'react';

const TokenTypes = {
  One: '0x01',
}

const ActionTypes = {
  GENESIS: 'GENESIS',
  MINT: 'MINT',
  SEND: 'SEND',
  COMMIT: 'COMMIT'
}

const defaulTokenId = '0xe2d82a5c2a1254184f9259c85d8501d942bbd499688ff591b2d86619bbe6eca2'
const defaultAmount = '0x0000000000010000'

const Send = () => {
  const lokadId = 0x534c5000
  const [tokenType, setTokenType] = useState(TokenTypes.One)
  const [actionType, setActionType] = useState(ActionTypes.SEND)
  const [tokenId, setTokenId] = useState(defaulTokenId)
  const [amount, setAmount] = useState(defaultAmount)

  const handleTokenChange = (event) => {
    setTokenType(event.target.value)
  }

  const handleActionChange = (event) => {
    setActionType(event.target.value)
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
      tokenId,
      amount

    )
  }

  return (
    <div className="box column mr-2">
      <div className="title has-text-centered">Send</div>

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
                <option>{ActionTypes.SEND}</option>
              </select>
            </div>
            <p className="help">Tip: (4 bytes, ascii)</p>
        </div>
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
        <label className="label">Amount</label>
        <div className="control">
          <input className="input" type="text" placeholder="Text input" value={amount} onChange={handleAmountChange}/>
        </div>
        <p className="help">Example: 0x0000000000010000 (required, 8 byte integer)</p>
        <p className="help">Tip: Include `0x` before hex value</p>
      </div>

      <div className="control">
        <button onClick={handleSubmit} className="button is-primary">Submit `Send` Transaction</button>
      </div>

    </div>
  )
}

export default Send