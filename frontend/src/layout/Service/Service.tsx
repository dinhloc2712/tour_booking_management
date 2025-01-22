import ServiceComponent from "component/ServiceComponent/ServiceComponent"
import AddService from "modal/Service/AddService"

const Service: React.FC = () => {
    return (
        <div className="wrapper">
            <AddService idModal="Modal Service" />
            <ServiceComponent />
        </div>
    )
}

export default Service