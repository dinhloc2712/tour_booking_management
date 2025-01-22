import BranchComponent from "component/BranchComponent/BranchComponent"
import AddBranch from "modal/Branch/AddBranch"

const Branch: React.FC = () => {
  return (
    <>
      <BranchComponent />
      <AddBranch idModal="Modal Branch" />
    </>
  )
}

export default Branch