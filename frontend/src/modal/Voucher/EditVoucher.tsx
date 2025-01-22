import { Modal, Form, Input, Select, notification, Button, Spin, DatePicker } from 'antd';
import { RootState, useAppDispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { Voucher } from 'redux/Reducer/VoucherReducer';
import { useEffect, useState } from 'react';
import { updateVoucher } from 'redux/API/PUT/EditVoucher';
import { getVoucherList } from 'redux/API/GET/GetVoucher';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { getTour } from 'redux/API/GET/GetTour';
import { getCustomer } from 'redux/API/GET/GetCustomer';

const { RangePicker } = DatePicker;

interface EditVoucherProps {
    visible: boolean;
    onClose: () => void;
}

const initialState: Voucher = {
    id: '',
    object_type: '',
    object_ids: [],
    code: '',
    description: '',
    value: '',
    quantity: '',
    start_time: null,
    end_time: null,
    type: 'chọn loại',
    is_active: true,
    date_range: undefined,
};

const EditVoucher: React.FC<EditVoucherProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const typeVoucher = useSelector((state: RootState) => state.typeVoucher.types);
    const editingVoucher = useSelector((state: RootState) => state.voucher.editingVoucher);
    const tourData = useSelector((state: RootState) => state.tour.tourList);
    const customerList = useSelector((state: RootState) => state.customer.customerList);
    const [loading, setLoading] = useState(false);
    const [selectedObjectType, setSelectedObjectType] = useState<string>('');

    useEffect(() => {
        if (editingVoucher) {
            form.setFieldsValue({
                ...editingVoucher,
                date_range: editingVoucher.start_time && editingVoucher.end_time
                    ? [moment(editingVoucher.start_time), moment(editingVoucher.end_time)]
                    : null,
                object_type: editingVoucher.object_type, // Điền giá trị object_type
                object_ids: editingVoucher.object_ids || [], // Điền giá trị object_ids
            });
            setSelectedObjectType(editingVoucher.object_type); // Cập nhật selectedObjectType
        }
    }, [editingVoucher, form]);

    const objectTypes = [
        { value: 'tour' },
        { value: 'Customer' },
    ];

    useEffect(() => {
        if (visible) {
            dispatch(getTour()); // Lấy dữ liệu tour từ API
            dispatch(getCustomer()); // Lấy dữ liệu customer từ API
        }
    }, [visible, dispatch]);

    const { t } = useTranslation('UpdateVoucher');

    const handleSubmitUpdate = async (values: any) => {
        setLoading(true);
        try {
            if (editingVoucher) {
                const { date_range, ...restValues } = values;

                let start_time: string | null = null;
                let end_time: string | null = null;

                if (date_range && date_range.length === 2) {
                    start_time = date_range[0]?.format('YYYY-MM-DD HH:mm:ss');
                    end_time = date_range[1]?.format('YYYY-MM-DD HH:mm:ss');
                }

                const result = await dispatch(
                    updateVoucher({
                        id: editingVoucher.id,
                        body: { ...restValues, start_time, end_time },
                    })
                ).unwrap();

                await dispatch(getVoucherList()).unwrap();
                if (result) {
                    onClose(); // Đóng modal khi thành công
                    notification.success({
                        message: "Cập nhật voucher thành công",
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

    const handleObjectTypeChange = (value: string) => {
        setSelectedObjectType(value);
    };

    return (
        <Modal
            open={visible}
            title={t('UpdateVoucher.Cập Nhật Khuyến Mại')}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('UpdateVoucher.Hủy')}
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    {loading ? <Spin size="small" /> : t('UpdateVoucher.Cập Nhật')}
                </Button>,
            ]}
        >
            <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
                <Form.Item
                    label={t('UpdateVoucher.Loại Đối Tượng')}
                    name="object_type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại đối tượng!' }]}
                >
                    <Select placeholder="Chọn loại đối tượng" onChange={handleObjectTypeChange}>
                        {objectTypes.map((objectType) => (
                            <Select.Option key={objectType.value} value={objectType.value}>
                                {objectType.value}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedObjectType === 'tour' && (
                    <Form.Item
                        label={t('UpdateVoucher.Tour')}
                        name="object_ids"
                        rules={[{ required: true, message: 'Vui lòng chọn tour!' }]}
                    >
                        <Select mode="multiple" placeholder={t('UpdateVoucher.Chọn Tour')}>
                            {tourData.map((tour) => (
                                <Select.Option key={tour.id} value={tour.id}>
                                    {tour.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                {selectedObjectType === 'Customer' && (
                    <Form.Item
                        label={t('UpdateVoucher.Customer')}
                        name="object_ids"
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
                    >
                        <Select mode="multiple" placeholder={t('UpdateVoucher.Chọn Khách Hàng')}>
                            {customerList.map((customer) => (
                                <Select.Option key={customer.id} value={customer.id}>
                                    {customer.fullname}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item label={t('UpdateVoucher.Mã Voucher')} name="code" rules={[{ required: true, message: 'Vui lòng nhập Mã Voucher!' }]}>
                    <Input placeholder={t('UpdateVoucher.Mã Voucher')} />
                </Form.Item>

                <Form.Item label={t('UpdateVoucher.Mô Tả')} name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                    <Input.TextArea rows={4} placeholder={t('UpdateVoucher.Mô Tả')} />
                </Form.Item>

                <Form.Item label={t('UpdateVoucher.Giá Trị')} name="value" rules={[{ required: true, message: 'Vui lòng nhập giá Trị!' }]}>
                    <Input type="number" placeholder={t('UpdateVoucher.Giá Trị')} />
                </Form.Item>

                <Form.Item label={t('UpdateVoucher.Số Lượng')} name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
                    <Input type="number" placeholder={t('UpdateVoucher.Số Lượng')} />
                </Form.Item>

                <Form.Item label={t('UpdateVoucher.Thời Gian')} name="date_range" rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
                    <RangePicker showTime />
                </Form.Item>

                <Form.Item label={t('UpdateVoucher.Loại Voucher')} name="type" rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ!' }]}>
                    <Select placeholder="Chọn loại voucher">
                        {typeVoucher.map((type) => (
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

export default EditVoucher;
