import SourceComponent from "component/SourceComponent/SourceComponent"
import AddSource from "modal/Source/AddSource"

const Source:React.FC = () => {
    return (
        <div className="wrapper">
        <AddSource idModal="Modal Source" />
        <SourceComponent />
        </div>
    )
}

export default Source