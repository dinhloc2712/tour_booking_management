import { Button, Modal, Form, notification } from "antd";
import FormComponent from "component/Global/Form/FormComponent";
import { useSelector } from "react-redux"
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";
import { useEffect, useState } from "react";
import { getTypeSource } from "redux/API/GET/GetTypeSource";
import { SourceAgent } from "redux/Reducer/SourceReducerAgent";
import { addSourceAgent } from "redux/API/POST/PostSourceAgent";
import { getSourceAgent } from "redux/API/GET/GetSourceAgent";
import { useTranslation } from "react-i18next";

interface CustomModalProps {
    idModal: any
}
const initialState: SourceAgent = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'Chọn Loại',
    is_active: true
}

const AddSourceAgent: React.FC<CustomModalProps> = ({ idModal }) => {
    const dispatch = useAppDispatch();
    const showModalService = useSelector((state: RootState) => state.modal.modals[idModal]);
    const [form] = Form.useForm();
    const types = useSelector((state: RootState) => state.typeSource.types);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        dispatch(getTypeSource());
    }, [dispatch]);
    
    const { t } = useTranslation('Addsource'); 
    const formfeilds = [
        {
            label: t('Addsource.Tên Nguồn'),
            name: 'name',
            id: 'name',
            placeholder: t('Addsource.Tên Nguồn'),
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
            label: t('Addsource.Số Điện Thoại'),
            name: 'phone',
            id: 'phone',
            placeholder: t('Addsource.Số Điện Thoại'),
            type: 'text'
        },
        {
            label: t('Addsource.Địa Chỉ'),
            name: 'address',
            id: 'address',
            placeholder: t('Addsource.Địa Chỉ'),
            type: 'text'
        },
        {
            label: t('Addsource.Loại'),
            name: 'type',
            placeholder: t('Addsource.Chọn loại'),
            type: 'select',
            id: 'type',
            options: types.map(type => ({
                value: type,
                label: type
            }))
        },
    ];


    const handleFinish = async (values: SourceAgent) => {
        setLoading(true);
        try {
            const result = await dispatch(addSourceAgent(values)).unwrap();
            if (result) {
                form.resetFields();
                handleCancelModalService();
                notification.success({
                    message: 'Thêm dữ liệu thành công'
                });
                await dispatch(getSourceAgent()).unwrap();
            }
        } catch (err) {
            console.log('Error:', err);
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
            title={t('Addsource.Thêm Nguồn')}
            footer={[
                <Button key="cancel" onClick={handleCancelModalService}>
                    {t('Addsource.Hủy')}
                </Button>,
                <Button key="submit" type="primary" htmlType="submit" form="source-form" loading={loading}>
                    {t('Addsource.Thêm Mới')}
                </Button>
            ]}
        >
            <Form
                id="source-form"
                form={form}
                style={{ marginTop: "20px" }}
                name="basic"
                autoComplete="off"
                onFinish={handleFinish}
                initialValues={initialState}
            >
                <FormComponent fields={formfeilds} />
            </Form>
        </Modal>
    );
};

export default AddSourceAgent;

