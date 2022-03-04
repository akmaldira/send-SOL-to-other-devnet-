import './App.css';
import { useState } from 'react';
const solanaWeb3 = require('@solana/web3.js');


function App() {

  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [pubKey, setPubKey] = useState()

  const get_provider = () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
  };

  const getBalance = async(publicKey) => {
      let connection = new solanaWeb3.Connection(
          solanaWeb3.clusterApiUrl('devnet'),
          'confirmed'
      );
      const balance = await connection.getBalance(publicKey)
      .then(res => {
          setBalance(res / solanaWeb3.LAMPORTS_PER_SOL)
      })
  }

  const connectWallet = async() => {
      try {
        get_provider().connect()
        .then(res => {
            setPubKey(res.publicKey)
            setAddress(res.publicKey.toString())
            getBalance(res.publicKey)
        })
      } catch (err) {
        
      }
  }

  const disconnectWallet = async() => {
      get_provider().disconnect()
      .then(res => {
          setAddress(null)
          setBalance(null)
      })
  }

  const sendSol = async() => {
      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('devnet'),
        'confirmed'
      )
      const receiveWallet = new solanaWeb3.PublicKey(document.getElementById('input-address').value);
      const jumlah = document.getElementById('input-jumlah').value
      const transaction = new solanaWeb3.Transaction().add(
          solanaWeb3.SystemProgram.transfer({
              fromPubkey: pubKey || receiveWallet,
              toPubkey: receiveWallet,
              lamports: jumlah * solanaWeb3.LAMPORTS_PER_SOL
          })
      )
      transaction.feePayer = pubKey
      const blockhastObj = await connection.getRecentBlockhash();
      transaction.recentBlockhash = await blockhastObj.blockhash
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature)
      const _balance = await connection.getBalance(pubKey)
      .then(res => {
          setBalance(res / solanaWeb3.LAMPORTS_PER_SOL)
      })
  }

  const clickHandle = async() => {
      if (await window.solana.isConnected){
          disconnectWallet();
      }
      else{
        connectWallet()
      }
  }

  return (
    <div className="App">
        <h4>First</h4>
        <button onClick={clickHandle}>{window.solana.isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}</button>
        <p>address: {address}</p>
        <p>balance: {balance}</p>
        <br />
        <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', rowGap: '1rem'}}>
            <input id='input-address' type='text' placeholder='Address' style={{textAlign: 'center'}} />
            <input id='input-jumlah' type='number' placeholder='Jumlah' style={{textAlign: 'center'}} />
            <button onClick={sendSol}>Send SOL</button>
        </div>
    </div>
  );
}

export default App;
