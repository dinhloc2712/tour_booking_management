import { Button, Modal, Form, notification } from "antd";
import FormComponent from "component/Global/Form/FormComponent";
import { useSelector } from "react-redux"
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";
import { Service } from "redux/Reducer/ServiceReducer";
import { addService } from "redux/API/POST/PostService";
import { useEffect, useState } from "react";
import { getTypeService } from "redux/API/GET/GetTypeService";
import { getService } from "redux/API/GET/getService/GetService";
import { useTranslation } from "react-i18next";

interface CustomModalProps {
    idModal: any;
}

const initialState: Service = {
    id: '',
    name: '',
    price: '',
    description: '',
    type: 'Chọn Loại',
    is_active: true
}

const AddService: React.FC<CustomModalProps> = ({ idModal }) => {
    const dispatch = useAppDispatch();

    const showModalService = useSelector((state: RootState) => state.modal.modals[idModal]);
    const [form] = Form.useForm();
    const types = useSelector((state: RootState) => state.typeService.types);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getTypeService());
    }, [dispatch]);

    const { t } = useTranslation('AddService'); 
    const formfeilds = [
        {
            label: t('AddService.Tên Dịch Vụ'),
            name: 'name',
            placeholder: t('AddService.Tên Dịch Vụ'),
            type: 'text',
            id: 'name',
        },
        {
            label: t('AddService.Giá Dịch Vụ'),
            name: 'price',
            placeholder: t('AddService.Giá Dịch Vụ'),
            type: 'number',
            id: 'price'
        },
        {
            label: t('AddService.Mô tả dịch vụ'),
            name: 'description',
            placeholder: t('AddService.Mô tả dịch vụ'),
            type: 'text',
            id: 'description'
        },
        {
            label: t('AddService.Loại'),
            name: 'type',
            placeholder: 'Chọn loại',
            type: 'select',
            id: 'type',
            options: types.map(type => ({
                value: type,
                label: type
            }))
        },

    ];

    const handleFinish = async (values: Service) => {
        setLoading(true);
        try {
            const result = await dispatch(addService(values)).unwrap();
            if (result) {
                form.resetFields();
                handleCancelModalService();
                notification.success({
                    message: 'Thêm dữ liệu thành công'
                });
                await dispatch(getService()).unwrap();
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
            title={t('AddService.Thêm Dịch Vụ')}
            footer={[
                <Button key="cancel" onClick={handleCancelModalService}>
                    {t('AddService.Hủy')}
                </Button>,
                <Button key="submit" type="primary" htmlType="submit" form="service-form" loading={loading}>
                    {t('AddService.Thêm Mới')}
                </Button>
            ]}
        >
            <Form
                id="service-form"
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

export default AddService; 