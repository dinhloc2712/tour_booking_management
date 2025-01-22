import React, { useEffect } from 'react'
import { Modal, Button, Table } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from 'redux/store'
import { useNavigate } from 'react-router-dom'
import { showModal } from 'redux/Redux/modal/modalSlice'
import CancelBookingModal from '../CancelBoookingModal/CancelBookingModal'
import { setCheckInStatus } from 'redux/Reducer/Booking'
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'

interface CustomModalProps {
  id: any
  visible: any
  onClose: () => void
}


const DetailBooking: React.FC<CustomModalProps> = ({
  id,
  visible,
  onClose,
}) => {
  const dispatch: AppDispatch = useDispatch()
  const detailBooking = useSelector(
    (state: RootState) => state.booking.currentBooking
  )
  const bookings = useSelector(
    (state: RootState) => state.BookingTourReducer.bookings
  )
  const checkInStatus = useSelector(
    (state: RootState) => state.booking.checkInStatus
  )

  const navigate = useNavigate()

  const showModalCancel = useSelector(
    (state: RootState) => state.modal.modals["cancelBooking"]
  ); 

  console.log('detailBooking', detailBooking)

  const handleCancelBooking = () => {
    dispatch(showModal("cancelBooking"));
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // Cột cho bảng dịch vụ
  const serviceColumns = [
    {
      title: 'Tên Dịch Vụ',
      dataIndex: 'service_name',
      key: 'service_name',
      width: '25%',
    },
    {
      title: 'Số Lượng',
      dataIndex: 'service_quantity',
      key: 'service_quantity',
      width: '13%',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'service_unit',
      key: 'service_unit',
      width: '13%',
    },
    {
      title: 'Giá',
      dataIndex: 'service_price',
      key: 'service_price',
      width: '13%',
      render: (price) => (price ? `${price} VND` : 'N/A'),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'service_status',
      key: 'service_status',
      width: '13%',
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'service_note',
      key: 'service_note',
      width: '23%',
    },
  ]

  if (!detailBooking) {
    return null
  }

  const paymentHistory = () => {
    navigate(`/payment-history/${detailBooking.booking_id}`)
  }

  const showModalHistory = () => {
    navigate(`/history-update/${detailBooking.booking_id}`)
  }

  const handleUpdateBooking = () => {
    dispatch(setCheckInStatus(true))
    navigate(`/updatebooking`)
  }

  useEffect(() => {
    dispatch(getBooking())
  }, [dispatch])

  return (
    <>
      <Modal
        visible={visible}
        title={<h2 className="custom-modal-title">Chi tiết Booking</h2>}
        className="detailBooking-Modal"
        width={1250}
        onCancel={onClose}
        footer={[
          <Button key="history" type="primary" onClick={showModalHistory}>
            Lịch sử cập nhật
          </Button>,
          <Button key="update" type="primary" onClick={paymentHistory}>
            Lịch sử thanh toán
          </Button>,
          <Button key="update" type="primary" onClick={handleUpdateBooking}>
            Cập nhật Booking
          </Button>,
          <Button key="cancel" type="primary" danger onClick={handleCancelBooking}>
            Hủy Booking
          </Button>,
          <Button key="exit" onClick={onClose}>
            Thoát
          </Button>,
        ]}
        centered
      >
        <div className="detailBooking-Modal-Index">
          <div className="detailBooking-Modal-Content">
            <h4
              style={{
                marginBottom: '20px',
                color: '#1890ff',
              }}
            >
              Thông Tin Người Đặt
            </h4>
            <hr />
            <div className="detailBooking-Modal-Content-Info">
              <div className="detailBooking-Modal-Content-Info-Item">
                <label>Tên người đặt:</label>
                <span>{detailBooking?.fullname}</span>
              </div>
              <div className="detailBooking-Modal-Content-Info-Item">
                <label>Số Điện Thoại:</label>
                <span>{detailBooking?.phone}</span>
              </div>
              <div className="detailBooking-Modal-Content-Info-Item">
                <label>Địa chỉ:</label>
                <span>{detailBooking?.address}</span>
              </div>
              <div className="detailBooking-Modal-Content-Info-Item">
                <label>Trạng Thái Thanh Toán:</label>
                <span>{detailBooking?.status_payment}</span>
              </div>
              <div className="detailBooking-Modal-Content-Info-Item">
                <label>Trạng thái Hoạt Động:</label>
                <span>{detailBooking?.status_touring}</span>
              </div>
              <div className="detailBooking-Modal-Content-Info-Item">
                <label>Ghi Chú:</label>
                <span>{detailBooking?.note}</span>
              </div>
            </div>
          </div>
          <hr />
          {/* Danh sách tour */}
          <h4
            style={{
              // textAlign: 'center',
              marginBottom: '20px',
              color: '#1890ff',
            }}
          >
            Tour và Dịch vụ
          </h4>
          <hr />
          {detailBooking.tours.map((tour) => (
            <div key={tour.tour_id} className="tour-item">
              <div className="detailBooking-Modal-Content">
                <div className="detailBooking-Modal-Content-Info">
                  <div className="detailBooking-Modal-Content-Info-Item">
                    <label>Tên Tour:</label>
                    <span>{tour.tour_name}</span>
                  </div>
                  <div className="detailBooking-Modal-Content-Info-Item">
                    <label>Giá Tour:</label>
                    <span>{tour.tour_price} VND</span>
                  </div>
                  <div className="detailBooking-Modal-Content-Info-Item">
                    <label>Thời Gian Bắt Đầu:</label>
                    <span>{formatDateTime(tour.tour_start_time)}</span>
                  </div>
                  <div className="detailBooking-Modal-Content-Info-Item">
                    <label>Thời Gian Kết Thúc:</label>
                    <span>{formatDateTime(tour.tour_end_time)}</span>
                  </div>
                  <div className="detailBooking-Modal-Content-Info-Item">
                    <label>Trạng Thái:</label>
                    <span>{tour.tour_status}</span>
                  </div>
                  <div className="detailBooking-Modal-Content-Info-Item">
                    <label>Ghi Chú:</label>
                    <span>{tour.note}</span>
                  </div>
                </div>
                <h5 style={{ margin: '20px 20px 5px 20px', color: 'green' }}>
                  Danh Sách Dịch Vụ
                </h5>
                <Table
                  columns={serviceColumns}
                  dataSource={tour.services}
                  rowKey="service_id"
                  pagination={false}
                  bordered
                />
                <hr />
              </div>
            </div>
          ))}
        </div>
      </Modal>
      {showModalCancel && <CancelBookingModal id="cancelBooking" />}
    </>
  )
}

export default DetailBooking
