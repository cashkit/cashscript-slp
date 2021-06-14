import Genesis from './genesis';
import Mint from './mint';
import Send from './send';

const SLP = () => {
  return (
    <>
      <div className="title mt-3">SLP</div>
      <div className="columns">
        <Genesis></Genesis>
        <Mint></Mint>
        <Send></Send>
      </div>
    </>
  )
}

export default SLP