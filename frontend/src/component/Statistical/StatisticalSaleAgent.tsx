import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { Card, Table, Typography, Row, Col, Spin, Button, DatePicker, Select, Modal, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'redux/store';
import { getStatistical } from 'redux/API/GET/Statistical/GetStatistical';
import { resetStatistics, setBookingsData } from 'redux/Reducer/StatisticalReducer';
import { getSourceAgent } from 'redux/API/GET/GetSourceAgent';
import dayjs from 'dayjs';
import { getSaleStatistics } from 'redux/API/GET/Statistical/GetStatisticaSale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const StatisticalBill: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'Hóa Đơn1' | 'monthly' | 'weekly' | 'Chi Tiết'>('Hóa Đơn1');
  const dispatch = useAppDispatch();
  const { bookingDataSaleBooking = [], bookingsData = [], monthlyBookingsData = [], loading, error } = useSelector((state: RootState) => state.statistical);
  const chartsRef = useRef<{ [key: string]: Chart<'bar' | 'line' | 'pie'> | null }>({ daily: null, monthly: null, weekly: null });
  const AgentList = useSelector((state: RootState) => state.sourceAgent.sourceList);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(dayjs().format('YYYY-MM'));

  const { t } = useTranslation(["Sale", 'Statistical']);



  useEffect(() => {
    dispatch(getSourceAgent());
  }, [dispatch]);

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


  useEffect(() => {
    if (selectedTour && selectedYear) {
      dispatch(getSaleStatistics({ sale_agent_id: selectedTour, year_month: selectedYear }));
    }
  }, [selectedTour, selectedYear, dispatch]);

  useEffect(() => {
    if (AgentList.length > 0) {
      const firstTourId = AgentList[0].id;
      setSelectedTour(firstTourId);
      dispatch(getSaleStatistics({ sale_agent_id: firstTourId, year_month: selectedYear }));
    }
  }, [AgentList, selectedYear, dispatch]);

  const handleTourChange = (e) => {
    const newSelectedTour = e.target.value;
    console.log('Selected Tour:', newSelectedTour);
    setSelectedTour(newSelectedTour);

  };


  useEffect(() => {
    if (bookingsData.length > 0) {
      Chart.register(...registerables);
      createCharts();
    }
    return () => {
      destroyCharts();
    };
  }, [bookingsData]);

  useEffect(() => {
    if (bookingDataSaleBooking.length > 0) {
      Chart.register(...registerables);
      createCharts();
    }
    return () => {
      destroyCharts();
    };
  }, [bookingDataSaleBooking]);


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const createCharts = () => {
    const ctxDaily = document.getElementById(`daily-chart3`) as HTMLCanvasElement;
    const ctxMonthly = document.getElementById(`monthly-chart3`) as HTMLCanvasElement;
    const ctxWeekly = document.getElementById(`weekly-chart3`) as HTMLCanvasElement
    const ctxDetailed = document.getElementById(`detailed-chart3`) as HTMLCanvasElement;

    if (ctxDetailed && bookingDataSaleBooking.length > 0) {
      chartsRef.current['detailed']?.destroy();
      const detailedData = getChartData3('detailed');
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
  const getChartData3 = (type: 'detailed'): ChartData<'bar'> => {
    const labels = bookingDataSaleBooking.map((item) => formatDate(item.date));
    const dataa = bookingDataSaleBooking.map((item) => item.booking_count);

    return {
      labels,
      datasets: [
        {
          label: t('Sale.Số Lượng Booking'),
          data: dataa,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          barThickness: 20,
          type: 'bar',
        },
      ],
    };
  };


  const getChartOptions = (type: 'Hóa Đơn' | 'monthly' | 'weekly' | 'Chi Tiết'): ChartOptions<'bar' | 'line'> => ({
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
        },
      },
      y: {
        title: {
          display: true,
          text: t('Sale.quantity'),
        },
        max: 10,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return value;
          },
        },
      },
    },
  });


  const getWeek = (date: Date): number => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.valueOf() - startDate.valueOf()) / 86400000);
    return Math.ceil((days + startDate.getDay() + 1) / 7);
  };


  const getColumns = () => {
    if (activeChart === 'Hóa Đơn1') {
      return [
        {
          title: t('Sale.date'),
          dataIndex: 'date',
          key: 'date',
        },
        {
          title: t('Sale.booking_count'),
          dataIndex: 'booking_count',
          key: 'booking_count',
        },
        {
          title: t('Sale.total_deposit'),
          dataIndex: 'total_deposit',
          key: 'total_deposit',
        },
        {
          title: t('Sale.total_amount'),
          dataIndex: 'total_amount',
          key: 'total_amount',
        },
        {
          title: t('Sale.paid_commission'),
          dataIndex: 'paid_commission',
          key: 'paid_commission',
        },
        {
          title: t('Sale.unpaid_commission'),
          dataIndex: 'unpaid_commission',
          key: 'unpaid_commission',
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

    if (activeChart === 'Hóa Đơn1') {
      const data = Array.isArray(bookingDataSaleBooking) ? bookingDataSaleBooking.map((item) => {
        const deposit = isNaN(Number(item.total_deposit)) ? 0 : Number(item.total_deposit);
        const paidAmount = isNaN(Number(item.total_amount)) ? 0 : Number(item.total_amount);
        const unpaid = isNaN(Number(item.paid_commission)) ? 0 : Number(item.paid_commission);
        const partialPaid = isNaN(Number(item.unpaid_commission)) ? 0 : Number(item.unpaid_commission);

        totalBookings += item.booking_count;
        totalDeposit += deposit;
        totalPaidBookings += paidAmount;
        totalUnpaidBookings += unpaid;
        totalPartialPaidBookings += partialPaid;


        return {
          //key: item.date,
          date: item.date,
          booking_count: item.booking_count,
          total_deposit: formatCurrency(item.total_deposit),
          total_amount: formatCurrency(item.total_amount),
          paid_commission: item.paid_commission,
          unpaid_commission: item.unpaid_commission,
        };
      }) : [];
      if (data.length === 0) {
        const totalRow = {
          //key: 'total',
          date: 'Tổng',
          booking_count: 0,
          total_deposit: formatCurrency(0),
          total_amount: formatCurrency(0),
          paid_commission: 0,
          unpaid_commission: 0,
        };
        return [totalRow];
      }
      const totalRow = {
        //key: 'total',
        date: 'Tổng',
        booking_count: totalBookings,
        total_deposit: formatCurrency(totalDeposit),
        total_amount: formatCurrency(totalPaidBookings),
        paid_commission: totalUnpaidBookings,
        unpaid_commission: totalPartialPaidBookings,
      };
      return [totalRow, ...data];
    }

    return [];
  };



  const handleStartDateChange = (date: dayjs.Dayjs | null, dateString: string) => {
    setSelectedYear(dateString);
    console.log('Năm-Tháng đã chọn:', dateString);
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
      "Số Lượng Booking": formatCurrency1(Number(record.booking_count) || 0),
      "Số Tiền Cọc (VND)": formatCurrency1(Number(record.total_deposit) || 0),
      "Số Tiền Booking (VND)": formatCurrency1(Number(record.total_amount) || 0),
      "Số Bookings đã trả hoa hồng cho đại lý": record.paid_commission || 0,
      "Số Booking chưa trả cho đại lý": record.unpaid_commission || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
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
      handleExportToExcel(bookingDataSaleBooking, fileName);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="StatickBooking">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select
                className="select-dropdown"
                onChange={handleTourChange}
                value={selectedTour}
                style={{ marginRight: '5px' }}>
                {AgentList.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <DatePicker
                  picker="month"
                  onChange={handleStartDateChange}
                  format="YYYY-MM"
                  value={dayjs(selectedYear, 'YYYY-MM')}
                  style={{ marginLeft: '15px' }}
                />
              </div>
            </div>
            <canvas id="detailed-chart3" style={{ width: '100%', height: '10vh' }} />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
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
            <Table dataSource={getDataForTable()} columns={getColumns()} />
            {/* rowClassName={(record) => record.key === 'total' ? 'total-row' : ''} */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticalBill;