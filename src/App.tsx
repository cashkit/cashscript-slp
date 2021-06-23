
import NFT from './nft';
import SLP from './tokens';

import './App.css'
import "../node_modules/bulma/bulma.sass";
import './App.sass'

function App() {
  return (
    <div className="App">
      <header className="App-header">
          Tokens on Bitcoin Cash(BCH)
      </header>
      <div className="p-6">
        <SLP></SLP>
        {/* <NFT></NFT> */}
      </div>
    </div>
  );
}

export default App;
