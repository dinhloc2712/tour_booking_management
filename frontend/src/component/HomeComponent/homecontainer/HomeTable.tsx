import React, { useEffect, useState } from 'react'
import { Checkbox, Table, Tabs, Tag, Button, Empty } from 'antd'
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'
import { getOneBooking } from 'redux/API/GET/getBooking/getOneBooking'
import { RootState, useAppDispatch } from 'redux/store'
import { useSelector } from 'react-redux'
import { showModal, hideModal } from 'redux/Redux/modal/modalSlice'
import CheckinBookingModal from 'modal/Home/modalCheckinBooking/BookingCheckinModal'
import { clearCurrentCheckIn } from 'redux/Reducer/CheckinReducer'
import { fetchBookingToursWithStatus } from 'redux/API/GET/getBookingActive/GetBookingTour'
import { getBookingActiveUser } from 'redux/API/GET/getBookingActive/getBookingActiveUser'
import { getBookingActiverALlUser } from 'redux/API/GET/getBookingActive/getBookingAllUser'
import BookingActiveModal from 'modal/Home/modalBookingActive/ModalBookingActive'
import { Player } from '@lottiefiles/react-lottie-player'
import animationData from 'assets/animationJson/Animation - 1733894702922.json';
import { useTranslation } from 'react-i18next'
import { get } from 'http'


const { TabPane } = Tabs

