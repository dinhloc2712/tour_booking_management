import { Button, Modal, Input, Form, Select, notification, message, Upload } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { addStaff } from "redux/API/POST/PostStaff";
import { fetchBranchRoleData } from "redux/Reducer/TypeCustomerReducer";
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

interface FormType {
    id: string;
    branch_id: string;
    fullname: string;
    email: string;
    avatar: string;
    roles: string;
    password: string;
    is_active: boolean;
}

interface CustomModalProps {
    id: any;
}

const initialState: FormType = {
    id: "",
    branch_id: "",
    fullname: "",
    email: "",
    avatar: "",
    roles: "",
    password: "",
    is_active: true,
};

const AddStaff: React.FC<CustomModalProps> = ({ id }) => {
    const dispatch = useAppDispatch();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const showModalService = useSelector((state: RootState) => state.modal.modals[id]);
    const { roles, branches, error } = useSelector((state: RootState) => state.typeBranchAndRole);
    console.log(roles, branches);

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation("Adduser");

    useEffect(() => {
        if (error) {
            notification.error({
                message: "Tải dữ liệu thất bại",
                description: error,
            });
        }
    }, [error, t]);

    useEffect(() => {
        dispatch(fetchBranchRoleData())
    }, [dispatch]);

    // Hàm xử lý upload hình ảnh lên Cloudinary
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
                setImageUrl(data.secure_url); // Lưu URL của ảnh vào state
            } else {
                message.error(`Tải lên không thành công: ${data.error.message}`);
            }
        } catch (error) {
            message.error('Tải lên hình ảnh thất bại');
        }
    };

    const handleFinish = async (values: FormType) => {
        setLoading(true);
        try {
            const updatedValues = {
                ...values,
                avatar: imageUrl,
            };

            const result = await dispatch(addStaff(updatedValues)).unwrap();
            if (result) {
                form.resetFields();
                handleCancelModalService();
                notification.success({
                    message: "Thêm dữ liệu thành công",
                });
            }
        } catch (err) {
            console.error("Error:", err);
            notification.error({
                message: "Thêm dữ liệu thất bại",
                description: err.message || "Có lỗi xảy ra.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelModalService = () => {
        form.resetFields(); 
        setPreviewImage(null);
        dispatch(hideModal(id));
    };

    return (
        <div className="form_component">
            <Modal
                open={showModalService}
                title={t("Adduser.Thêm Tài Khoản")}
                footer={[
                    <Button key="cancel" onClick={handleCancelModalService}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" htmlType="submit" form="source-form" loading={loading}>
                        Thêm Mới
                    </Button>,
                ]}
            >
                <Form
                    id="source-form"
                    form={form}
                    style={{ marginTop: "20px" }}
                    name="basic"
                    className="form_component"
                    autoComplete="off"
                    onFinish={handleFinish}
                    initialValues={initialState}
                >
                    <Form.Item
                        label={t("Adduser.Họ Và Tên")}
                        name="fullname"
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                    >
                        <Input placeholder={t("Adduser.Họ Và Tên")} />
                    </Form.Item>

                    <Form.Item
                        label={t("Adduser.Email")}
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <Input placeholder={t("Adduser.Email")} />
                    </Form.Item>

                    <Form.Item
                        label={t("Adduser.Mật Khẩu")}
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                    >
                        <Input.Password placeholder={t("Adduser.Mật Khẩu")} />
                    </Form.Item>

                    <div className="upload">
                        <Form.Item style={{ width: "100%" }} label={t("Adduser.Ảnh")}>
                            <Upload
                                style={{ width: "100%" }}
                                beforeUpload={(file) => {
                                    const previewURL = URL.createObjectURL(file);
                                    setPreviewImage(previewURL);
                                    handleUpload(file);
                                    return false;
                                }}
                                showUploadList={false}
                            >
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
                        label={t("Adduser.Chi Nhánh")}
                        name="branch_id"
                        
                        rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
                    >
                        
                        <Select placeholder="Chọn Chi Nhánh">
                            {branches.map((branch) => (
                                <Select.Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t("Adduser.Phân Quyền")}
                        name="roles"
                        rules={[{ required: true, message: "Vui lòng chọn phân quyền" }]}
                    >
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
        </div>
    );
};

export default AddStaff;
