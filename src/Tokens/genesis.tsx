import React, { useEffect, useState, useRef } from 'react';

import { BITBOX } from 'bitbox-sdk';
import { SignatureTemplate } from 'cashscript';
import { stringify } from '@bitauth/libauth';
import { getUserWallet } from '../wallet';
import { getSLPContract } from '../contracts';
import { Signer } from '../utils';
import { Utils } from 'slpjs';
import { hexToBin, binToHex, utf8ToBin } from '@bitauth/libauth'


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

const defaultSymbol = 'MULTIOP'
const defaultName = 'Multiop'
const defaultDocumentURI = ' '
const defaulDocumentHash = 'CE114E4501D2F4E2DCEA3E17B546F339'
const defaultDecimals = '0x08'
const defaulBaton = '0x02'
const defaultInitialQuantity = '0x000000E8D4A51000'
//const defaultInitialQuantity = '100000000'


const useContract = (userPkh) => {
  const [ contract, setContract ] = useState();
  const [ amount, setInputAmount ] = useState(0)
  useEffect( () => {
    const makeCall = async () => {
      getSLPContract(userPkh).then(async (res) => {
        setContract(res)
        let amount = 0
        const Utxos = await res.getUtxos()
        // @ts-ignore
        if (Utxos.length < 1){
          console.log("No utxo available for this address", res.address)
          //return
        } else {
          Utxos.sort((a, b) => b.satoshis - a.satoshis)
          // @ts-ignore
          Utxos.forEach((u, idx) => {
            console.log(u)
            amount += u.satoshis
          });
          setInputAmount(amount)
        }
        })
      
    }
    makeCall()
  }, [])
  
  return [contract, amount]
}

const Genesis = () => {
  const myString = "m";
  const encoded = new Buffer(myString).toString('hex');
  console.log(encoded)

  console.log('0x534c5000'.substring(2))
  const lokadhtb = hexToBin('0x534c5000'.substring(2))
  console.log(lokadhtb)


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
  const [ metaData, setMetaData ] = useState("Metadata:")
  const [ tx, setTx ] = useState("")

  const [ user, userPk, userPkh ] = getUserWallet()
  const [ contract, amount ] = useContract(userPk)

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

  const reclaim = async () => {
    const minerFee = 559 // Close to min relay fee of the network.
    const change = amount - minerFee

    setMetaData(`Values in sats: Input Amount: ${amount}, Miner Fee: ${minerFee} change: ${change}`)

    const tx = await contract.functions
    .reclaim(userPk, new SignatureTemplate(user))
    .to("bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0", change)
    .send()

    setTx("Tx status: ", JSON.stringify(tx))
  }

  const handleSubmit = async () => {

    const minerFee = 1225 // Close to min relay fee of the network.
    const dust = 546
    const change = amount - minerFee - dust
    setMetaData(`Values in sats: Input Amount: ${amount}, Miner Fee: ${minerFee} change: ${change}`)


    console.log(
      "\n Input Value: ", amount,
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

    const signer = new Signer(user);

    const signerMessage = signer.createSingleMessage(0x534c5000);
    const signerSignature = signer.signMessage(signerMessage);


    const cashAddr = bitbox.ECPair.toCashAddress(user);
    const slpRecipient = Utils.toSlpAddress(cashAddr)
    
    // const reclaimAddr = 'bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0'

    const strr = 'BCH is AWESOME'


    const lokadIdBin = hexToBin(lokadId.substring(2))
    const tokenTypeBin = hexToBin(tokenType.substring(2))
    const decimalsBin = hexToBin(decimals.substring(2))
    const batonBin = hexToBin(baton.substring(2))
    const initialQuantityBin = hexToBin(initialQuantity.substring(2))
    
    const tx = await contract.functions
      .createToken(
        userPk,
        new SignatureTemplate(user),
        userPkh,
        lokadIdBin,
        tokenTypeBin,
        actionType,
        symbol,
        name,
        documentURI,
        documentHash,
        decimalsBin,
        batonBin,
        initialQuantityBin,
        minerFee,
      ).withOpReturn([
        lokadId,
        tokenType,
        actionType,
        symbol,
        name,
        documentURI,
        documentHash,
        decimals,
        baton,
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
    // // .meep();
    

    console.log('transaction details:', stringify(tx));

  }

  return (
    <div className="box column mr-2 tile is-ancestor is-vertical">
      <div className="title is-parent has-text-centered">Genesis</div>
  
      <div className="tile is-parent">
        <div className="tile is-child">
          <label className="label">Lokad Id</label>
          <div className="control">
              0x534c5000
              <p className="help">Tip: (0x534c5000 == SLP) (4 bytes, ascii)</p>
          </div>
        </div>

        <div className="tile is-child">
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

        <div className="tile is-child">
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


        <div className="tile is-child">
          <label className="label">Symbol</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={symbol} onChange={handleSymbolChange}/>
          </div>
          <p className="help">Example: POKE (0 to ∞ bytes, suggested utf-8)</p>
        </div>
      </div>

      <div className="tile is-parent">

        <div className="tile is-child pr-1">
          <label className="label">Name</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={name} onChange={handleNameChange}/>
          </div>
          <p className="help">Pokemons  (0 to ∞ bytes, suggested utf-8)</p>
        </div>

        <div className="tile is-child pr-1 pl-1">
          <label className="label">Decimals</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={decimals} onChange={handleDecimalChange}/>
          </div>
          <p className="help">Example: 0x08 (1 byte in range 0x00-0x09)</p>
          <p className="help">Tip: Include `0x` before hex value</p>
        </div>

        <div className="tile is-child pr-1 pl-1">
          <label className="label">Baton</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={baton} onChange={handleBatonChange}/>
          </div>
          <p className="help">Example: 0x02 (0 bytes, or 1 byte in range 0x02-0xff)</p>
          <p className="help">Tip: Mint Baton is a certain characteristic of the address that has a right to issue more tokens. Some tokens can have mint baton and some not, depending on how the token creator had it configured.</p>

        </div>

        <div className="tile is-child pl-1">
          <label className="label">Initial Quantity</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={initialQuantity} onChange={handleInitialQuantityChange}/>
          </div>
          <p className="help">Example: 0x0000000005F5E100 (8 byte integer)</p>
          <p className="help">Tip: Include `0x` before hex value</p>
        </div>
      </div>

      <div className="tile is-parent is-vertical">
        <div className="tile is-child pl-1">
          <label className="label">Document URI</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={documentURI} onChange={handleDocumentURIChange}/>
          </div>
          <p className="help">Example: https://pokemonfaucent.com (0 to ∞ bytes, suggested ascii)</p>
          <p className="help">Tip: Can be an empty string</p>
        </div>

        <div className="tile is-child pl-1">
          <label className="label">Document Hash</label>
          <div className="control">
            <input className="input" type="text" placeholder="Text input" value={documentHash} onChange={handleDocumentHashChange}/>
          </div>
          <p className="help">Tip: Can be an empty string (0 bytes or 32 bytes)</p>
        </div>

        <div className="tile is-child pl-1">
          <label className="label">Metadata</label>
          <div className="control">
            <p className="content">{metaData}</p>
          </div>
        </div>

      </div>

      <div className="tile is-parent">
        <label className="label">Contract Addr: </label>
          <div className="content pl-3">
            <div>{contract?.address}</div>
          </div>
          <a  target="_" href={`https://explorer.bitcoin.com/bch/address/${contract?.address}`} className="content pl-3">
            Explorer 👀
          </a>
      </div>

      <div className="tile is-parent">
        <button onClick={handleSubmit} className="button is-primary">Submit Genesis</button>
        <button onClick={reclaim} className="ml-6 button has-text-danger-dark	">Reclaim Transaction</button>
      </div>

      <div className="tile is-parent">
        <label className="label">Tx Info</label>
        <div className="control">
        <p className="content">{tx}</p>
        </div>
      </div>

    </div>
  )
}

export default Genesis