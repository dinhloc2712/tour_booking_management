import { Modal, Form, Input, Select, notification, Button, Spin } from 'antd';
import { RootState, useAppDispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { Service } from 'redux/Reducer/ServiceReducer';
import { useEffect, useState } from 'react';
import { updateService } from 'redux/API/PUT/EditService';
import { getService } from 'redux/API/GET/getService/GetService';
import { useTranslation } from 'react-i18next';

interface EditServiceProps {
    visible: boolean;
    onClose: () => void;
}

const initialState: Service = {
    name: '',
    price: '',
    description: '',
    is_active: false,
    type: '',
    id: '',
};

const EditService: React.FC<EditServiceProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const serviceType = useSelector((state: RootState) => state.typeService.types);
    const editingService = useSelector((state: RootState) => state.service.editingService);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingService) {
            form.setFieldsValue(editingService);
        }
    }, [editingService, form]);

    const { t } = useTranslation('UpdateService'); 
    const handleSubmitUpdate = async (values: Service) => {
        setLoading(true);
        try {
            if (editingService) {
                const result = await dispatch(
                    updateService({
                        id: editingService.id,
                        body: values,
                    })
                ).unwrap();
                await dispatch(getService()).unwrap();
                if (result) {
                    onClose(); // Close modal on success
                    notification.success({
                        message: "Cập nhật dịch vụ thành công",
                    });
                }
            }
        } catch (error: any) {
            notification.error({
                message: 'Cập nhật thất bại',
                description: error.message || 'Đã xảy ra lỗi',
            });
        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    };

    return (
        <Modal
            open={visible}
            title={t('UpdateService.Cập nhật Dịch vụ')}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                   {t('UpdateService.Hủy')}
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    {loading ? <Spin size="small" /> : t('UpdateService.Cập Nhật')}
                </Button>,
            ]}
        >
            
            <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
                <Form.Item
                    label={t('UpdateService.Tên Dịch Vụ')}
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập Tên dịch vụ!' }]}>
                    <Input placeholder={t('UpdateService.Tên Dịch Vụ')} />
                </Form.Item>
                <Form.Item
                    label={t('UpdateService.Giá Dịch Vụ')}
                    name="price"
                    rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ!' }]}
                >
                    <Input type="number" placeholder={t('UpdateService.Giá Dịch Vụ')} />
                </Form.Item>
                <Form.Item
                    label={t('UpdateService.Mô tả dịch vụ')}
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả dịch vụ!' }]}
                >
                    <Input.TextArea rows={4} placeholder={t('UpdateService.Mô tả dịch vụ')} />
                </Form.Item>
                <Form.Item label={t('UpdateService.Loại dịch vụ')} name="type" rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ!' }]}>
                    <Select placeholder="Chọn loại dịch vụ">
                        {serviceType.map((type) => (
                            <Select.Option key={type} value={type}>
                                {type}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditService;