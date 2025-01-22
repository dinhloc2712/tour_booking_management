import { useEffect, useState } from "react";
import { Select, Button, Form, Input, notification, Modal, Spin, Popconfirm, Upload, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState, useAppDispatch } from "redux/store";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

interface EditTourProps {
    visible: boolean;
    onClose: () => void;
}

const EditTour: React.FC<EditTourProps> = ({ visible, onClose }) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [image, setImage] = useState<string | null>(null); // To store the image URL

    const edittingTour = useSelector((state: RootState) => state.tour.edittingTour);
    const serviceList = useSelector((state: RootState) => state.service.serviceList);
    const branchList = useSelector((state: RootState) => state.branch.branchList); // Assuming the branch list is in the store

    useEffect(() => {
        if (edittingTour) {
            const selected = edittingTour.services.map(service => ({
                id: service.id,
                name: service.name,
                price: service.pivot?.price || service.price,
                description: service.description,
            }));
            setSelectedServices(selected);
            setImage(edittingTour.image); // Set the current image URL

            form.setFieldsValue({
                name: edittingTour.name,
                price_min: edittingTour.price_min,
                price_max: edittingTour.price_max,
                description: edittingTour.description,
                services: edittingTour.services.map((service: any) => service.id.toString()),
                branch_id: edittingTour.branch_id, // Assuming branch_id exists in edittingTour
            });
        }
    }, [edittingTour, form]);

    const handleSubmitUpdate = async (values: any) => {
        setLoading(true);

        const updatedTourData = {
            name: values.name,
            price_min: values.price_min,
            price_max: values.price_max,
            quantity: '1',
            description: values.description,
            services: selectedServices.map(service => ({
                service_id: service.id,
                price: service.price,
            })),
            branch_id: values.branch_id, // Include the branch_id
            image: image, // Include the image URL
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/tours/${edittingTour?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTourData),
            });

            if (response.ok) {
                notification.success({
                    message: "Cập nhật tour thành công!",
                });
                onClose();
            } else {
                throw new Error("Cập nhật tour thất bại!");
            }
        } catch (error) {
            notification.error({
                message: "Cập nhật tour thất bại!",
                description: error.message || "Đã xảy ra lỗi.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleServiceChange = (value: string[]) => {
        const selected = serviceList.filter(service => value.includes(service.id.toString()));
        setSelectedServices(prevSelectedServices => {
            const newServices = selected.filter(service =>
                !prevSelectedServices.some(prevService => prevService.id === service.id)
            );
            return [...prevSelectedServices, ...newServices.map(service => ({
                id: service.id,
                name: service.name,
                price: service.pivot?.price || service.price,
                description: service.description,
            }))];
        });
    };

    const handleRemoveService = (serviceId: number) => {
        setSelectedServices(prevSelectedServices =>
            prevSelectedServices.filter(service => service.id !== serviceId)
        );
    };

    const handlePriceChange = (serviceId: number, newPrice: string) => {
        setSelectedServices(prevSelectedServices =>
            prevSelectedServices.map(service =>
                service.id === serviceId ? { ...service, price: newPrice } : service
            )
        );
    };

    // Handle image upload
    const handleImageUpload = (file: any) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("Chỉ chấp nhận hình ảnh!");
            return false;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string); // Set image URL to state
        };
        reader.readAsDataURL(file);
        return false; // Prevent auto upload
    };

    return (
        <Modal
            title="Cập nhật Tour"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    {loading ? <Spin size="small" /> : "Cập nhật"}
                </Button>,
            ]}
        >
            <div className="form_tour">
                <Form form={form} onFinish={handleSubmitUpdate}>
                    <Form.Item label="Tên Tour" name="name" rules={[{ required: true, message: "Vui lòng nhập tên tour!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Giá tối thiểu" name="price_min" rules={[{ required: true, message: "Vui lòng nhập giá tối thiểu!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Giá tối đa" name="price_max" rules={[{ required: true, message: "Vui lòng nhập giá tối đa!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}>
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item label="Dịch vụ" name="services" rules={[{ required: true, message: "Vui lòng chọn ít nhất một dịch vụ!" }]}>
                        <Select
                            mode="multiple"
                            placeholder="Chọn dịch vụ"
                            onChange={handleServiceChange}
                        >
                            {serviceList.map((service) => (
                                <Option key={service.id} value={service.id.toString()}>
                                    {service.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <p>Dịch vụ đã chọn</p>
                        {selectedServices.length > 0 ? (
                            <div>
                                {selectedServices.map((service, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', justifyContent: 'space-between' }}>
                                        <label style={{ width: '151px' }}>{service.name}</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px", width: "100%" }}>
                                            <Input
                                                value={service.price}
                                                onChange={(e) => handlePriceChange(service.id, e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                            <Popconfirm
                                                title="Bạn có chắc chắn muốn xóa dịch vụ này?"
                                                onConfirm={() => handleRemoveService(service.id)}
                                                okText="Có"
                                                cancelText="Không"
                                            >
                                                <Button type="link" danger>Xóa</Button>
                                            </Popconfirm>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Chưa chọn dịch vụ</p>
                        )}
                    </Form.Item>
                    <Form.Item label="Chi nhánh" name="branch_id" rules={[{ required: true, message: "Vui lòng chọn chi nhánh!" }]}>
                        <Select placeholder="Chọn chi nhánh">
                            {branchList.map((branch) => (
                                <Option key={branch.id} value={branch.id.toString()}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ảnh Tour">
                        <Upload beforeUpload={handleImageUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                        {image && <img src={image} alt="Tour" style={{ width: "100%", marginTop: "10px" }} />}
                    </Form.Item>

                </Form>
            </div>
        </Modal>
    );
};

export default EditTour;
