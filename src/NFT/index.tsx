import Genesis from './genesis';
import Mint from './mint';
import Send from './send';

const NFT = () => {
  return (
    <>
      <div className="title mt-3">NFT</div>
      <div className="columns">
        <Genesis></Genesis>
        <Mint></Mint>
        <Send></Send>
      </div>
    </>
  )
}

export default NFT