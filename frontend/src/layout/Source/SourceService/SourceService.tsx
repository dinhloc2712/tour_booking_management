import SourceComponent from "component/SourceComponent/SourceComponentService/SourceComponentService"
import AddSource from "modal/Source/SourceService/AddSource"

const SourceService:React.FC = () => {
    return (
        <div className="wrapper">
        <AddSource idModal="Modal Source" />
        <SourceComponent />
        </div>
    )
}

export default SourceService