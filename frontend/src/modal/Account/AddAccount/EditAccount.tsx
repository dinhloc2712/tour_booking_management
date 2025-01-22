import { Modal, Form, Input, Select, notification, Button, Spin, Upload, message } from 'antd';
import { RootState, useAppDispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { Staff } from 'redux/Reducer/StaffReducer';
import { useEffect, useState, useTransition } from 'react';
import { updateStaff } from 'redux/API/PUT/EditStaff';
import { getStaff } from 'redux/API/GET/GetStaff';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface EditStaffProps {
    visible: boolean;
    onClose: () => void;
}



const EditStaff: React.FC<EditStaffProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const editingStaff = useSelector((state: RootState) => state.staff.editingStaff);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const { roles, branches, error } = useSelector((state: RootState) => state.typeBranchAndRole);

    const { t } = useTranslation("Updateuser");

    useEffect(() => {
        if (editingStaff) {
            form.setFieldsValue(editingStaff);
            setPreviewImage(editingStaff.avatar);
        }
    }, [editingStaff, form]);

    const handleUpload = async (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
            message.error('Bạn chỉ có thể tải lên các tệp hình ảnh (jpeg, png, jpg, gif)!');
            return;
        }

        const cloudName = 'dpdx2qktg';
        const uploadPreset = 'upload';
        const apiKey = '878578594343584';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('api_key', apiKey);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setImageUrl(data.secure_url)
                setPreviewImage(data.secure_url);
            } else {
                message.error(`Tải lên không thành công: ${data.error.message}`);
            }
        } catch (error) {
            message.error('Tải lên hình ảnh thất bại');
        }
    };

    const handleSubmitUpdate = async (values: Staff) => {
        setLoading(true);
        try {
            if (imageUrl && imageUrl !== editingStaff?.avatar) {
                values.avatar = imageUrl;
            }

            if (editingStaff) {
                const result = await dispatch(
                    updateStaff({
                        id: editingStaff.id,
                        body: values,
                    })
                ).unwrap();
                await dispatch(getStaff()).unwrap();
                if (result) {
                    onClose();
                    notification.success({
                        message: 'Cập nhật tài khoản thành công',
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
            title={t("Updateuser.Cập nhật tài khoản")}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('Updateuser.Hủy')}
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    {loading ? <Spin size="small" /> : t('Updateuser.Cập Nhật')}
                </Button>,
            ]}
        >
            <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
                <Form.Item
                    label={t("Updateuser.Tên tài khoản")}
                    name="fullname"
                    rules={[{ required: true, message: 'Vui lòng nhập Tên tài khoản!' }]}>
                    <Input placeholder={t("Updateuser.Tên tài khoản")} />
                </Form.Item>
                <Form.Item
                    label={t("Updateuser.Tên Email")}
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập tên email!' }]}>
                    <Input type="email" placeholder={t("Updateuser.Tên Email")} />
                </Form.Item>
                <Form.Item
                    label={t("Updateuser.Số Điện Thoại")}
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                    <Input type="number" placeholder={t("Updateuser.Số Điện Thoại")} />
                </Form.Item>
                <Form.Item
                    label={t("Updateuser.Số Điện Thoại Người Thân")}
                    name="phone_relative"
                    initialValue=""
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại người thân!' }]}>
                    <Input type="number" placeholder={t("Updateuser.Số Điện Thoại Người Thân")} />
                </Form.Item>
                <Form.Item
                    label={t("Updateuser.Mật khẩu")}
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                    <Input.Password placeholder={t("Updateuser.Mật khẩu")} />
                </Form.Item>

                <div className="upload">
                    <Form.Item style={{ width: "100%" }} label="Avatar">
                        <Upload
                            style={{ width: "100%" }}
                            beforeUpload={(file) => {
                                const previewURL = URL.createObjectURL(file);
                                setPreviewImage(previewURL);
                                handleUpload(file);
                                return false;
                            }}
                            showUploadList={false}>
                            <Button style={{ width: "100%" }}>Avatar</Button>
                        </Upload>
                        {previewImage && (
                            <div style={{ marginTop: "10px", textAlign: "center" }}>
                                <img src={previewImage} alt="Avatar Preview" style={{ maxWidth: "100%", height: "auto", borderRadius: "5px" }} />
                            </div>
                        )}
                    </Form.Item>
                </div>

                <Form.Item
                    label={t("Updateuser.Chi Nhánh")}
                    name="branch_id"
                    rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}>
                    <Select placeholder="Chọn Chi Nhánh">
                        {branches.map((branch) => (
                            <Select.Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t("Updateuser.Phân Quyền")}
                    name="roles"
                    rules={[{ required: true, message: "Vui lòng chọn phân quyền" }]}>
                    <Select placeholder="Phân Quyền">
                        {roles.map((role) => (
                            <Select.Option key={role} value={role}>
                                {role}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditStaff;
