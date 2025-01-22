import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { Card, Table, Typography, Row, Col, Spin, Button, DatePicker, Select, message, Modal, Input, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'redux/store';
import { getStatistical } from 'redux/API/GET/Statistical/GetStatistical';
import { resetStatistics, setBookingsData } from 'redux/Reducer/StatisticalReducer';
import { getBillStatistics } from 'redux/API/GET/Statistical/GetStatisticalBill';
import { Option } from 'antd/es/mentions';
import BookingDetailsModalBills from 'modal/Statistical/BookingDetailsModalBills';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart as ChartJS } from 'chart.js';
import { useTranslation } from 'react-i18next';
import BookingDetailsModalBill from 'modal/Statistical/BookingDetailsBills';


const { Title } = Typography;

type BookingData = {
  day: number;
  date: string;
  total_bookings: number;
  total_amount: number;
};

const StatisticalBill: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'Hóa Đơn' | 'monthly' | 'weekly' | 'Chi Tiết'>('Hóa Đơn');
  const dispatch = useAppDispatch();
  const { bookingDatasBill = [], bookingsData = [], monthlyBookingsData = [], loading, error } = useSelector((state: RootState) => state.statistical);
  const chartsRef = useRef<{ [key: string]: Chart<'bar' | 'line' | 'pie'> | null }>({ daily: null, monthly: null, weekly: null });
  const today = dayjs().format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [detailedDataType1, setDetailedDataType1] = useState<'bills' | 'total_revenue' | 'total_deposit' | 'total_refund' | 'refund_bill_count' | 'bill_count' | 'special_bill_count'>('bills');
  const handleDetailedDataChange1 = (value: 'bills' | 'total_refund' | 'total_revenue' | 'total_deposit' | 'refund_bill_count' | 'bill_count' | 'special_bill_count') => {
    setDetailedDataType1(value);
  };
  const { t } = useTranslation(['StatisticaltableBill','Statistical']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dispatch(getStatistical('daily')).unwrap();
        const monthlyData = await dispatch(getStatistical('monthly')).unwrap();

        if (response && response.bookings) {
          dispatch(setBookingsData(response.bookings));
        }
      } catch (error) {
      }
    };

    fetchData();
    return () => {
      dispatch(resetStatistics());
    };
  }, [dispatch]);


  // useEffect(() => {
  //   dispatch(getBillStatistics());
  // }, [dispatch]);


  const fromDate = startDate;
  const toDate = endDate || today;

  useEffect(() => {
    if (fromDate && toDate) {
      dispatch(getBillStatistics({ from_date: fromDate, to_date: toDate }));
    }
  }, [fromDate, toDate, dispatch]);


  useEffect(() => {
    if (bookingsData.length > 0) {
      Chart.register(...registerables);
      createCharts();
    }
    return () => {
      destroyCharts();
    };
  }, [bookingsData, detailedDataType1]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const createCharts = () => {
    const ctxDaily = document.getElementById(`daily-chart1`) as HTMLCanvasElement;
    const ctxMonthly = document.getElementById(`monthly-chart1`) as HTMLCanvasElement;
    const ctxWeekly = document.getElementById(`weekly-chart1`) as HTMLCanvasElement;
    const ctxDetailed = document.getElementById(`detailed-chart1`) as HTMLCanvasElement;

    if (ctxDaily && bookingsData.length > 0) {
      chartsRef.current['daily']?.destroy();
      const dailyData = getChartData('daily');
      chartsRef.current['daily'] = new Chart<'bar' | 'line'>(ctxDaily, {
        type: 'line',
        data: dailyData,
        options: getChartOptions('Hóa Đơn'),
      });
    }

    if (ctxMonthly && bookingsData.length > 0) {
      chartsRef.current['monthly']?.destroy();
      const monthlyData = getChartData('monthly');
      chartsRef.current['monthly'] = new Chart<'bar' | 'line'>(ctxMonthly, {
        type: 'bar',
        data: monthlyData,
        options: getChartOptions('monthly'),
      });
    }

    if (ctxWeekly && bookingsData.length > 0) {
      chartsRef.current['weekly']?.destroy();
      const weeklyData = getChartData('weekly');
      chartsRef.current['weekly'] = new Chart<'bar' | 'line'>(ctxWeekly, {
        type: 'bar',
        data: weeklyData,
        options: getChartOptions('weekly'),
      });
    }

    if (ctxDetailed && bookingDatasBill.length > 0) {
      chartsRef.current['detailed']?.destroy();
      const detailedData = getChartData2('detailed');
      chartsRef.current['detailed'] = new Chart<'bar' | 'line'>(ctxDetailed, {
        type: 'bar',
        data: detailedData,
        options: getChartOptions('Chi Tiết'),
      });
    }

  };

  const destroyCharts = () => {
    chartsRef.current['daily']?.destroy();
    chartsRef.current['monthly']?.destroy();
    chartsRef.current['weekly']?.destroy();
    chartsRef.current['daily'] = null;
    chartsRef.current['monthly'] = null;
    chartsRef.current['weekly'] = null;
  };



  const getWeekNumber = (date: Date): number => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + 1) / 7);
  };


  const getStartOfWeek = (date: Date): Date => {
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date;
  };

  const getEndOfWeek = (date: Date): Date => {
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 7);
    return date;
  };

  const formatDate1 = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}/${month}`;
  };



  const getChartData = (type: 'daily' | 'monthly' | 'weekly'): ChartData<'bar' | 'line'> => {
    let labels: string[] = [];
    let dataRevenue: number[] = [];

    if (type === 'daily') {
      if (bookingsData.length > 0) {
        labels = bookingsData.map((item: BookingData) => {
          return formatDate(item.date);
        });
        dataRevenue = bookingsData.map((item: BookingData) => {
          return item.total_amount !== undefined ? item.total_amount : 0;
        });
      }
    } else if (type === 'monthly') {
      const monthLabel = t("StatisticaltableBill.monthLabel");
      labels = monthlyBookingsData.map((item) => `${monthLabel} ${item.month}`);
      dataRevenue = monthlyBookingsData.map((item) => item.total_amount || 0);
    } else if (type === 'weekly') {
      const weeklyData = bookingsData.reduce((acc: { [key: string]: number }, item: BookingData) => {
        const weekStart = getStartOfWeek(new Date(item.date));
        const weekEnd = getEndOfWeek(new Date(item.date));
        const weekNumber = getWeekNumber(new Date(item.date));
        const weekLabel = t("StatisticaltableBill.weekLabel");
        const weekRange = `${weekLabel} ${weekNumber}: ${formatDate1(weekStart)} - ${formatDate1(weekEnd)}`;
        acc[weekRange] = (acc[weekRange] || 0) + item.total_amount;
        return acc;
      }, {});

      // Lấy nhãn và dữ liệu
      labels = Object.keys(weeklyData);
      dataRevenue = Object.values(weeklyData);
      //console.log('hi', dataRevenue);

    }

    const datasets = [
      {
        label: t('StatisticaltableBill.totalAmount'),
        data: dataRevenue,
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2,
      },
    ];

    return { labels, datasets };
  };

  const getChartData2 = (type: 'detailed'): ChartData<'bar' | 'line'> => {
    let labels: string[] = [];
    let dataa: number[] = [];
    let dataPaidBookings: number[] = [];
    let dataPartialPaidBookings: number[] = [];
    let dataUnpaidBookings: number[] = [];

    if (detailedDataType1 === 'bills') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataa = bookingDatasBill.map((item) => item.total_amount_bill);
    } else if (detailedDataType1 === 'total_refund') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataa = bookingDatasBill.map((item) => item.total_amount_refund);
    } else if (detailedDataType1 === 'total_revenue') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataPaidBookings = bookingDatasBill.map((item) => item.total_revenue);
    } else if (detailedDataType1 === 'total_deposit') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataPaidBookings = bookingDatasBill.map((item) => item.total_amount_deposit);
    } else if (detailedDataType1 === 'refund_bill_count') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataPartialPaidBookings = bookingDatasBill.map((item) => item.count_bill_refund);
    } else if (detailedDataType1 === 'bill_count') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataUnpaidBookings = bookingDatasBill.map((item) => item.count_bill_paid);
    } else if (detailedDataType1 === 'special_bill_count') {
      labels = bookingDatasBill.map((item) => formatDate(item.date));
      dataa = bookingDatasBill.map((item) => item.count_booking_deposit);
    }
    let backgroundColor;
    let datasetLabel;
    let datasetData;

    switch (detailedDataType1) {
      case 'bills':
        datasetLabel = t('StatisticaltableBill.TotalAmount');
        datasetData = dataa;
        backgroundColor = datasetData.map((value) => (value < 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 206, 86, 0.8)'));
        break;
      case 'total_refund':
        datasetLabel = t('StatisticaltableBill.TotalRefund');
        datasetData = dataa;
        backgroundColor = 'rgba(153, 102, 255, 0.8)';
        break;
      case 'total_revenue':
        datasetLabel = t('StatisticaltableBill.Revenue');
        datasetData = dataPaidBookings;
        backgroundColor = datasetData.map((value) => (value < 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(75, 192, 192, 0.8)'));
        break;
      case 'total_deposit':
        datasetLabel = t('StatisticaltableBill.TotalDeposit');
        datasetData = dataPaidBookings;
        backgroundColor = 'rgba(255, 165, 0, 0.8)';
        break;
      case 'refund_bill_count':
        datasetLabel = t('StatisticaltableBill.RefundedBills1');
        datasetData = dataPartialPaidBookings;
        backgroundColor = 'rgba(54, 162, 235, 0.8)';
        break;
      case 'bill_count':
        datasetLabel = t('StatisticaltableBill.PaidBills1');
        datasetData = dataUnpaidBookings;
        backgroundColor = 'rgba(255, 99, 132, 0.8)';
        break;
      case 'special_bill_count':
        datasetLabel = t('StatisticaltableBill.DepositBookings1');
        datasetData = dataa;
        backgroundColor = 'rgba(255, 205, 86, 0.8)';
        break;
      default:
        datasetLabel = t('StatisticaltableBill.TotalAmount');
        datasetData = dataa;
        backgroundColor = 'rgba(75, 192, 192, 0.8)';
        break;
    }


    return {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data: datasetData,
          backgroundColor,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          barThickness: 40,
          type: detailedDataType1 === 'special_bill_count' || detailedDataType1 === 'bill_count' || detailedDataType1 === 'refund_bill_count' ? 'line' : 'bar', // Use 'line' for certain types
        },
      ],
    };
  };

  const getChartOptions = (type: 'Hóa Đơn' | 'monthly' | 'weekly' | 'Chi Tiết'): ChartOptions<'bar' | 'line'> => ({
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: { display: true, text: type === 'Hóa Đơn' ? '' : type === 'Chi Tiết' ? '' : '' },
      },
      y: {
        title: {
          display: true,
          text: t('StatisticaltableBill.quantity'),
        },
        //max: 1000,
        //beginAtZero: true, // Bắt đầu từ 0
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return value;
          },
        },
        // suggestedMax: undefined, // Không giới hạn giá trị tối đa
      },
    },
  });


  const getWeek = (date: Date): number => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.valueOf() - startDate.valueOf()) / 86400000);
    return Math.ceil((days + startDate.getDay() + 1) / 7);
  };


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleRowClick = (id: string, day: string) => {
    setSelectedDate(day);
    setIsModalVisible(true);
  };

  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [selectedDate1, setSelectedDate1] = useState('');

  const handle = (id: string, day: string) => {
    setSelectedDate1(day);
    setIsModalVisible1(true);
  };

  const getColumns = () => {
    if (activeChart === 'Hóa Đơn') {
      return [
        {
          title: t('StatisticaltableBill.Date'),
          dataIndex: 'date',
          key: 'date',
          width: 130,
        },
        {
          title: t('StatisticaltableBill.Amount'),
          children: [
            {
              title: t('StatisticaltableBill.TotalAmountBill'),
              dataIndex: 'total_amount_bill',
              key: 'total_amount_bill',
            },
            {
              title: t('StatisticaltableBill.TotalAmountRefund'),
              dataIndex: 'total_amount_refund',
              key: 'total_amount_refund',
            },
            {
              title: t('StatisticaltableBill.TotalDepositAmount'),
              dataIndex: 'total_amount_deposit',
              key: 'total_amount_deposit',
            },
            {
              title: (
                <span>
                  {t('StatisticaltableBill.ActualRevenue')} <br />
                  <small>{t('StatisticaltableBill.TotalAmountBillMinusRefund')}</small>
                </span>
              ),
              dataIndex: 'total_revenue',
              key: 'total_revenue',
            },
          ],
        },
        {
          title: t('StatisticaltableBill.PaidBills'),
          dataIndex: 'count_bill_paid',
          key: 'count_bill_paid',
          render: (text, record) => {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {record.date === 'Tổng' ? (
                  <Tag  style={{ margin: 0 }}>{text}</Tag>
                ) : (
                  <Button
                    type="link"
                    onClick={() => handle(record.id, record.date)}
                    style={{
                      padding: 0,
                      height: 'auto',
                      lineHeight: 'inherit',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Tag color="green" style={{ margin: 0 }}>{text}</Tag>
                  </Button>
                )}
              </div>
            );
          },
        },
        {
          title: t('StatisticaltableBill.RefundedBills'),
          dataIndex: 'count_bill_refund',
          key: 'count_bill_refund',
          render: (text, record) => {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {record.date === 'Tổng' ? (
                  <Tag style={{ margin: 0 }}>{text}</Tag>
                ) : (
                  <Button
                    type="link"
                    onClick={() => handleRowClick(record.id, record.date)}
                    style={{
                      padding: 0,
                      height: 'auto',
                      lineHeight: 'inherit',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Tag color="green" style={{ margin: 0 }}>{text}</Tag>
                  </Button>
                )}
              </div>
            );
          },
        },
        {
          title: t('StatisticaltableBill.DepositBookings'),
          dataIndex: 'count_booking_deposit',
          key: 'count_booking_deposit',
        },
      ];
    }
    return [];
  };

  const formatCurrency = (value: number | string): string => {
    if (typeof value === 'number') {
      return `${value.toLocaleString('vi-VN')} VNĐ`;
    } else if (typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `${numValue.toLocaleString('vi-VN')} VNĐ`;
      }
      return value;
    }
    return '';
  };

  const getDataForTable = () => {
    let totalAmount = 0;
    let totalRefund = 0;
    let totalDeposit = 0;
    let totalRevenue = 0;
    let totalRefund_bill = 0;
    let totalBill_count = 0;
    let totalSpecial_bill_count = 0;

    if (activeChart === 'Hóa Đơn') {
      const data = bookingDatasBill.map((item) => {
        const amount = isNaN(Number(item.total_amount_bill)) ? 0 : Number(item.total_amount_bill);
        const refund = isNaN(Number(item.total_amount_refund)) ? 0 : Number(item.total_amount_refund);
        const deposit = isNaN(Number(item.total_amount_deposit)) ? 0 : Number(item.total_amount_deposit);
        const revenue = isNaN(Number(item.total_revenue)) ? 0 : Number(item.total_revenue);
        const refundBillCount = isNaN(Number(item.count_bill_paid)) ? 0 : Number(item.count_bill_paid);
        const billCount = isNaN(Number(item.count_bill_refund)) ? 0 : Number(item.count_bill_refund);
        const specialBillCount = isNaN(Number(item.count_booking_deposit)) ? 0 : Number(item.count_booking_deposit);

        totalAmount += amount;
        totalRefund += refund;
        totalRevenue += revenue;
        totalDeposit += deposit;
        totalRefund_bill += refundBillCount;
        totalBill_count += billCount;
        totalSpecial_bill_count += specialBillCount;


        return {
          date: item.date,
          total_amount_bill: formatCurrency(amount),
          total_amount_refund: formatCurrency(refund),
          total_amount_deposit: formatCurrency(deposit),
          total_revenue: formatCurrency(revenue),
          count_bill_paid: refundBillCount,
          count_bill_refund: billCount,
          count_booking_deposit: specialBillCount,
        };
      });

      const totalRow = {
        date: 'Tổng',
        total_amount_bill: formatCurrency(totalAmount),
        total_amount_refund: formatCurrency(totalRefund),
        total_amount_deposit: formatCurrency(totalDeposit),
        total_revenue: formatCurrency(totalRevenue),
        count_bill_paid: totalRefund_bill,
        count_bill_refund: totalBill_count,
        count_booking_deposit: totalSpecial_bill_count,
      };

      return [totalRow, ...data];
    }

    return [];
  };


  const handleStartDateChange = (date: any, dateString: string) => {
    setStartDate(dateString);
  };

  const handleEndDateChange = (date: any, dateString: string) => {
    setEndDate(dateString);
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
      "Ngày": record.date || '',
      "Tổng Tiền Hóa Đơn (VND)": formatCurrency1(Number(record.total_amount_bill) || 0),
      "Tổng Số Tiền Hoàn Lại (VND)": formatCurrency1(Number(record.total_amount_refund) || 0),
      "Tổng Số Tiền Cọc Thu Được (VND)": formatCurrency1(Number(record.total_amount_deposit) || 0),
      "Số Doanh Thu Thực Tế (VND)": formatCurrency1(
        (Number(record.total_amount_bill) || 0) - (Number(record.total_amount_refund) || 0)
      ),
      "Số Hóa Đơn Đã Thanh Toán": record.count_bill_paid || 0,
      "Số Hóa Đơn Hoàn Tiền": record.count_bill_refund || 0,
      "Số Lượng Booking Cọc": record.count_booking_deposit || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Du_Lieu_Doanh_Thu");

  const handleOk = () => {
    setIsModalOpen(false);
    if (fileName) {
      handleExportToExcel(bookingDatasBill, fileName);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="StatickBooking">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Title level={4}>{t('StatisticaltableBill.Biểu đồ hàng ngày')}</Title>
            <canvas id="daily-chart1" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={4}>{t('StatisticaltableBill.Biểu đồ hàng tuần')}</Title>
            <canvas id="weekly-chart1" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={4}>{t('StatisticaltableBill.Biểu đồ hàng tháng')}</Title>
            <canvas id="monthly-chart1" />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Select
                value={detailedDataType1}
                onChange={handleDetailedDataChange1}
                style={{ width: 200, marginBottom: '20px' }}
              >
                <Option value="bills">{t('StatisticaltableBill.TotalAmount1')}</Option>
                <Option value="total_refund">{t('StatisticaltableBill.TotalRefund1')}</Option>
                <Option value="total_revenue">{t('StatisticaltableBill.TotalRevenue')}</Option>
                <Option value="total_deposit">{t('StatisticaltableBill.TotalDeposit1')}</Option>
                <Option value="refund_bill_count">{t('StatisticaltableBill.RefundedBillCount')}</Option>
                <Option value="bill_count">{t('StatisticaltableBill.PaidBillCount')}</Option>
                <Option value="special_bill_count">{t('StatisticaltableBill.DepositBookingCount')}</Option>

              </Select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <DatePicker value={startDate ? dayjs(startDate) : null} onChange={handleStartDateChange} />
                <span className="date-picker-separator">To</span>
                <DatePicker value={endDate ? dayjs(endDate) : null} onChange={handleEndDateChange} />
              </div>
            </div>
            <canvas id="detailed-chart1" style={{ width: '100%', height: '10vh' }} />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end' ,padding:'10px'}}>
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
            </div>
            <Table dataSource={getDataForTable()} columns={getColumns()} rowClassName={(record) => record.date === 'Tổng' ? 'total-row' : ''} scroll={{ y: 400 }} />
            {/* pagination={false} */}
          </Card>
        </Col>
      </Row>

      <BookingDetailsModalBills
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        day={selectedDate}
      />


      <BookingDetailsModalBill
        isVisible1={isModalVisible1}
        onClose={() => setIsModalVisible1(false)}
        day={selectedDate1}
      />
    </div>
  );
};

export default StatisticalBill;