const HomeTableComponent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  )
  const { t } = useTranslation('Home')
  
  const [isBookingActiveModalOpen, setIsBookingActiveModalOpen] =
    useState(false)
  const bookings = useSelector(
    (state: RootState) => state.BookingTourReducer.bookings
  )

  const columns = [
    {
      title: t('Home.STT'),
      render: (text, record, index) => {
        return (currentPage - 1) * pageSize + index + 1 // Tính STT liên tục
      },
      key: 'id',
      width: '3%',
    },
    {
      title: t('Home.Tên Tour'),
      dataIndex: 'booking_tours',
      key: 'bookingTours',
      render: (bookingTours) =>
        bookingTours.map((tour) => tour.name_tour).join(', '),
      width: '23%',
    },
    {
      title: t('Home.Tên người đặt'),
      dataIndex: ['booker', 'fullname'],
      key: 'booker',
      width: '13%',
    },
    {
      title: t('Home.Số điện thoại'),
      dataIndex: ['booker', 'user_detail', 'phone'],
      key: 'phone',
      width: '12%',
    },
    {
      title: t('Home.Địa chỉ'),
      dataIndex: ['booker', 'user_detail', 'address'],
      key: 'address',
      width: '13%',
    },
    {
      title: t('Home.Số khách'),
      dataIndex: 'quantity_customer',
      key: 'quantity_customer',
      width: '5%',
    },
    {
      title: t('Home.Thời gian checkin'),
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
      width: '14%',
    },
    {
      title: t('Home.Trạng thái thanh toán'),
      dataIndex: 'status_payment',
      key: 'status_payment',
      render: (status: string) => {
        let color = 'red' // Mặc định màu đỏ cho unpaid
        let text = t('Home.Chưa thanh toán')
  
        if (status === 'deposit') {
          color = 'orange'
          text = t('Home.Đặt cọc')
        } else if (status === 'paid') {
          color = 'green'
          text = t('Home.Đã thanh toán')
        }
  
        return <Tag color={color}>{text}</Tag>
      },
      width: '10%',
    },
    {
      title: t('Home.Hành động'),
      key: 'action',
      render: (text, record) => (
        // Truyền đúng bookingId vào khi nhấn nút Checkin
        <Button
          type="primary"
          onClick={() => handleShowBookingCheckin(record.id)}
          disabled={record.status_payment === 'paid'}
        >
          Checkin
        </Button>
      ),
      width: '12%',
    },
  ]

  const dispatch = useAppDispatch()

  // Lấy dữ liệu booking từ Redux store
  const data = useSelector((state: RootState) => state.booking.bookingList)
  const checkinData = useSelector(
    (state: RootState) => state.checkin.currentCheckIn
  )

  useEffect(() => {
    dispatch(getBooking())
  }, [dispatch])

  // console.log(data)

  // Lọc các dữ liệu có ngày checkin là ngày hôm nay
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Đặt thời gian là 00:00 để so sánh chỉ ngày

  const filteredData = data.filter((item) => {
    const checkinDate = new Date(item.checkin_time)
    checkinDate.setHours(0, 0, 0, 0) // Chỉ so sánh ngày, bỏ qua giờ, phút, giây

    return checkinDate.getTime() === today.getTime() // So sánh ngày
  })

  const handleShowBookingCheckin = ( bookingId: string) => {
    console.log(bookingId)
    setSelectedBookingId(bookingId)
    dispatch(getOneBooking(bookingId))
    dispatch(showModal('ModalBookingCheckin'))
  }

  const handleCancelBookingCheckin = (bookingId: string) => {
    setSelectedBookingId(null)
    dispatch(hideModal('ModalBookingCheckin'))
    dispatch(clearCurrentCheckIn())
    dispatch(getBooking())
  }

  const handleOpenBookingActiveModal = (value) => {
    dispatch(getBookingActiveUser(value))
    dispatch(getBookingActiverALlUser(value))
    console.log(value)
    setIsBookingActiveModalOpen(true) // Mở modal
  }

  const handleCloseBookingActiveModal = () => {
    setIsBookingActiveModalOpen(false) // Đóng modal
    dispatch(getBooking())
  }

  ////// booking active \\\\\

  const reversedBookings = [...bookings].reverse()
  const status = useSelector(
    (state: RootState) => state.BookingTourReducer.status
  )

  // console.log({ reversedBookings })

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])

  useEffect(() => {
    dispatch(fetchBookingToursWithStatus())
  }, [dispatch])

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredBookings(reversedBookings)
    } else if (status[selectedStatus]) {
      const newFilteredBookings = bookings.filter((booking) => {
        const activities = booking.bookingTour?.booking_activities
        const latestActivity =
          activities && activities.length > 0
            ? activities[activities.length - 1]
            : null
        const activityName = latestActivity ? latestActivity.name : null

        return activityName === status[selectedStatus]
      })

      setFilteredBookings(newFilteredBookings)

      // console.log({ newFilteredBookings })
    } else {
      setFilteredBookings(bookings)
    }
  }, [selectedStatus, bookings, status])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return (
      date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  }

  const TableColumns = [
    {
      title: 'STT',
      dataIndex: ['bookingTour', 'id'],
      key: 'id',
      render: (_: any, record: any, index: number) => index + 1,
    },
    {
      title: 'Tên Tour',
      key: 'nameTourBookingId',
      render: (text: any, record: any) => {
        const nameTour = record.bookingTour?.name_tour || 'N/A';
        const bookingId = record.bookingTour?.booking_id || 'N/A';
        return (
          <span>
            {nameTour} - <Tag color="blue">{bookingId}</Tag>
          </span>
        );
      },
    },
    {
      title: 'Tên Người Đặt',
      dataIndex: ['users', 0, 'fullname'],
      key: 'fullname',
    },
    {
      title: 'Phone',
      dataIndex: ['users', 0,'user_detail', 'phone'],
      key: 'phone',
    },
    {
      title: 'Số Lượng Người',
      dataIndex: ['bookingTour', 'quantity_customer'],
      key: 'quantityCustomer',
    },
    {
      title: 'Trạng Thái Hành Trình',
      key: 'status',
      render: (_: any, record: any) => {
        const activities = record.bookingTour?.booking_activities;
        const latestActivity =
          activities && activities.length > 0
            ? activities[activities.length - 1]
            : null;
    
        let activityName = 'Không có dữ liệu';
        let color = 'default'; // Màu mặc định
    
        if (latestActivity) {
          switch (latestActivity.name) {
            case 'booking':
              activityName = 'Booking';
              color = 'blue';
              break;
            case 'checkin':
              activityName = 'Checkin';
              color = 'green';
              break;
            case 'paid':
              activityName = 'Paid';
              color = 'gold';
              break;
            case 'on_bus':
              activityName = 'On Bus';
              color = 'cyan';
              break;
            case 'arrived':
              activityName = 'Arrived';
              color = 'purple';
              break;
            case 'start_tour':
              activityName = 'Start Tour';
              color = 'magenta';
              break;
            case 'complete_tour':
              activityName = 'Complete Tour';
              color = 'lime';
              break;
            case 'cancel':
              activityName = 'Cancel';
              color = 'red';
              break;
            default:
              activityName = 'Trạng thái chưa được cập nhật';
              color = 'default';
              break;
          }
        }
    
        return <Tag color={color}>{activityName}</Tag>;
      },
    },
    

    {
      title: 'Ngày Cập Nhật Hành Trình',
      dataIndex: ['bookingTour', 'updated_at'],
      key: 'updatedAt',
      render: (updated_at: string) => formatDate(updated_at),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          onClick={() => handleOpenBookingActiveModal(record.bookingTour.id)}
        >
          Cập nhật
        </Button>
      ),
    },
  ]

  const formatTabTitle = (value: string) => {
    // console.log(value)
    if (value === 'checkin') return 'Chekin'
    if (value === 'paid') return 'Thanh toán'
    if (value === 'on_bus') return 'Đi Bus'
    if (value === 'arrived') return 'Khởi Hành'
    if (value === 'start_tour') return 'Đang đi'
    if (value === 'complete_tour') return 'Hoàn thành'
    if (value === 'cancel') return 'Hủy'

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <div className="container-Home">
      <Tabs
        defaultActiveKey="all"
        onChange={(value) => {
          setSelectedStatus(value)
          if (value === 'all') {
            setFilteredBookings(reversedBookings)
          } else if (status[value]) {
            const newFilteredBookings = bookings.filter((booking) => {
              const activities = booking.bookingTour?.booking_activities
              const latestActivity = activities?.[activities.length - 1]
              return latestActivity?.name === status[value]
              console.log({ latestActivity })
            })
            setFilteredBookings(newFilteredBookings)
          }
        }}
      >
        <TabPane tab="Booking hôm nay" key="1">
          {/* Truyền dữ liệu vào Table */}
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '7%' }}>
              <Player
                autoplay
                loop
                src={animationData}
                style={{ height: '280px', width: '280px' }}
              />
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#5DADE2',
                }}
              >
                Hôm nay không có booking nào!
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                onChange: (page) => setCurrentPage(page),
              }}
              size="small"
            />
          )}
         <TabPane tab="Booking hoạt động" key="all" style={{ height: '100%' }}>
          <Table
            style={{ height: '100%' }}
            columns={TableColumns}
            dataSource={filteredBookings}
            rowKey={(record) =>
              record?.bookingTour?.id || record.id || Math.random().toString()
            }
            loading={filteredBookings.length === 0}
            pagination={{ pageSize: 10, position: ['bottomRight'] }}
            locale={{
              emptyText:
                filteredBookings.length === 0
                  ? 'Không có tour nào'
                  : 'Đang tải...',
            }}
          />
        </TabPane>
        </TabPane> 
        {Object.entries(status)
          .filter(([key]) => key) // Lọc tab checkin và paid
          .map(([key, value]) => (
            <TabPane tab={formatTabTitle(value)} key={key}>
              {filteredBookings.filter((booking) => {
                const activities = booking.bookingTour?.booking_activities
                const latestActivity = activities?.[activities.length - 1]
                return latestActivity?.name === value
              }).length === 0 ? (
                <Empty
                  description={`Không có tour nào đang ở trạng thái ${formatTabTitle(
                    key
                  )}`}
                />
              ) : (
                <Table
                  columns={TableColumns}
                  dataSource={filteredBookings.filter((booking) => {
                    const activities = booking.bookingTour?.booking_activities
                    const latestActivity = activities?.[activities.length - 1]
                    return latestActivity?.name === value
                  })}
                  rowKey={(record) => record.bookingTour.id}
                  loading={filteredBookings.length === 0}
                  pagination={{ pageSize: 10, position: ['bottomRight'] }}
                />
              )}
            </TabPane>
          ))}
      </Tabs>

      {selectedBookingId && (
        <CheckinBookingModal
          bookingId={selectedBookingId}
          onClose={handleCancelBookingCheckin}
        />
      )}

      {isBookingActiveModalOpen && (
        <BookingActiveModal
          onClose={handleCloseBookingActiveModal}
        />
      )}
    </div>
  )
}

export default HomeTableComponent
