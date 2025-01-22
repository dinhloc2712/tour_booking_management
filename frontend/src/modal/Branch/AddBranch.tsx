import { Button, Form, Modal, notification } from "antd";
import FormComponent from "component/Global/Form/FormComponent";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getBranchList } from "redux/API/GET/GetBranch";
import { getTypeBranch } from "redux/API/GET/GetTypeBranch";
import { addBranch } from "redux/API/POST/PostBranch";
import { Branch } from "redux/Reducer/BranchReducer";
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

interface CustomModalProps {
    idModal: any;
}

const initialState: Branch = {
    id: '',
    name: '',
    type: 'Chọn Loại'
}

const AddBranch: React.FC<CustomModalProps> = ({ idModal }) => {
    const dispatch = useAppDispatch();
    const showModalService = useSelector((state: RootState) => state.modal.modals[idModal]);
    const [form] = Form.useForm();
    const types = useSelector((state: RootState) => state.typeBrach.types);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getTypeBranch());
    }, [dispatch]);

    const { t } = useTranslation('AddBranch');
    const formFields = [
        {
            label: t('AddBranch.Tên Chi Nhánh'),
            name: 'name',
            placeholder: t('AddBranch.Tên Chi Nhánh'),
            type: 'text',
            id: 'name',
        },
        {
            label: t('AddBranch.Loại'),
            name: 'type',
            placeholder: 'Chọn loại',
            type: 'select',
            id: 'type',
            options: types.map(type => ({
                value: type,
                label: type
            })),
        },
    ];

    const handleFinish = async (values: Branch) => {
        setLoading(true);
        try {
            const result = await dispatch(addBranch(values)).unwrap();
            if (result) {
                form.resetFields();
                handleCancelModalService();
                notification.success({
                    message: 'Thêm dữ liệu thành công'
                });
                await dispatch(getBranchList()).unwrap();
            }
        } catch (err) {
            notification.error({
                message: 'Thêm dữ liệu thất bại',
                description: err.message || 'Có lỗi xảy ra.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelModalService = () => {
        dispatch(hideModal(idModal));
    };

    return (
        <Modal
            open={showModalService}
            title={t('AddBranch.Thêm Chi Nhánh')}
            footer={[
                <Button key="cancel" onClick={handleCancelModalService}>
                    {t('AddBranch.Hủy')}
                </Button>,
                <Button key="submit" type="primary" htmlType="submit" form="branch-form" loading={loading}>
                    {t('AddBranch.Thêm Mới')}
                </Button>
            ]}
        >
            <Form
                id="branch-form"
                form={form}
                style={{ marginTop: "20px" }}
                name="basic"
                autoComplete="off"
                onFinish={handleFinish}
                initialValues={initialState}
            >
                <FormComponent fields={formFields} />
            </Form>
        </Modal>
    );
};
export default AddBranch; // Xuất component
