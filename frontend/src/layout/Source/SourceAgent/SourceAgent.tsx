import SourceComponent from "component/SourceComponent/SourceComponentAgent/SourceComponentAgent"
import AddSourceAgent from "modal/Source/SourceAgent/AddSource"

const SourceAgent:React.FC = () => {
    return (
        <div className="wrapper">
        <AddSourceAgent idModal="Modal Source" />
        <SourceComponent />
        </div>
    )
}

export default SourceAgent