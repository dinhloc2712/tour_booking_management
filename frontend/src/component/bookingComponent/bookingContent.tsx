import { Button, notification, Skeleton, Flex, Tag, Table } from 'antd'
import ButtonShowModal from 'component/Global/Button/ButtonModal'
import TableComponent from 'component/Global/Table/TableComponent'
import DetailBooking from 'modal/Booking/DetailBookingModal/DetailBookingModal' // Đảm bảo đường dẫn đúng
import { useEffect, useState } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'
import { getOneBooking } from 'redux/API/GET/getBooking/getOneBooking'
import { showModal } from 'redux/Redux/modal/modalSlice'
import { RootState, useAppDispatch } from 'redux/store'
import CancelBookingModal from 'modal/Booking/CancelBoookingModal/CancelBookingModal' // Đảm bảo đường dẫn đúng
import { setCurrentBooking, clearCurrentBooking } from 'redux/Reducer/Booking'

const BookingContent: React.FC = () => {
  const dispatch = useAppDispatch()
  const data = useSelector((state: RootState) => state.booking.bookingList)
  const user = useSelector((state: RootState) => state.auth.user)

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(true)
  const [isDetailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  )
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const booking = useSelector((state: RootState) => state.booking.bookingList)
  const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

  const { t } = useTranslation(['booking', 'status'])

  const filteredServices = booking.filter(booking =>
    (booking.fullname && booking.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      await dispatch(getBooking())
      setLoading(false)
    }
    fetchBookings()
  }, [dispatch])

  const columns = [
    {
      title: 'STT',
      render: (text, record, index) => {
        return (currentPage - 1) * pageSize + index + 1 // Tính STT liên tục
      },
      key: 'id',
      width: '4%',
    },
    {
      title: t('booking.tourName'),
      dataIndex: 'booking_tours',
      key: 'bookingTours',
      render: (bookingTours) =>
        bookingTours.map((tour) => tour.name_tour).join(', '),
    },
    {
      title: t('booking.quantity_customer'),
      dataIndex: 'quantity_customer',
      key: 'quantity_customer',
      width: '6%',
    },
    {
      title: t('booking.booker'),
      dataIndex: ['booker', 'fullname'],
      key: 'booker',
    },
    {
      title: t('booking.phone'),
      dataIndex: ['booker', 'user_detail', 'phone'],
      key: 'phone',
      width: '15%',
    },
    {
      title: t('booking.address'),
      dataIndex: ['booker', 'user_detail', 'address'],
      key: 'address',
    },
    {
      title: t('booking.checkin_time'),
      dataIndex: 'checkin_time',
      key: 'checkin_time',
      render: (text) => {
        if (!text) return 'N/A'
        const date = new Date(text)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${day}/${month}/${year}  -  ${hours}:${minutes}:${seconds}`
      },
    },
    {
      title: t('booking.status'),
      key: 'status',
      render: (record) => {
        const getStatusPaymentTag = (statusPayment) => {
          switch (statusPayment) {
            case 'deposit':
              return <Tag color="orange">{t('status.payment.deposit', { defaultValue: 'Đã đặt cọc' })}</Tag>;
            case 'unpaid':
              return <Tag color="red">{t('status.payment.unpaid', { defaultValue: 'Chưa thanh toán' })}</Tag>;
            case 'paid':
              return <Tag color="green">{t('status.payment.paid', { defaultValue: 'Đã thanh toán' })}</Tag>;
            default:
              return <Tag color="default">{t('status.payment.undefined', { defaultValue: 'Không xác định' })}</Tag>;
          }
        };

        const getStatusTouringTag = (statusTouring) => {
          switch (statusTouring) {
            case 'waiting':
              return <Tag color="blue">{t('status.touring.waiting', { defaultValue: 'Đang chờ' })}</Tag>;
            case 'checked_in':
              return <Tag color="cyan">{t('status.touring.checked_in', { defaultValue: 'Đã check-in' })}</Tag>;
            case 'cancel':
              return <Tag color="magenta">{t('status.touring.cancel', { defaultValue: 'Đã hủy' })}</Tag>;
            case 'completed':
              return <Tag color="green">{t('status.touring.completed', { defaultValue: 'Hoàn thành' })}</Tag>;
            case 'in_progress':
              return <Tag color="purple">{t('status.touring.in_progress', { defaultValue: 'Đang diễn ra' })}</Tag>;
            default:
              return <Tag color="default">{t('status.touring.undefined', { defaultValue: 'Không xác định' })}</Tag>;
          }
        };

        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {getStatusPaymentTag(record.status_payment)}
            {getStatusTouringTag(record.status_touring)}
          </div>
        )
      },
    },
    {
      title: t('booking.actions'),
      key: 'action',
      fixed: 'right',
      width: '10%',
      render: (text: string, record: { id: string }) => (
        <Button
          type="primary"
          onClick={() => handleShowBookingDetails(record.id)}
        >
          {t('booking.details')}
        </Button>
      ),
    },
  ]

  const handlelock = () => {
    console.log('s')
  }


  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const handleAddBooking = () => {
    dispatch(clearCurrentBooking())
    dispatch(
      setCurrentBooking({
        booking_id: '',
        fullname: '',
        passport: '',
        phone: '',
        address: '',
        checkin_time: '',
        quantity_customer: 1,
        deposit: 0,
        status_payment: 'unpaid',
        status_touring: 'waiting',
        source_id: '',
        note: '',
        total_amount: 0,
        tours: [],
        customers: [],
      })
    )
    navigate('/updatebooking')
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
  }

  const handleShowBookingDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    dispatch(getOneBooking(bookingId)).then(() => {
      setDetailModalVisible(true)
    })
  }

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission)
  }

  const handleModalClose = () => {
    setDetailModalVisible(false)
    // Sau khi modal đóng, gọi lại API để lấy dữ liệu mới nhất
    dispatch(getBooking())
    .unwrap()
    .then(() => {
      console.log('Bookings fetched successfully');
    })
    .catch((error) => {
      console.error('Error fetching bookings:', error);
    });
    setSelectedRowKeys([]);  // Reset selected rows nếu cần
    setCurrentPage(1); // Reset trang hiện tại
  }


  return (
    <div className="wrapper-layout-content">
      <div className="button-booking" style={{ paddingBottom: '10px' }}>
        <Flex gap="middle">
          <Button
            onClick={handleAddBooking}
            disabled={!hasPermission('create booking')}
            icon={<IoMdAdd color="#fff" size={14} />}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              background: '#008000',
              color: '#fff',
            }}
            type="primary"
          >
            {t('booking.addBooking')}
          </Button>
        </Flex>
      </div>
      {
        loading ? (
          <Skeleton active />
        ) : (
          <TableComponent
            column={columns}
            data={data}
            loading={loading}
            selectedRowKeys={selectedRowKeys}
            onSelectChange={onSelectChange}
            currentPage={currentPage}
            pageSize={pageSize}
            onTableChange={handleTableChange}
          />
        )
      }
      {/* Modal chi tiết booking */}
      {isDetailModalVisible && selectedBookingId && (
        <DetailBooking
          id={selectedBookingId}
          visible={isDetailModalVisible}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default BookingContent
