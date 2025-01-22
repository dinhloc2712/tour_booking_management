import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, Button, Input } from 'antd';
import { useSelector } from 'react-redux';
import { getStatisticsDeatilBooking } from 'redux/API/GET/Statistical/GetStatisticalDetailBooking';
import { RootState, useAppDispatch } from 'redux/store';
import { getStatisticsDeatilBill } from 'redux/API/GET/Statistical/GetStatisticalDetailBills';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

const BookingDetailsModalBills = ({ isVisible, onClose, day }: { isVisible: boolean; onClose: () => void; day: string | null }) => {
  const dispatch = useAppDispatch();
  const { refunds, loading, error } = useSelector((state: RootState) => state.refunds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Du_Lieu_Doanh_Thu_Details");
  const { t } = useTranslation('Table1');

  const handleOk = () => {
    setIsModalOpen(false);
    if (fileName) {
      handleExportToExcel(refunds, fileName);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (day) {
      dispatch(getStatisticsDeatilBill(day));
    }
  }, [day, dispatch]);
  useEffect(() => {
  }, [refunds]);
  console.log('sad', refunds);


  const bookingData = refunds
  const validBookingDetails = bookingData;
  const hasValidData = validBookingDetails.length > 0;


  const columns = [
    {
      title: t('Table1.CreatedAt'),
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
      title: t('Table1.RefundTour'),
      dataIndex: 'refund_tour',
      key: 'refund_tour',
      render: (refund_tour) => (
        refund_tour && refund_tour.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {refund_tour.map((tour, index) => (
              <li key={index} style={{ lineHeight: '2.5' }}>
                <strong>{t('Table1.TourName')}:</strong> {tour.name_tour ? ` ${tour.name_tour}` : t('Table1.NoTourName')}
                <br />
                <strong>{t('Table1.Price')}:</strong> {tour.price
                  ? `${new Intl.NumberFormat('vi-VN').format(tour.price)} VND`
                  : t('Table1.NoData')}
                <br />
              </li>
            ))}
          </ul>
        ) : t('Table1.NoRefundTour')
      ),
    },
    {
      title: t('Table1.RefundService'),
      dataIndex: 'refund_service',
      key: 'refund_service',
      render: (refund_service) => (
        refund_service && refund_service.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {refund_service.map((service, index) => (
              <li key={index} style={{ lineHeight: '2.5' }}>
                <strong>{t('Table1.ServiceName')}:</strong> {service.name_service ? `${service.name_service}` : t('Table1.NoServiceName')}
                <br />
                <strong>{t('Table1.Price')}:</strong> {service.price
                  ? `${new Intl.NumberFormat('vi-VN').format(service.price)} VND`
                  : t('Table1.NoData')}
                <br />
              </li>
            ))}
          </ul>
        ) : t('Table1.NoRefundService')
      ),
    },
    {
      title: t('Table1.CustomerRefund'),
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        customer ? (
          <div style={{ lineHeight: '2.5' }}>
            <strong></strong> {customer.fullname ? ` ${customer.fullname}` : t('Table1.NoCustomerName')}
            <br />
          </div>
        ) : t('Table1.NoCustomerInfo')
      ),
    },
    {
      title: t('Table1.Branch'),
      dataIndex: 'staff',
      key: 'staff',
      render: (staff) => (
        staff ? (
          <div style={{ lineHeight: '2.5' }}>
            <strong></strong> {staff.branch ? ` ${staff.branch.name}` : t('Table1.NoBranch')}
          </div>
        ) : t('Table1.NoStaffInfo')
      ),
    },
    {
      title: t('Table1.Staff'),
      dataIndex: 'staff',
      key: 'staff',
      render: (staff) => (
        staff ? (
          <div>
            <strong></strong> {staff.fullname ? ` ${staff.fullname}` : t('Table1.NoStaffName')}
            <br />
          </div>
        ) : t('Table1.NoStaffInfo')
      ),
    },
    {
      title: t('Table1.PaymentAndTotal'),
      dataIndex: 'payment',
      key: 'payment',
      render: (payment, record) => (
        <div>
          <div>
            <strong>{t('Table1.PaymentMethod')}:</strong>
            {payment ? payment.type || '-' : '-'}
          </div>
          <div>
            <strong>{t('Table1.TotalAmount')}:</strong>
            {record.total_amount
              ? `${new Intl.NumberFormat('vi-VN').format(record.total_amount)} VND`
              : t('Table1.NoAmount')}
          </div>
        </div>
      ),
    },
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
      "Thời Gian": record.created_at ? new Date(record.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) : '',
      "Hoàn Tiền Tour": record.refund_tour && record.refund_tour.length > 0
        ? record.refund_tour.map(tour => `${tour.name_tour || 'Không có tên tour'} - ${tour.amount ? formatCurrency1(tour.amount) : 'Không có dữ liệu'}`).join(', ')
        : 'Không có tour hoàn tiền',
      "Hoàn Tiền Dịch Vụ": record.refund_service && record.refund_service.length > 0
        ? record.refund_service.map(service => `${service.name_service || 'Không có tên dịch vụ'} - ${service.amount ? formatCurrency1(service.amount) : 'Không có dữ liệu'}`).join(', ')
        : 'Không có dịch vụ hoàn tiền',
      "Hoàn Trả Lại cho Khách Hàng": record.customer ? record.customer.fullname || 'Không có tên khách hàng' : 'Không có thông tin khách hàng',
      "Chi Nhánh": record.staff ? record.staff.branch?.name || 'Không có chi nhánh' : 'Không có thông tin nhân viên',
      "Nhân Viên": record.staff ? record.staff.fullname || 'Không có tên nhân viên' : 'Không có thông tin nhân viên',
      "Hình Thức và Tổng Tiền": `${record.payment ? record.payment.type : '-'} - ${record.total_amount ? formatCurrency1(record.total_amount) : 'Chưa có tiền'}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 35 },
      { wch: 30 },
      { wch: 30 },
      { wch: 25 },
      { wch: 30 },
      { wch: 25 },
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <Modal
      title={`Chi Tiết Refunds ${day}`}
      visible={isVisible}
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
          <div>Không có booking nào trong ngày {day}</div>
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

export default BookingDetailsModalBills;

