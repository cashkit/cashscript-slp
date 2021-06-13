import logo from './logo.svg';
import Genesis from './components/genesis';
import Mint from './components/mint';
import Send from './components/send';
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
        <div className="title mt-3">SLP</div>
        <div className="columns">
          <Genesis></Genesis>
          <Mint></Mint>
          <Send></Send>
        </div>
      </body>
    </div>
  );
}

export default App;
