import { Button, Form, Input, Modal } from "antd"
import FormComponent from "component/Global/Form/FormComponent"
import { useDispatch, useSelector } from "react-redux"
import { hideModal } from "redux/Redux/modal/modalSlice"
import { RootState } from "redux/store"

interface FormType {
    id: number,
    name: string,
    email: string,
    phone: string,
    address: string,
    type: string,
    status: number
}

interface CustomModalProps {
    idModal: any
}

const formfeilds = [
    {
        label: 'Tên Chi Nhánh',
        name: 'name',
        id: 'name',
        placeholder: 'Tên Nguồn',
        type: 'text'
    },
    {
        label: 'Email',
        name: 'email',
        id: 'email',
        placeholder: 'Email',
        type: 'text'
    },
    {
        label: 'Số Điện Thoại',
        name: 'phone',
        id: 'phone',
        placeholder: 'Số điện thoại',
        type: 'text'
    },
    {
        label: 'Địa Chỉ',
        name: 'address',
        id: 'address',
        placeholder: 'Địa chỉ',
        type: 'text'
    },
    {
        label: 'Loại',
        name: 'type',
        id: 'type',
        placeholder: 'Loại',
        type: 'text'
    },
    {
        label: 'Trạng Thái',
        name: 'status',
        id: 'status',
        placeholder: 'Trạng thái',
        type: 'text'
    },
];

const AddSource: React.FC<CustomModalProps> = ({ idModal }) => {

    const dispatch = useDispatch();
    const showModalSource = useSelector((state: RootState) => state.modal.modals[idModal])
    const handleCancelModalSource = () => {
        dispatch(hideModal(idModal))
    }
    return (
        <>
            <Modal
                open={showModalSource}
                title="Thêm Nguồn"
                footer={[
                    <Button key="back" onClick={() => handleCancelModalSource()}>
                        Hủy
                    </Button>,
                    <Button key="back" type="primary" style={{
                        background: "green",
                    }}>
                        Thêm Mới
                    </Button>
                ]}
            >
                <Form<FormType>
                    style={{ marginTop: "20px" }}
                    name="basic"
                    autoComplete="off"
                >
                  <FormComponent fields={formfeilds} />
                </Form>
            </Modal>
        </>
    )
}

export default AddSource