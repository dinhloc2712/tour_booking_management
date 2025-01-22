import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, Button, Input } from 'antd';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'redux/store';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import { getStatisticsDeatilBills } from 'redux/API/GET/Statistical/GetStatisticalDetailBill';

const BookingDetailsModalBill = ({ isVisible1, onClose, day }: { isVisible1: boolean; onClose: () => void; day: string | null }) => {
    const dispatch = useAppDispatch();
    const { bills, loading, error } = useSelector((state: RootState) => state.bills);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileName, setFileName] = useState("Du_Lieu_Doanh_Thu_Details");
    const { t } = useTranslation('Bills');

    const handleOk = () => {
        setIsModalOpen(false);
        if (fileName) {
            handleExportToExcel(bills, fileName);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (day) {
            dispatch(getStatisticsDeatilBills(day));
        }
    }, [day, dispatch]);
    useEffect(() => {
    }, [bills]);
    console.log('sad', bills);

    const bookingData = bills
    const validBookingDetails = bookingData;
    const hasValidData = validBookingDetails.length > 0;

    const columns = [
        {
            title: t('Bills.CreatedAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => {
                const date = new Date(text);
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
            },
        },
        {
            title: t('Bills.Tên Tour'),
            dataIndex: 'bill_tours',
            key: 'bill_tours',
            render: (bill_tours) => (
                bill_tours && bill_tours.length > 0 ? (
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {bill_tours.map((tour, index) => (
                            <li key={index} style={{ lineHeight: '2.5' }}>
                                <strong></strong> {tour.name_tour ? ` ${tour.name_tour}` : t('.NoTourName')}
                                <br />
                            </li>
                        ))}
                    </ul>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.Tiền Tour'),
            dataIndex: 'bill_tours',
            key: 'bill_tours',
            render: (bill_tours) => (
                bill_tours && bill_tours.length > 0 ? (
                    <div>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                            {bill_tours.map((tour, index) => (
                                <li key={index} style={{ lineHeight: '2.5' }}>
                                    <strong>{t('Bills.Price')}:</strong> {tour.price
                                        ? `${new Intl.NumberFormat('vi-VN').format(tour.price)} VND`
                                        : t('.NoData')}
                                    <br />
                                </li>
                            ))}
                        </ul>
                        <strong>{t('Bills.Total')}:</strong>{' '}
                        {`${new Intl.NumberFormat('vi-VN').format(
                            bill_tours.reduce((total, tour) => total + (tour.price || 0), 0)
                        )} VND`}
                    </div>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.Tiền Dịch Vụ'),
            dataIndex: 'bill_services',
            key: 'bill_services',
            render: (bill_services) => (
                bill_services && bill_services.length > 0 ? (
                    <div>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                            {bill_services.map((service, index) => (
                                <li key={index} style={{ lineHeight: '2.5' }}>
                                    <strong>{t('Bills.ServiceName')}:</strong> {service.name_service ? `${service.name_service}` : t('.NoServiceName')}
                                    <br />
                                    <strong>{t('Bills.Price')}:</strong> {service.price
                                        ? `${new Intl.NumberFormat('vi-VN').format(service.price)} VND`
                                        : t('.NoData')}
                                    <br />
                                </li>
                            ))}
                        </ul>
                        <strong>{t('Bills.Total')}:</strong>{' '}
                        {`${new Intl.NumberFormat('vi-VN').format(
                            bill_services.reduce((total, service) => total + (service.price || 0), 0)
                        )} VND`}
                    </div>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.Khách Hàng thanh toán'),
            dataIndex: 'customer',
            key: 'customer',
            render: (customer) => (
                customer ? (
                    <div style={{ lineHeight: '2.5' }}>
                        <strong></strong> {customer.fullname ? ` ${customer.fullname}` : t('.NoBranch')}
                    </div>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.SDT'),
            dataIndex: 'customer',
            key: 'customer',
            render: (customer) => (
                customer ? (
                    <div>
                        <strong></strong> {customer.user_detail ? ` ${customer.user_detail.phone}` : t('.NoStaffName')}
                        <br />
                    </div>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.Chi Nhánh'),
            dataIndex: 'staff',
            key: 'staff',
            render: (staff) => (
                staff ? (
                    <div>
                        <strong></strong> {staff.branch ? ` ${staff.branch.name}` : t('.NoStaffName')}
                        <br />
                    </div>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.Loại Hóa Đơn'),
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                switch (type) {
                    case 'normal':
                        return 'Hóa đơn thường';
                    case 'special':
                        return 'Hóa đơn đặc biệt';
                    default:
                        return 'Không xác định';
                }
            },
        },
        {
            title: t('Bills.Nhân Viên'),
            dataIndex: 'staff',
            key: 'staff',
            render: (staff) => (
                staff ? (
                    <div>
                        <strong></strong> {staff.fullname ? ` ${staff.fullname}` : t('.NoStaffName')}
                        <br />
                    </div>
                ) : ('-')
            ),
        },
        {
            title: t('Bills.Hình Thức'),
            dataIndex: 'payments',
            key: 'payments',
            render: (payments, record) => {
                let paymentColor = '';
                let paymentText = '';

                if (payments) {
                    if (payments.type === 'banking') {
                        paymentColor = 'green';
                        paymentText = t('Bills.CreditCard');
                    } else if (payments.type === 'cash') {
                        paymentColor = 'orange';
                        paymentText = t('Bills.Cash');
                    } else {
                        paymentColor = 'gray';
                        paymentText = '-';
                    }
                }
                return (
                    <div>
                        <div>
                            {/* <strong>{t('Bills.PaymentMethod')}:</strong> */}
                            <span style={{ color: paymentColor }}>{paymentText}</span>
                        </div>
                        <div>
                            <strong>{t('Bills.TotalAmount')}:</strong>
                            {record.total_amount
                                ? `${new Intl.NumberFormat('vi-VN').format(record.total_amount)} VND`
                                : t('.NoAmount')}
                        </div>
                    </div>
                );
            },
        }
    ];

    const paginationConfig = {
        pageSize: 10,
        total: validBookingDetails.length,
        showSizeChanger: false,
    };

    const formatCurrency1 = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };


    const handleExportToExcel = (data: any[], fileName: string) => {
        const exportData = data.map((record, index) => ({
            "Thời Gian": record.created_at
                ? new Date(record.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })
                : '',

            "Tên Tour": record.bill_tours && record.bill_tours.length > 0
                ? record.bill_tours.map(tour => `${tour.name_tour || 'Không có tên tour'}`).join(', ')
                : 'Không có tour',

            "Tiền Tour": record.bill_tours && record.bill_tours.length > 0
                ? `${new Intl.NumberFormat('vi-VN').format(
                    record.bill_tours.reduce((total, tour) => total + (tour.price || 0), 0)
                )} VND`
                : 'Không có tiền tour',

            "Tiền Dịch Vụ": record.bill_services && record.bill_services.length > 0
                ? `${new Intl.NumberFormat('vi-VN').format(
                    record.bill_services.reduce((total, service) => total + (service.price || 0), 0)
                )} VND`
                : 'Không có tiền dịch vụ',

            "Khách Hàng thanh toán": record.customer ? record.customer.fullname || 'Không có tên khách hàng' : 'Không có khách hàng',

            "SĐT": record.customer ? record.customer.user_detail?.phone || 'Không có số điện thoại' : 'Không có số điện thoại',

            "Chi Nhánh": record.staff ? record.staff.branch?.name || 'Không có chi nhánh' : 'Không có chi nhánh',

            "Loại Hóa Đơn": record.type === 'normal' ? 'Hóa đơn thường' : record.type === 'special' ? 'Hóa đơn đặc biệt' : 'Không xác định',

            "Nhân Viên": record.staff ? record.staff.fullname || 'Không có tên nhân viên' : 'Không có nhân viên',

            "Hình Thức và Tổng Tiền": record.payments ? `${record.payments.type === 'banking' ? 'Thẻ tín dụng' : 'Tiền mặt'} - ${formatCurrency1(record.total_amount)}` : 'Không có hình thức thanh toán'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        worksheet["!cols"] = [
            { wch: 20 },
            { wch: 35 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        saveAs(blob, `${fileName}.xlsx`);
    };

    return (
        <Modal
            title={t('Bills.Chi Tiết Hóa Đơn')}
            visible={isVisible1}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Close
                </Button>,
            ]}
            className="booking-details-modal-statistical"
            width='100%'
        >
            <Spin spinning={loading}>
                {hasValidData ? (
                    <Table
                        dataSource={validBookingDetails}
                        columns={columns}
                        rowKey={(record) => record.created_at}
                        pagination={paginationConfig}
                        scroll={{ y: 400 }}
                    />
                ) : (
                    <div>Không có booking </div>
                )}
            </Spin>

            <Button type="primary" onClick={() => setIsModalOpen(true)} >
                {t('Statistical.Xuất Excel')}
            </Button>
            <Modal
                title={t('Statistical.Xuất File Excel')}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={t('Statistical.Xuất')}
                cancelText={t('Statistical.Hủy')}
            >
                <p>{t('Statistical.Nhập tên file')}</p>
                <Input
                    placeholder={t('Statistical.Nhập tên file')}
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
            </Modal>
        </Modal>
    );
};

export default BookingDetailsModalBill;

