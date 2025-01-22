import React, { useEffect } from 'react';
import { Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from 'redux/store';
import { paymentHistoryBookingTour } from 'redux/Reducer/PaymentHistoryBookingTour';
import { useParams } from 'react-router-dom';
import HeaderUpdateBooking from 'component/UpdateBookingComponent/header';

interface TourTableData {
  key: number;
  fullname: string;
  nameTour: string;
  serviceName: string;
  serviceQuantity: number | null;
  customerCount: number;
  price: string;
  discount: number | null;
  total_amount: string;
  paymentTime: any;
  deposit: string;
  valueVoucher: string | null;
  finalAmount: string;
}

const HistoryBookingUpdateActiveComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { tours, loading } = useSelector((state: RootState) => state.PaymentHistoryBookingTour);

  useEffect(() => {
    if (id) {
      dispatch(paymentHistoryBookingTour(id));
    }
  }, [dispatch, id]);

  // Format tiền
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(value));
  };

//   const data: TourTableData[] = tours.map((tour) => {
//     const serviceName = tour.bill_services && tour.bill_services.length > 0
//       ? tour.bill_services[0]?.name_service
//       : 'Chưa có dịch vụ';

//     const tourName = tour.bill_tours && tour.bill_tours.length > 0
//       ? tour.bill_tours[0]?.name_tour
//       : 'Chưa có dịch vụ';

//     const serviceQuantity = tour.bill_services[0]?.quantity || null;
//     const discount = 0;
    
    // return {
    //   key: tour.id,
    //   fullname: tour.customers?.map(customer => customer.fullname).join(', ') || 'Chưa có tên',
    //   nameTour: tourName,
    //   serviceName: serviceName,
    //   serviceQuantity: serviceQuantity,
    //   customerCount: tour.quantity_customer,
    //   price: tour.price,
    //   discount: discount,
    //   total_amount: `${Number(tour.total_amount)}`, 
    //   paymentTime: tour.payments?.created_at, 
    //   deposit: tour.deposit,
    //   valueVoucher: tour.value_voucher || 'Không có',
    //   finalAmount: tour.total_amount,
    // };
//   });

  const columns: ColumnsType<TourTableData> = [
    {
      title: 'Tên Thanh Toán',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Tên Tour',
      dataIndex: 'nameTour',
      key: 'nameTour',
    },
    {
      title: 'Tên Dịch Vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Số Lượng Dịch Vụ',
      dataIndex: 'serviceQuantity',
      key: 'serviceQuantity',
      render: (serviceQuantity) => serviceQuantity !== null ? serviceQuantity : '-',
    },
    {
      title: 'Số Lượng Khách Hàng',
      dataIndex: 'customerCount',
      key: 'customerCount',
    },
    {
      title: 'Thanh Toán',
      colSpan: 3,
      children: [
        {
          title: 'Thời Gian Thanh Toán',
          dataIndex: 'paymentTime',
          key: 'paymentTime',
          render: (text: any, record: any) => {
            const paymentUpdatedAt = record.paymentTime
              ? new Date(record.paymentTime).toLocaleString('vi-VN')
              : 'Ngày không hợp lệ';
            if (isNaN(new Date(record.paymentTime).getTime())) {
              return 'Ngày không hợp lệ';
            }
            return paymentUpdatedAt;
          },
        },
        {
          title: 'Tổng Tiền Thanh Toán',
          dataIndex: 'total_amount',
          key: 'total_amount',
          render: (text: any) => formatCurrency(text),
        },
        {
          title: 'Tiền Cọc',
          dataIndex: 'deposit',
          key: 'deposit',
          render: (text: any) => formatCurrency(text),
        },
      ],
    },
    {
      title: 'Giảm Giá',
      dataIndex: 'valueVoucher',
      key: 'valueVoucher',
      render: (valueVoucher: string | null) => valueVoucher ? valueVoucher : 'Không có giảm giá',
    },
    {
      title: 'Số Tiền Thực Thu',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (finalAmount: string) => formatCurrency(finalAmount),
    },
  ];

  return (
    <>
      <HeaderUpdateBooking />
      <div className="payment_bookingtour" style={{ marginTop: '170px'}}>
        <Table
          columns={columns}
        //   dataSource={data}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </>
  );
};

export default HistoryBookingUpdateActiveComponent;
