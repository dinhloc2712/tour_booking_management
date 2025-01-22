import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, Button, Input } from 'antd';
import { useSelector } from 'react-redux';
import { getStatisticsDeatilBooking } from 'redux/API/GET/Statistical/GetStatisticalDetailBooking';
import { RootState, useAppDispatch } from 'redux/store';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

interface BookingDetail {
  created_at: string;
  tour_name: string;
  status_payment: string;
  deposit: string | null;
  booker_name: string;
  booker_phone: string;
  branch_name: string;
  staff_name: string;
  sale_agent_name: string;
}

const BookingDetailsModal = ({ isVisible, onClose, date }: { isVisible: boolean; onClose: () => void; date: string | null }) => {
  const dispatch = useAppDispatch();
  const { bookingDetails, loading, error } = useSelector((state: RootState) => state.statistical);
  const { t } = useTranslation('Table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Du_Lieu_Booking_Details");

  const handleOk = () => {
    setIsModalOpen(false);
    if (fileName) {
      handleExportToExcel(bookingDetails?.data, fileName);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (date) {
      dispatch(getStatisticsDeatilBooking(date));
    }
  }, [date, dispatch]);

  useEffect(() => {
  }, [bookingDetails]);

  const bookingData = bookingDetails?.data || [];

  const validBookingDetails = bookingData;

  const hasValidData = validBookingDetails.length > 0;

  const columns = [
    { title: t('Table.CreatedAt'), dataIndex: 'created_at', key: 'created_at' },
    {
      title: t('Table.Tour'),
      dataIndex: 'tours_name',
      key: 'tours_name',
      width: 200,
      render: (tours) => (
        tours && tours.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {tours.map((tour, index) => (
              tour ? (
                <li key={index} style={{ lineHeight: '2.5' }}>
                  {`${t('Table.Tour')} ${index + 1}: ${tour}`}
                </li>
              ) : null
            ))}
          </ul>
        ) : ''
      ),
    },
    { title: t('Table.PaymentStatus'), dataIndex: 'status_payment', key: 'status_payment', width: 200 },
    {
      title: t('Table.Deposit'),
      dataIndex: 'deposit',
      key: 'deposit',
      width: 150,
      render: (text) => {
        if (text !== null && text !== undefined && !isNaN(text)) {
          const formattedAmount = new Intl.NumberFormat('vi-VN').format(text);
          return `${formattedAmount} VND`;
        }
        return t('Table.NoDeposit');
      },
    },
    { title: t('Table.BookerName'), dataIndex: 'booker_name', key: 'booker_name', render: text => text || t('Table.NoBookerName') },
    { title: t('Table.BookerPhone'), dataIndex: 'booker_phone', key: 'booker_phone', render: text => text || t('Table.NoPhone'), width: 200 },
    { title: t('Table.Branch'), dataIndex: 'branch_name', key: 'branch_name' },
    { title: t('Table.Staff'), dataIndex: 'staff_name', key: 'staff_name', width: 100 },
    {
      title: <div style={{ textAlign: 'center' }}>{t('Table.Agent')}</div>,
      dataIndex: 'sale_agent_name',
      key: 'sale_agent_name',
      className: 'center-column',
      render: text => (
        <div style={{ textAlign: 'center' }}>
          {text || '-'}
        </div>
      ),
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
      "Thời Gian": record.created_at ? new Date(record.created_at).toLocaleString('vi-VN') : '',
      "Tour": record.tours_name && record.tours_name.length > 0
        ? record.tours_name.map((tour, idx) => `Tour ${idx + 1}: ${tour}`).join(',') // Tạo ký tự xuống dòng giữa các tour
        : 'Không có tour',
      "Trạng Thái Thanh Toán": record.status_payment || '',
      "Tiền Cọc": record.deposit !== null && record.deposit !== undefined && !isNaN(record.deposit)
        ? `${new Intl.NumberFormat('vi-VN').format(record.deposit)} VND`
        : 'Chưa có tiền cọc',
      "Người Đặt": record.booker_name || 'Không có tên người đặt',
      "Số Điện Thoại Người Đặt": record.booker_phone || 'Không có số',
      "Chi Nhánh": record.branch_name || '',
      "Nhân Viên": record.staff_name || '',
      "Đại Lý": record.sale_agent_name || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    worksheet["!cols"] = [
      { wch: 40 },
      { wch: 35 },
      { wch: 30 },
      { wch: 30 },
      { wch: 40 },
      { wch: 30 },
      { wch: 40 },
      { wch: 40 },
      { wch: 30 },
    ];
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, `${fileName}.xlsx`);
  };


  return (
    <Modal
    title={`${t('Table.Chi Tiết Bookings')} ${date}`}
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
          <div>Không có booking nào trong ngày {date}</div>
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

export default BookingDetailsModal;
