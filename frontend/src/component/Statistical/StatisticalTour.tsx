import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Row, Col, Card, Table, Typography, Tag, Popover, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'redux/store';
import { setLoading, setError, setBookingDataTour, setBookingTour, } from 'redux/Reducer/StatisticalReducer';
import { getTourStatistics } from 'redux/API/GET/Statistical/GetStatisticalTour';
import { getTour } from 'redux/API/GET/GetTour';
import { Button } from 'antd';
import { getBranchList } from 'redux/API/GET/GetBranch';
import { ADDTourBookingStatistics } from 'redux/API/POST/GetStatisticalTourBooking';
import { useTranslation } from 'react-i18next';
import { getStatisticalTour } from 'redux/API/GET/Statistical/GetTour';
import { SearchOutlined } from '@ant-design/icons';


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const TourStatistics: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { loading, error, statisticalTour, bookingDataTour, bookingDataTourBooking } = useSelector((state: RootState) => state.statistical);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<number | null>(null);
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);
  const tourList = useSelector((state: RootState) => state.tour.tourList);
  const branchList = useSelector((state: RootState) => state.branch.branchList);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { t } = useTranslation("Tour");

  useEffect(() => {
    if (tourList.length > 0 && !selectedTour) {
      const firstTourId = tourList[0].id;
      setSelectedTour(firstTourId);
    }
  }, [tourList, selectedTour]);

  useEffect(() => {
    if (branchList.length > 0 && !selectedBranch) {
      const firstBranchId = branchList[0].id;
      setSelectedBranch(firstBranchId);
    }
  }, [branchList, selectedBranch]);

  useEffect(() => {
    if (selectedTour && selectedBranch) {
      dispatch(ADDTourBookingStatistics({
        tour_id: selectedTour,
        branch_id: selectedBranch,
        year: selectedYear
      }));
    }
  }, [selectedTour, selectedBranch, selectedYear, dispatch]);

  useEffect(() => {
    dispatch(getBranchList());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTour());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const data = await dispatch(getTourStatistics()).unwrap();
        dispatch(setBookingDataTour(data));
      } catch (err) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (bookingDataTour.length === 0) {
      fetchData();
    }
  }, [dispatch, bookingDataTour]);


  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const data = await dispatch(getStatisticalTour()).unwrap();
        dispatch(setBookingTour(data));
      } catch (err) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (statisticalTour.length === 0) {
      fetchData();
    }
  }, [dispatch, statisticalTour]);

  const sortedData = [...bookingDataTour].sort((a, b) => b.booking_count - a.booking_count).slice(0, 4);
  const labels = sortedData.map((item) => item.tour_name);
  const chartDataValues = sortedData.map((item) => item.booking_count);
  const total = chartDataValues.reduce((acc, val) => acc + val, 0);

  const pieData = {
    labels: labels,
    datasets: [
      {
        data: chartDataValues,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };


  const sortedData1 = [...bookingDataTour].sort((a, b) => b.booking_count - a.booking_count).slice(0, 10);
  const labels1 = sortedData1.map((item) => item.tour_name);
  const chartDataValues1 = sortedData1.map((item) => item.booking_count);

  const barData = {
    labels: labels1,
    datasets: [
      {
        label: t('Tour.number_of_customers'),
        data: chartDataValues1,
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
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
          text: 'Số liệu',
        },
      },
    },
  };

  const barOptions1 = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
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
          text: t('Tour.quantity'),
        },
        beginAtZero: true,
        //max: 50, // Giới hạn tối đa (cố định)
        ticks: {
          stepSize: 5,
          callback: function (value) {
            return `${value} lượt`;
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 18 },
          padding: 20,
          boxWidth: 20,

        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            const percentage = total > 0 ? ((value / total) * 100) : 0;
            return `${label}: ${value} chuyến (${percentage.toFixed(0)}%)`;
          },
        },
      },
    },
    layout: {
    },
    onHover: (event: any, elements: any) => {
      if (elements.length) {
        const index = elements[0].index;
        setSelectedLabel(labels[index]);
        setSelectedData(chartDataValues[index]);
        setSelectedPercentage(total > 0 ? (chartDataValues[index] / total) * 100 : 0);
      } else {
        setSelectedLabel(null);
        setSelectedData(null);
        setSelectedPercentage(null);
      }
    },
  };


  const chartLabels: string[] = [];
  const chartDataValues2: number[] = [];
  const chartDataValues3: number[] = [];
  const chartDataValues4: number[] = [];

  if (bookingDataTourBooking && bookingDataTourBooking.data && Array.isArray(bookingDataTourBooking.data)) {
    bookingDataTourBooking.data.forEach(item => {
      chartLabels.push(t("Tour.month_label", { month: item.month }));
      chartDataValues2.push(item.total_bookings || 0);
      chartDataValues3.push(item.average_days || 0);
      chartDataValues4.push(item.average_days || 0);
    });
  }



  console.log('bug', chartLabels);


  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: t("Tour.total_tour_bookings"), // Tổng số Tour Booking
        data: chartDataValues2,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54,162,235,0.2)',
        tension: 0.4,
      },
      {
        label: t("Tour.average_days"), // Ngày trung bình (ngày)
        data: chartDataValues3,
        borderColor: '#FFCE56',
        backgroundColor: 'rgba(255,206,86,0.2)',
        tension: 0.4,
      },
      // {
      //   label: 'Tổng Số Khách Hàng',
      //   data: chartDataValues4,
      //   borderColor: '#4CAF50',
      //   backgroundColor: 'rgba(76,175,80,0.2)',
      //   tension: 0.4,
      // },
      // {
      //   label: 'Số Lần Hủy Tour',
      //   data: chartDataValues3,
      //   borderColor: '#FF5733',
      //   backgroundColor: 'rgba(255,87,51,0.2)',
      //   tension: 0.4,
      // },
    ],
  };


  const tableData = bookingDataTourBooking?.data?.reduce((acc: any[], item) => {
    let tourIndex = acc.findIndex(tour => tour.tour_name === bookingDataTourBooking?.inforTour?.tour_name);

    if (tourIndex === -1) {
      acc.push({
        tour_name: bookingDataTourBooking?.inforTour?.tour_name || 'Không có tên tour',
        branch_name: bookingDataTourBooking?.inforTour?.branch_name || 'Không có tên chi nhánh',
        four_month_max: Array.isArray(bookingDataTourBooking?.inforTour?.['4month_max'])
          ? bookingDataTourBooking?.inforTour?.['4month_max'].join(', ')
          : 'Chưa xác định',
        four_month_min: Array.isArray(bookingDataTourBooking?.inforTour?.['4month_min'])
          ? bookingDataTourBooking?.inforTour?.['4month_min'].join(', ')
          : 'Chưa xác định',
        favorite_amount_days: bookingDataTourBooking?.inforTour?.favorite_amount_days || 'Chưa xác định',
        bookings: [],
        total_bookings: 0,
      });
      tourIndex = acc.length - 1;
    }

    acc[tourIndex].bookings.push({
      month: item.month,
      total_bookings: item.total_bookings,
    });

    acc[tourIndex].total_bookings += item.total_bookings;

    return acc;
  }, []);

  const columns = [
    {
      title: t("Tour.tour_name"),
      dataIndex: "tour_name",
      key: "tour_name",
    },
    {
      title: t("Tour.total_bookings"),
      dataIndex: "total_bookings",
      key: "total_bookings",
    },
    {
      title: t("Tour.branch_name"),
      dataIndex: "branch_name",
      key: "branch_name",
    },
    {
      title: t("Tour.four_month_max"),
      dataIndex: "four_month_max",
      key: "four_month_max",
    },
    {
      title: t("Tour.four_month_min"),
      dataIndex: "four_month_min",
      key: "four_month_min",
    },
    {
      title: t("Tour.favorite_amount_days"),
      dataIndex: "favorite_amount_days",
      key: "favorite_amount_days",
    },
  ];




  const columnsTable = [
    {
      title: t("Tour.Tour"),
      dataIndex: "tour_name",
      key: "tour_name",
    },
    {
      title: t("Tour.Start - End"),
      dataIndex: "start_time",
      key: "start_time",
    },
    {
      title: t("Tour.End"),
      dataIndex: "end_time",
      key: "end_time",
    },
    {
      title: t("Tour.Number of Guests"),
      dataIndex: "quantity_customer",
      key: "quantity_customer",
      render: (quantity: number, record: any) => (
        <Popover
          content={
            <div>
              {record.customers && record.customers.length > 0 ? (
                record.customers.map((customer: { fullName: string; phone: string }, index: number) => (
                  <p key={index}>
                    <strong>{index + 1}:</strong> {customer.fullName} - {customer.phone}
                  </p>
                ))
              ) : (
                <p>Chưa Xác Định</p>
              )}
            </div>
          }
          trigger="hover"
        >
          <span>{quantity}</span>
        </Popover>
      ),
    },
    {
      title: t("Tour.Total Collected Amount"),
      dataIndex: "bill",
      key: "bill",
      render: (bill: number | null) =>
        bill !== null ? (
          `${bill.toLocaleString('vi-VN')} VND`  // Sử dụng 'vi-VN' để đảm bảo dấu phân cách hàng nghìn
        ) : (
          "0 VND"
        ),
    },
    {
      title: t("Tour.Total Refund Amount"),
      dataIndex: "refund",
      key: "refund",
      render: (refund: number | null) =>
        refund !== null ? (
          `${refund.toLocaleString()} VND`
        ) : (
          "0"
        ),
    },
    {
      title: t("Tour.Total Amount"),
      dataIndex: "payment",
      key: "payment",
      render: (payment: number | null) =>
        payment !== null ? (
          `${payment.toLocaleString()} VND`
        ) : (
          "0"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "";
        let label = "";

        switch (status) {
          case "waiting":
            color = "orange";
            label = "Chờ xác nhận";
            break;
          case "ended\n":
            color = "green";
            label = "Đã kết thúc";
            break;
          case "cancel":
            color = "red";
            label = "Đã hủy";
            break;
          case "cancel":
            color = "red";
            label = "is_moving";
            break;
          default:
            color = "default";
            label = "Chưa xác định";
            break;
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const filteredTourData = statisticalTour.filter((tour) =>
    tour.tour_name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card >
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Input
                placeholder="Tìm tên tour..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 200, marginRight: 8, display: 'inline-block' }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => { }}
                style={{ display: 'inline-block' }}
              >
                Tìm kiếm
              </Button>
            </div>
            <Table dataSource={filteredTourData} columns={columnsTable} pagination={false} scroll={{ y: 400 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Typography.Title level={4}>{t("Tour.booking_rate_by_type")}</Typography.Title>
            <Pie data={pieData} options={pieChartOptions} />
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <Typography.Title level={4}>{t("Tour.top_10_tour_trends")}</Typography.Title>
            <Bar data={barData} options={barOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={t("Tour.customer_trends_label")} bordered>
            <div className="select-container" >
              <select className="select-dropdown" onChange={(e) => setSelectedTour(e.target.value)} value={selectedTour} style={{ marginLeft: '15px' }}>
                {tourList.map((tour) => (
                  <option key={tour.id} value={tour.id}>{tour.name}</option>
                ))}
              </select>
              <select className="select-dropdown"
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                style={{ marginLeft: '15px' }}
              >
                {branchList.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              <select
                className="select-dropdown"
                onChange={(e) => setSelectedYear(e.target.value)}
                value={selectedYear}
                style={{ marginLeft: '15px' }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <Line data={lineData} options={barOptions1} style={{ width: '100%', height: '1opx' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={t("Tour.revenue_customer_details")} bordered>
            <Table dataSource={tableData} columns={columns} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TourStatistics;
