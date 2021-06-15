import GroupGenesis from './group/genesis';
import ChildGenesis from './child/genesis';
import ChildSend from './child/send';

const NFT = () => {
  return (
    <>
      <div className="title mt-3">NFT Group</div>
      <GroupGenesis></GroupGenesis>

      <div className="title mt-4">NFT Child</div>
      <div className="columns">
        <ChildGenesis></ChildGenesis>
        <ChildSend></ChildSend>
      </div>
    </>
  )
}

export default NFT