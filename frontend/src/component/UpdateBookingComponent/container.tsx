import React, { useState } from "react";
import UpdateBookingDetailComponent from "./containerComponents/UpdateBookingDetailComponent";



const ContainerUpdateBooking: React.FC = () => {

    return (
        <div className="UpdateBookingContainer">
            <UpdateBookingDetailComponent />
        </div>
    );
};

export default ContainerUpdateBooking;
