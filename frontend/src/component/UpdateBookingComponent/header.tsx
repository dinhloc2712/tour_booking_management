import React, { useEffect } from "react";
import { Logo } from "assets/image";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCurrentBooking, setCheckInStatus } from "redux/Reducer/Booking";


const HeaderUpdateBooking: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate('/home');
        dispatch(clearCurrentBooking());
        dispatch(setCheckInStatus(false));
    };
    return (
        <div className="HeaderUpdateBooking">
            <div className="left-header">
                <div className="logo-updatebooking">
                    <img src={Logo} alt="" width={100} />
                </div>
            </div>
            <div className="right-header">
                <div className="button-backtohome">
                    <Button className="btn-back" onClick={handleBackToHome} style={{ border: "1px solid green", color: '#000', padding: "20px 30px" }}>Trang chủ</Button>
                </div>
            </div>
        </div>
    );
}
export default HeaderUpdateBooking;