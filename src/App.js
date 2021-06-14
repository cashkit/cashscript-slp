
// import SLP from './Tokens';
import NFT from './NFT';

import './App.css'
import "../node_modules/bulma/bulma.sass";
import './App.sass'

function App() {
  return (
    <div className="App">
      <header className="App-header">
          Tokens on Bitcoin Cash(BCH)
      </header>
      <body className="container ">
        {/* <SLP></SLP> */}
        <NFT></NFT>
      </body>
    </div>
  );
}

export default App;
