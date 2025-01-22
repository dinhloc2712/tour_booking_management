import TourComponent from "component/TourComponent/TourComponent"
import AddTour from "modal/Tour/AddTour"

const Tour:React.FC = () => {
    return (
        <div className="wrapper">
        <AddTour idModal="Modal Tour"/>
        <TourComponent />
        </div>
    )
}

export default Tour