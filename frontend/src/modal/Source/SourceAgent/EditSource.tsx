import { Modal, Form, Input, Select, notification, Button, Spin } from 'antd';
import { RootState, useAppDispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { SourceAgent } from 'redux/Reducer/SourceReducerAgent';
import { updateSourceAgent } from 'redux/API/PUT/EditSourceAgent';
import { getSourceAgent } from 'redux/API/GET/GetSourceAgent';
import { useTranslation } from 'react-i18next';


interface EditSourceProps {
    visible: boolean;
    onClose: () => void;
}

const initialState: SourceAgent = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'Chọn Loại',
    is_active: true
};

const EditSourceAgent: React.FC<EditSourceProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const typeSource = useSelector((state: RootState) => state.typeSource.types);
    const editingSource = useSelector((state: RootState) => state.sourceAgent.editingSource);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingSource) {
            form.setFieldsValue(editingSource);
        }
    }, [editingSource, form]);

    const { t } = useTranslation('Updatesource'); 
    const handleSubmitUpdate = async (values: SourceAgent) => {
        setLoading(true);
        try {
            if (editingSource) {
                const result = await dispatch(
                    updateSourceAgent({
                        id: editingSource.id,
                        body: values,
                    })
                ).unwrap();
                await dispatch(getSourceAgent()).unwrap();
                if (result) {
                    onClose();
                    notification.success({
                        message: "Cập nhật nguồn thành công",
                    });
                }
            }
        } catch (error: any) {
            notification.error({
                message: 'Cập nhật thất bại',
                description: error.message || 'Đã xảy ra lỗi',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title={t('Updatesource.Cập Nhật Nguồn')}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                   {t('Updatesource.Hủy')}
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    {loading ? <Spin size="small" /> : t('Updatesource.Cập Nhật')}
                </Button>,
            ]}
        >
            <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
                <Form.Item label={t('Updatesource.Tên Nguồn')} name="name" rules={[{ required: true, message: 'Vui lòng nhập Tên nguồn!' }]}>
                    <Input placeholder={t('Updatesource.Tên Nguồn')} />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập Tên email!' }]}>
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item label={t('Updatesource.Số Điện Thoại')} name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                    <Input placeholder={t('Updatesource.Số Điện Thoại')} />
                </Form.Item>
                <Form.Item label={t('Updatesource.Địa Chỉ')} name="address" rules={[{ required: true, message: 'Vui lòng nhập tên địa chỉ!' }]}>
                    <Input placeholder={t('Updatesource.Địa Chỉ')} />
                </Form.Item>
                <Form.Item label={t('Updatesource.Loại Nguồn')} name="type" rules={[{ required: true, message: 'Vui lòng chọn loại nguồn!' }]}>
                    <Select placeholder="Chọn loại nguồn">
                        {typeSource.map((type) => (
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

export default EditSourceAgent;
