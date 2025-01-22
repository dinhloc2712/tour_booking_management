import { Button, Form, Modal, notification, DatePicker, Select, Input } from "antd";
import FormComponent from "component/Global/Form/FormComponent";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { addVoucher } from "redux/API/POST/PostVoucher";
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";
import moment from 'moment';
import { getTypeVoucher } from "redux/API/GET/GetTypeVoucher";
import { getVoucherList } from "redux/API/GET/GetVoucher";
import { useTranslation } from "react-i18next";
import { getTour } from "redux/API/GET/GetTour";
import { getCustomer } from "redux/API/GET/GetCustomer";

const { RangePicker } = DatePicker;

interface CustomModalProps {
    id: any;
}

const initialState = {
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

const AddVoucher: React.FC<CustomModalProps> = ({ id }) => {
    const dispatch = useAppDispatch();
    const showModalService = useSelector((state: RootState) => state.modal.modals[id]);
    const [form] = Form.useForm();
    const types = useSelector((state: RootState) => state.typeVoucher.types);
    const tourData = useSelector((state: RootState) => state.tour.tourList);
    const customerList = useSelector((state: RootState) => state.customer.customerList);
    const [loading, setLoading] = useState(false);
    const [selectedObjectType, setSelectedObjectType] = useState<string>(''); 
    const [tourOptions, setTourOptions] = useState<{ value: string; label: string }[]>([]);
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [valueType, setValueType] = useState<string>(''); // Để theo dõi loại giá trị

    const { t } = useTranslation('AddVoucher');

    const objectTypes = [
        { value: 'tour', label: t('AddVoucher.tour') },
        { value: 'Customer', label: t('AddVoucher.Customer') },
    ];

    const handleObjectTypeChange = (value: string) => {
        setSelectedObjectType(value);
    };

    useEffect(() => {
        dispatch(getTypeVoucher());
        dispatch(getTour());
        dispatch(getCustomer()); // Thêm API lấy danh sách user
    }, [dispatch]);
    
    useEffect(() => {
        if (tourData.length > 0) {
            const tourOptions = tourData.map(tour => ({
                value: String(tour.id),
                label: tour.name,
            }));
            setTourOptions(tourOptions);
        }
    }, [tourData]);
    
    useEffect(() => {
        if (customerList.length > 0) { // Thêm logic xử lý user
            const userOptions = customerList.map(user => ({
                value: String(user.id),
                label: user.fullname,
            }));
            setUserOptions(userOptions);
        }
    }, [customerList]);
    

    const formFields = [
        {
            label: t('AddVoucher.Đối Tượng'),
            name: 'object_type',
            id: 'object_type',
            placeholder: 'Chọn Đối Tượng',
            type: 'select',
            options: objectTypes,
            onChange: handleObjectTypeChange
        },
        {
            label: t('AddVoucher.Loại Đối Tượng'),
            name: 'object_ids',
            id: 'object_ids',
            placeholder: 'Chọn Nhiều Voucher',
            type: 'select',
            options: selectedObjectType === 'tour' 
                ? tourOptions 
                : selectedObjectType === 'Customer' 
                    ? userOptions 
                    : [],
            isMultiple: true,
        },
        {
            label: t('AddVoucher.Mã Voucher'),
            name: 'code',
            id: 'code',
            placeholder: t('AddVoucher.Mã Voucher'),
            type: 'text'
        },
        {
            label: t('AddVoucher.Mô Tả'),
            name: 'description',
            id: 'description',
            placeholder: t('AddVoucher.Mô Tả'),
            type: 'text'
        },
        {
            label: t('AddVoucher.Số Lượng'),
            name: 'quantity',
            id: 'quantity',
            placeholder: t('AddVoucher.Số Lượng'),
            type: 'text'
        },
        {
            label: t('AddVoucher.Loại Voucher'),
            name: 'type',
            id: 'type',
            placeholder: 'Loại Voucher',
            type: 'select',
            options: types.map(type => ({
                value: type,
                label: type
            })),
            onChange: (value: string) => setValueType(value), // Lưu loại giá trị khi thay đổi
        },
        {
            label: t('AddVoucher.Giá Trị'),
            name: 'value',
            id: 'value',
            placeholder: t('AddVoucher.Giá Trị'),
            type: 'custom', 
            render: () => (
                <Input
                    type="text"
                    placeholder={t('AddVoucher.Giá Trị')}
                    style={{ width: '100%', height: '40px' }}
                    addonAfter={valueType === 'money' ? 'VND' : valueType === 'percent' ? '%' : ''} 
                    onChange={(e) => {
                        const value = e.target.value;
                        form.setFieldsValue({ value });
                    }}
                />
            )
        },
        {
            label: t('AddVoucher.Thời Gian'),
            name: 'date_range',
            placeholder: '',
            type: 'date_range'
        }
    ];

    useEffect(() => {
        dispatch(getTypeVoucher());
        dispatch(getTour());
    }, [dispatch]);

    useEffect(() => {
        if (tourData.length > 0) {
            const tourOptions = tourData.map(tour => ({
                value: String(tour.id),
                label: tour.name,
            }));
            setTourOptions(tourOptions);
        }
    }, [tourData]);
    
    const handleFinish = async (values: any) => {
        setLoading(true);
        const { date_range, object_ids, ...restValues } = values;

        let start_time: string | null = null;
        let end_time: string | null = null;

        if (date_range && date_range[0] && date_range[1]) {
            start_time = date_range[0]?.format('YYYY-MM-DD HH:mm:ss');
            end_time = date_range[1]?.format('YYYY-MM-DD HH:mm:ss');
        }

        const objectIdsArray = Array.isArray(object_ids) ? object_ids.map(id => Number(id)) : [];

        const payload = {
            ...restValues,
            object_ids: objectIdsArray, 
            start_time,
            end_time
        };

        try {
            const result = await dispatch(addVoucher(payload)).unwrap();
            if (result) {
                form.resetFields();
                handleCancelModalVoucher();
                notification.success({
                    message: 'Thêm dữ liệu thành công'
                });
                await dispatch(getVoucherList()).unwrap();
            }
        } catch (err) {
            notification.error({
                message: 'Thêm dữ liệu thất bại',
                description: JSON.stringify(err) || 'Có lỗi xảy ra.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelModalVoucher = () => {
        dispatch(hideModal(id));
    };

    return (
        <Modal
            open={showModalService}
            title={t('AddVoucher.Thêm Khuyến Mại')}
            footer={[
                <Button key="cancel" onClick={handleCancelModalVoucher}>
                    {t('AddVoucher.Hủy')}
                </Button>,
                <Button key="submit" type="primary" htmlType="submit" form="voucher-form" loading={loading}>
                    {t('AddVoucher.Thêm Mới')}
                </Button>
            ]}
        >
            <Form
                id="voucher-form"
                form={form}
                style={{ marginTop: "20px" }}
                name="basic"
                autoComplete="off"
                onFinish={handleFinish}
                initialValues={{
                    object_ids: undefined,
                    object_type: '',
                }}
            >
                <FormComponent fields={formFields} />
            </Form>
        </Modal>
    );
};

export default AddVoucher;



