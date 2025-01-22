import React from "react";
import HeaderUpdateBooking from "component/UpdateBookingComponent/header";
import ContainerUpdateBooking from "component/UpdateBookingComponent/container";

class UpdateBooking extends React.Component {
    render() {
        return (
            <div className="UpdateBooking-Layout">
                  <HeaderUpdateBooking />
                  <ContainerUpdateBooking />
            </div>
        );
    }
}   
export default UpdateBooking;