import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Select, Input, message, notification, Upload, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { hideModal } from 'redux/Redux/modal/modalSlice';
import { RootState, useAppDispatch } from 'redux/store';
import { Staff, startEditingStaff } from 'redux/Reducer/StaffReducer';
import { updateStaff } from 'redux/API/PUT/EditStaff';
import { getStaff } from 'redux/API/GET/GetStaff';
import { fetchBranchRoleData } from 'redux/Reducer/TypeCustomerReducer';

interface FormType {
    id: number;
    branch_id: string;
    fullname: string;
    email: string;
    phone: string;
    phone_relative: string;
    avatar: string;
    status: string;
}

const DetailAccount: React.FC = () => {
    const isVisible = useSelector((state: RootState) => state.modal.modals['Modal Detail Account']);
    const [userData, setUserData] = useState<FormType | null>(null);
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const editingStaff = useSelector((state: RootState) => state.staff.editingStaff);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const { roles, branches, error } = useSelector((state: RootState) => state.typeBranchAndRole);

    useEffect(() => {
        dispatch(fetchBranchRoleData());
    }, [dispatch]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);  // Parse thông tin người dùng từ localStorage
            setUserData({
                id: parsedUser.id, // Lấy user_id
                branch_id: parsedUser.branch_id || 'Unknown Branch',
                fullname: parsedUser.fullname,
                email: parsedUser.email,
                phone: parsedUser.phone,
                phone_relative: parsedUser.phone_relative,
                avatar: parsedUser.avatar || 'default-avatar-url',
                status: parsedUser.status || 'Active',
            });
    
            form.setFieldsValue({
                fullname: parsedUser.fullname,
                email: parsedUser.email,
                avatar: parsedUser.avatar,
                status: parsedUser.status,
                branch_id: parsedUser.branch_id,
            });
            setPreviewImage(parsedUser.avatar || 'default-avatar-url');
        }
    }, [form, editingStaff]);
    

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
                setImageUrl(data.secure_url);
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
            // Lấy thông tin người dùng từ localStorage
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                notification.error({
                    message: 'Không tìm thấy thông tin người dùng',
                    description: 'Vui lòng đăng nhập lại.',
                });
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            const userId = parsedUser.id; // Lấy ID người dùng từ localStorage

            if (!editingStaff) {
                notification.error({
                    message: 'Không tìm thấy nhân viên để cập nhật',
                    description: 'Vui lòng chọn nhân viên để chỉnh sửa.',
                });
                return;
            }

            // Kiểm tra nếu có sự thay đổi trong các trường dữ liệu
            const hasChanges = Object.keys(values).some((key) => {
                return values[key] !== editingStaff[key]; 
            });

            if (!hasChanges) {
                notification.info({
                    message: 'Không có thay đổi nào',
                    description: 'Không có dữ liệu nào thay đổi để cập nhật.',
                });
                return; // Dừng lại nếu không có thay đổi
            }

            // Nếu có thay đổi, gửi yêu cầu cập nhật
            const result = await dispatch(
                updateStaff({
                    id: userId, // Sử dụng userId từ localStorage
                    body: values,
                })
            ).unwrap();

            // Sau khi cập nhật, lấy lại danh sách nhân viên
            await dispatch(getStaff()).unwrap();

            if (result) {
                notification.success({
                    message: 'Cập nhật tài khoản thành công',
                });
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

    const handleCancel = () => {
        dispatch(hideModal('Modal Detail Account'));
    };

    return (
        <Modal
            title="Thông Tin Tài Khoản"
            open={isVisible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Đóng
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    {loading ? <Spin size="small" /> : 'Cập nhật'}
                </Button>
            ]}
        >
            <Form<FormType>
                form={form}
                style={{ marginTop: '20px' }}
                name="basic"
                initialValues={userData || { id: 0, branch_id: '', fullname: '', email: '', avatar: '', status: '' }}
                autoComplete="off"
            >
                {userData && (
                    <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
                        <Form.Item
                            style={{ marginBottom: "40px" }}
                            label="Tên tài khoản"
                            name="fullname"
                            rules={[{ required: true, message: 'Vui lòng nhập Tên tài khoản!' }]} >
                            <Input placeholder="Tên tài khoản" />
                        </Form.Item>
                        <Form.Item
                            style={{ marginBottom: "40px" }}
                            label="Tên Email"
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng nhập tên email!' }]} >
                            <Input type="email" placeholder="Tên email" />
                        </Form.Item>
                        <Form.Item
                            style={{ marginBottom: "40px" }}
                            label="Số Điện Thoại"
                            name="phone"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]} >
                            <Input type="text" placeholder="Số Điện Thoại" />
                        </Form.Item>
                        <Form.Item
                            style={{ marginBottom: "40px" }}
                            label="Số Điện Thoại Người Thân"
                            name="phone_relative"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại người thân!' }]} >
                            <Input type="text" placeholder="Số Điện Thoại" />
                        </Form.Item>

                        <div className="upload" style={{ marginBottom: "150px" }}>
                            <Form.Item
                                style={{ width: "100%", marginBottom: "40px" }} label="Avatar">
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
                                    <div style={{ marginTop: "10px" }}>
                                        <img src={previewImage} alt="Avatar Preview" style={{ width: "100px", height: "100px", objectFit: 'cover' }} />
                                    </div>
                                )}
                            </Form.Item>
                        </div>

                        <Form.Item
                            style={{ marginBottom: "40px" }}
                            label="Chi Nhánh"
                            name="branch_id"
                            rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]} >
                            <Select placeholder="Chọn Chi Nhánh">
                                {branches.map((branch) => (
                                    <Select.Option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            style={{ marginBottom: "40px" }}
                            label="Phân Quyền"
                            name="roles"
                            rules={[{ required: true, message: "Vui lòng chọn phân quyền" }]} >
                            <Select placeholder="Phân Quyền">
                                {roles.map((role) => (
                                    <Select.Option key={role} value={role}>
                                        {role}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                )}
            </Form>
        </Modal>
    );
};

export default DetailAccount;
