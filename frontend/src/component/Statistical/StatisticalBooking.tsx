import React, { useEffect, useRef, useState, useTransition } from 'react';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { Card, Table, Typography, Row, Col, Spin, Button, Modal, Select, DatePicker, Input, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'redux/store';
import { BookingDatas, MonthlyBookingData, resetStatistics, setBookingsData, setMonthlyBookingsData } from 'redux/Reducer/StatisticalReducer';
import { getStatistical } from 'redux/API/GET/Statistical/GetStatistical';
import BookingDetailsModal from 'modal/Statistical/BookingDetailsModal';
import { Option } from 'antd/es/mentions';
import { getBookingStatistics } from 'redux/API/GET/Statistical/GetStatisticalBooking';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

type BookingData = {
  day: number;
  date: string;
  total_bookings: number;
  total_amount: number;
};

const StatisticalComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeChart, setActiveChart] = useState<'Thống Kê' | 'monthly' | 'weekly' | 'Chi Tiết'>('Thống Kê');
  const { bookingsDatas = [], bookingsData = [], monthlyBookingsData = [], loading, error } = useSelector((state: RootState) => state.statistical);
  const chartsRef = useRef<{ [key: string]: Chart<'bar' | 'line' | 'pie'> | null }>({ daily: null, monthly: null, weekly: null, detailed: null });
  const [detailedDataType, setDetailedDataType] = useState<'booking' | 'deposit' | 'price' | 'partial_paid' | 'unpaid' | 'sale_agent'>('booking');
  const today = dayjs().format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);

  const { t } = useTranslation(['Statisticaltable', 'Statistical']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dispatch(getStatistical('daily')).unwrap();
        const monthlyData = await dispatch(getStatistical('monthly')).unwrap();
        if (response && response.bookings) {
          dispatch(setBookingsData(response.bookings));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    return () => {
      dispatch(resetStatistics());
    };
  }, [dispatch]);


  const fromDate = startDate;
  const toDate = endDate || today;

  useEffect(() => {
    if (fromDate && toDate) {
      dispatch(getBookingStatistics({ from_date: fromDate, to_date: toDate }));
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
  }, [bookingsData, detailedDataType, dispatch]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const createCharts = () => {
    const ctxDaily = document.getElementById(`daily-chart`) as HTMLCanvasElement;
    const ctxMonthly = document.getElementById(`monthly-chart`) as HTMLCanvasElement;
    const ctxWeekly = document.getElementById(`weekly-chart`) as HTMLCanvasElement;
    const ctxDetailed = document.getElementById(`detailed-chart`) as HTMLCanvasElement;  // Biểu đồ chi tiết

    if (ctxDaily && bookingsData.length > 0) {
      chartsRef.current['daily']?.destroy();
      const dailyData = getChartData('daily');
      chartsRef.current['daily'] = new Chart<'bar' | 'line'>(ctxDaily, {
        type: 'line',
        data: dailyData,
        options: getChartOptions('Thống Kê'),
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

    if (ctxDetailed && bookingsDatas.length > 0) {
      chartsRef.current['detailed']?.destroy();
      const detailedData = getChartData1('detailed');
      chartsRef.current['detailed'] = new Chart<'bar' | 'line'>(ctxDetailed, {
        type: 'line',
        data: detailedData,
        options: getChartOptions('Chi Tiết'),
      });
    }
  };

  const destroyCharts = () => {
    chartsRef.current['daily']?.destroy();
    chartsRef.current['monthly']?.destroy();
    chartsRef.current['weekly']?.destroy();
    chartsRef.current['detailed']?.destroy();
    chartsRef.current['daily'] = null;
    chartsRef.current['monthly'] = null;
    chartsRef.current['weekly'] = null;
    chartsRef.current['detailed'] = null;
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
    let dataBookings: number[] = [];
    if (type === 'daily') {
      labels = bookingsData.map((item: BookingData) => formatDate(item.date));
      dataBookings = bookingsData.map((item: BookingData) => item.total_bookings);
    } else if (type === 'monthly') {
      const monthLabel = t("Statisticaltable.monthLabel");
      labels = monthlyBookingsData.map((item: MonthlyBookingData) => `${monthLabel} ${item.month}`);
      dataBookings = monthlyBookingsData.map((item: MonthlyBookingData) => item.total_bookings);
    } else if (type === 'weekly') {
      const weeklyData = bookingsData.reduce((acc: { [key: string]: number }, item: BookingData) => {
        const weekStart = getStartOfWeek(new Date(item.date));
        const weekEnd = getEndOfWeek(new Date(item.date));
        const weekNumber = getWeekNumber(new Date(item.date));
        const weekLabel = t("Statisticaltable.weekLabel");
        const weekRange = `${weekLabel} ${weekNumber}: ${formatDate1(weekStart)} - ${formatDate1(weekEnd)}`;
        acc[weekRange] = (acc[weekRange] || 0) + item.total_bookings;
        return acc;
      }, {});

      labels = Object.keys(weeklyData);
      dataBookings = Object.values(weeklyData);
    }

    return {
      labels,
      datasets: [
        {
          label: t('Statisticaltable.Số lượng booking'),
          data: dataBookings,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
      ],

    };
  };

  const handleDetailedDataChange = (type: typeof detailedDataType) => {
    setDetailedDataType(type);
  };

  const getChartData1 = (type: 'detailed'): ChartData<'bar' | 'line'> => {
    let labels: string[] = [];
    let dataBookings: number[] = [];
    let dataPaidBookings: number[] = [];
    let dataPartialPaidBookings: number[] = [];
    let dataUnpaidBookings: number[] = [];
    let datasaleagentBookings: number[] = [];

    if (detailedDataType === t('booking')) {
      labels = bookingsDatas.map((item) => formatDate(item.date));
      dataBookings = bookingsDatas.map((item) => item.total_bookings);
    } else if (detailedDataType === 'deposit') {
      labels = bookingsDatas.map((item) => formatDate(item.date));
      dataBookings = bookingsDatas.map((item) => item.total_deposit);
    } else if (detailedDataType === 'price') {
      labels = bookingsDatas.map((item) => formatDate(item.date));
      dataPaidBookings = bookingsDatas.map((item) => item.paid_bookings);
    } else if (detailedDataType === 'partial_paid') {
      labels = bookingsDatas.map((item) => formatDate(item.date));
      dataPartialPaidBookings = bookingsDatas.map((item) => item.partial_paid_bookings);
    } else if (detailedDataType === 'unpaid') {
      labels = bookingsDatas.map((item) => formatDate(item.date));
      dataUnpaidBookings = bookingsDatas.map((item) => item.unpaid_bookings);
    } else if (detailedDataType === 'sale_agent') {
      labels = bookingsDatas.map((item) => formatDate(item.date));
      dataBookings = bookingsDatas.map((item) => item.sale_agent_bookings);
    }
    let backgroundColor;
    let datasetLabel;
    let datasetData;

    switch (detailedDataType) {
      case 'booking':
        backgroundColor = 'rgba(75, 192, 192, 0.8)';
        datasetLabel = t('Statisticaltable.Số lượng booking');
        datasetData = dataBookings;
        break;
      case 'deposit':
        backgroundColor = 'rgba(153, 102, 255, 0.8)';
        datasetLabel = t('Statisticaltable.Tổng tiền cọc');
        datasetData = dataBookings;
        break;
      case 'price':
        backgroundColor = 'rgba(255, 159, 64, 0.8)';
        datasetLabel = t('Statisticaltable.Booking đã thanh toán');
        datasetData = dataPaidBookings;
        break;
      case 'partial_paid':
        backgroundColor = 'rgba(54, 162, 235, 0.8)';
        datasetLabel = t('Statisticaltable.Booking đã thanh toán một phần');
        datasetData = dataPartialPaidBookings;
        break;
      case 'unpaid':
        backgroundColor = 'rgba(255, 99, 132, 0.8)';
        datasetLabel = t('Statisticaltable.Booking chưa thanh toán');
        datasetData = dataUnpaidBookings;
        break;
      case 'sale_agent':
        backgroundColor = 'rgba(255, 205, 86, 0.8)';
        datasetLabel = t('Statisticaltable.Booking từ đại lý');
        datasetData = dataBookings;
        break;
      default:
        backgroundColor = 'rgba(75, 192, 192, 0.8)';
        datasetLabel = t('Statisticaltable.Số lượng booking');
        datasetData = dataBookings;
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
          borderWidth: 2,
          barThickness: 20,
          type: detailedDataType === 'price' || detailedDataType === 'partial_paid' || detailedDataType === 'unpaid' ? 'line' : 'bar', // Use 'line' for certain types
        },
      ],
    };
  };

  const getChartOptions = (type: 'Thống Kê' | 'monthly' | 'weekly' | 'Chi Tiết'): ChartOptions<'bar' | 'line'> => ({
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: { display: true, text: type === 'Thống Kê' ? '' : type === 'monthly' ? '' : type === 'Chi Tiết' ? '' : '' },
      },
      y: {
        title: {
          display: true,
          text: t('Statisticaltable.quantity'),
        },
        max: 50,
        beginAtZero: true,
        ticks: {
          stepSize: 3,
          callback: function (value) {
            return value;
          },
        },
        suggestedMax: undefined,
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

  const handleRowClick = (date) => {
    setSelectedDate(date);
    setIsModalVisible(true);
  };



  const getColumns = () => {
    if (activeChart === 'Thống Kê') {
      return [
        {
          title: t('Statisticaltable.Ngày'),
          dataIndex: 'date',
          key: 'date',
          render: (text, record) => {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {record.date === 'Tổng' ? (
                  text
                ) : (
                  <Button
                    type="link"
                    onClick={() => handleRowClick(text)}
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
          title: t('Statisticaltable.TổngBookings'),
          dataIndex: 'total_bookings',
          key: 'total_bookings',
        },
        {
          title: t('Statisticaltable.TổngTiềnCọc'),
          dataIndex: 'total_deposit',
          key: 'total_deposit',
        },
        {
          title: t('Statisticaltable.BookingsĐãThanhToán'),
          dataIndex: 'paid_bookings',
          key: 'paid_bookings',
        },
        {
          title: t('Statisticaltable.BookingsChưaThanhToán'),
          dataIndex: 'unpaid_bookings',
          key: 'unpaid_bookings',
        },
        {
          title: t('Statisticaltable.BookingsThanhToánMộtPhần'),
          dataIndex: 'partial_paid_bookings',
          key: 'partial_paid_bookings',
        },
        {
          title: t('Statisticaltable.BookingsĐạiLý'),
          dataIndex: 'sale_agent_bookings',
          key: 'sale_agent_bookings',
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
    let totalBookings = 0;
    let totalDeposit = 0;
    let totalPaidBookings = 0;
    let totalUnpaidBookings = 0;
    let totalPartialPaidBookings = 0;
    let totalSaleAgentBookings = 0;

    if (activeChart === 'Thống Kê') {
      const data = bookingsDatas.map((item) => {
        const totalBookingsItem = item.total_bookings ?? 0;
        const deposit = isNaN(Number(item.total_deposit)) ? 0 : Number(item.total_deposit);
        const paidBookingsItem = item.paid_bookings ?? 0;
        const unpaidBookingsItem = item.unpaid_bookings ?? 0;
        const partialPaidBookingsItem = item.partial_paid_bookings ?? 0;
        const saleAgentBookingsItem = item.sale_agent_bookings ?? 0;

        totalBookings += totalBookingsItem;
        totalDeposit += deposit;
        totalPaidBookings += paidBookingsItem;
        totalUnpaidBookings += unpaidBookingsItem;
        totalPartialPaidBookings += partialPaidBookingsItem;
        totalSaleAgentBookings += saleAgentBookingsItem;

        return {
          //key: item.date,
          date: item.date,
          total_bookings: totalBookingsItem,
          total_deposit: formatCurrency(deposit),
          paid_bookings: paidBookingsItem,
          unpaid_bookings: unpaidBookingsItem,
          partial_paid_bookings: partialPaidBookingsItem,
          sale_agent_bookings: saleAgentBookingsItem,
        };
      });

      const totalRow = {
        date: 'Tổng',
        total_bookings: totalBookings,
        total_deposit: formatCurrency(totalDeposit),
        paid_bookings: totalPaidBookings,
        unpaid_bookings: totalUnpaidBookings,
        partial_paid_bookings: totalPartialPaidBookings,
        sale_agent_bookings: totalSaleAgentBookings,
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
      "Tổng Số Booking": formatCurrency1(Number(record.total_bookings) || 0),
      "Tổng Số Tiền Cọc (VND)": formatCurrency1(Number(record.total_deposit) || 0),
      "Bookings Đã Thanh Toán": record.paid_bookings || 0,
      "Bookings Chưa Thanh Toán": record.unpaid_bookings || 0,
      "Bookings Thanh Toán Một Phần": record.partial_paid_bookings || 0,
      "Bookings Đại Lý": record.sale_agent_bookings || 0,
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
      { wch: 30 },
      { wch: 25 },
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Du_Lieu_Booking");

  const handleOk = () => {
    setIsModalOpen(false);
    if (fileName) {
      handleExportToExcel(bookingsDatas, fileName);
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
            <Title level={4}>{t('Statisticaltable.Biểu đồ hàng ngày')}</Title>
            <canvas id="daily-chart" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={4}>{t('Statisticaltable.Biểu đồ hàng tuần')}</Title>
            <canvas id="weekly-chart" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={4}>{t('Statisticaltable.Biểu đồ hàng tháng')}</Title>
            <canvas id="monthly-chart" />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Select
                value={detailedDataType}
                onChange={handleDetailedDataChange}
                style={{ width: 200, marginBottom: '20px' }}
              >
                <Option value="booking">{t('Statisticaltable.Số lượng booking')}</Option>
                <Option value="deposit">{t('Statisticaltable.Tổng tiền cọc')}</Option>
                <Option value="price">{t('Statisticaltable.Booking đã thanh toán')}</Option>
                <Option value="partial_paid">{t('Statisticaltable.Booking đã thanh toán một phần')}</Option>
                <Option value="unpaid">{t('Statisticaltable.Booking chưa thanh toán')}</Option>
                <Option value="sale_agent">{t('Statisticaltable.Booking từ đại lý')}</Option>
              </Select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <DatePicker value={startDate ? dayjs(startDate) : null} onChange={handleStartDateChange} />
                <span className="date-picker-separator">To</span>
                <DatePicker value={endDate ? dayjs(endDate) : null} onChange={handleEndDateChange} />
              </div>
            </div>
            <canvas id="detailed-chart" style={{ width: '100%', height: '10vh' }} />

          </Card>

        </Col>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
              <Button type="primary" onClick={() => setIsModalOpen(true)}>
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
          </Card>
        </Col>
      </Row>

      <BookingDetailsModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        date={selectedDate}
      />
    </div>

  );
};

export default StatisticalComponent;
