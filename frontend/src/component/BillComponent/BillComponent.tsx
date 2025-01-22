import { Button, Modal } from "antd";
import { useSelector } from "react-redux";
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

interface CustomModalProps {
    idModal: any;
}
const BillComponent: React.FC<CustomModalProps> = ({ idModal }) => {
    const dispatch = useAppDispatch();
    const showModalBill = useSelector((state: RootState) => state.modal.modals[idModal]);
    const handleCancelModalBill = () => {
        dispatch(hideModal(idModal));
    };
    return (
        <>
            <Modal
                title="Add New Tour"
                open={showModalBill}
                onCancel={handleCancelModalBill}
                footer={[
                    <Button key="cancel" onClick={handleCancelModalBill}>
                        Hủy
                    </Button>,
                    <Button key="submit">
                        Thanh Toán
                    </Button>
                ]}
            >
            </Modal>
        </>
    )
}

export default BillComponent