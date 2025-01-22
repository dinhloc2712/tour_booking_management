import React from 'react';
import { Button, DatePicker, Form, Image, Input, message, Select, Upload, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

// Định nghĩa kiểu cho các trường của form
interface FormField {
    label: string; // Nhãn của trường
    name: string; // Tên trường
    placeholder: string; // Nội dung gợi ý
    id?: string; // ID trường (tuỳ chọn)
    type: string; // Loại trường (text, select, date, v.v.)
    options?: { value: string; label: string }[]; // Tùy chọn cho select
    onChange?: (value: string) => void; // Hàm onChange
    isMultiple?: boolean; // Cờ xác định nếu select có thể chọn nhiều giá trị
    render?: () => JSX.Element; // Hàm render tùy chỉnh
}

interface FormComponentProps {
    fields: FormField[]; // Danh sách các trường của form
}

const uploadProps: UploadProps = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', // Đường dẫn upload
    headers: {
        authorization: 'authorization-text',
    },
    onChange(info) {
        // Xử lý thay đổi trạng thái upload
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`); // Thông báo upload thành công
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`); // Thông báo upload thất bại
        }
    },
};

const { RangePicker } = DatePicker; // Khai báo RangePicker từ DatePicker

// Component cho form
const FormComponent: React.FC<FormComponentProps> = ({ fields }) => {
    return (
        <>
            <div className="form_component">
            {fields.map((field) => (
                <Form.Item
                    key={field.id || field.name} // Khóa duy nhất cho mỗi trường
                    label={field.label} // Nhãn trường
                    name={field.name} // Tên trường
                >
                    {/* Trường date_range */}
                    {field.type === 'date_range' ? (
                        <RangePicker id={field.id} name={field.name} style={{ width: '100%', height: '40px' }} />

                    ) : field.type === 'password' ? (
                        // Trường nhập mật khẩu
                        <Input.Password id={field.id} name={field.name} placeholder={field.placeholder} />

                    ) : field.type === 'textarea' ? (
                        // Trường textarea
                        <Input.TextArea id={field.id} name={field.name} placeholder={field.placeholder} rows={4} />

                    ) : field.type === 'image' ? (
                        // Trường upload hình ảnh
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>

                    ) : field.type === 'file' ? (
                        // Hiển thị hình ảnh nếu có (tên loại là 'file')
                        <Image
                            width={70}
                            src={field.placeholder} // Đường dẫn hình ảnh
                        />

                    ) : field.type === 'select' && field.options ? (
                        // Trường chọn lựa (select)
                        <Select
                            id={field.id}
                            placeholder={field.placeholder}
                            onChange={field.onChange} // Gọi hàm onChange nếu có
                            mode={field.isMultiple ? 'multiple' : undefined} // Cho phép chọn nhiều giá trị nếu isMultiple là true
                            allowClear
                        >
                            {field.options.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>

                    ) : field.type === 'number' ? (
                        // Trường nhập số
                        <Input
                            type="number"
                            id={field.id}
                            name={field.name}
                            placeholder={field.placeholder}
                        />

                    ) : field.type === 'custom' && field.render ? (
                        // Trường tùy chỉnh
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {field.render()} {/* Gọi hàm render để hiển thị */}
                        </div>

                    ) : (
                        // Trường text mặc định
                        <Input id={field.id} name={field.name} placeholder={field.placeholder} />
                    )}
                </Form.Item>
            ))}
            </div>
        </>
    );
}

export default FormComponent;
