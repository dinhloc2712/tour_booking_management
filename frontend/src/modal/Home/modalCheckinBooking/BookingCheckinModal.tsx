import React, { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  message,
  Typography,
  Form,
  Input,
  Switch,
  DatePicker,
  Select,
  InputNumber,
  Table,
  Checkbox,
} from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from 'redux/store'
import {
  setCurrentCheckIn,
  addUserToCheckIn,
  updateUserField,
  selectTourForUser,
  selectServiceForTour,
  CheckInUserDetails,
  incrementRemainingSlots,
} from 'redux/Reducer/CheckinReducer'
import { MdDeleteForever } from 'react-icons/md'
import { checkInThunk } from 'redux/API/POST/CheckinThunk' // Import đúng thunk
import { showModal } from 'redux/Redux/modal/modalSlice' // Import modal Bill
import { getBookingBill } from 'redux/API/GET/GetBill' // Import action lấy bil
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'
import Bill from 'modal/Bill/Bill'

import QrScanner from 'react-qr-scanner'

const { Text } = Typography
import dayjs from 'dayjs'
import { AiOutlineClose } from 'react-icons/ai'
import { useTranslation } from 'react-i18next'
const { Option } = Select
const { Column } = Table

interface CheckinBookingModalProps {
  bookingId: any
  onClose: (bookingId: any) => void // Đảm bảo onClose được khai báo trong props
}

const CheckinBookingModal: React.FC<CheckinBookingModalProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch()
  const [scannedPassport, setScannedPassport] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [customerInfo, setCustomerInfo] = useState<any | null>(null) // Lưu thông tin khách hàng khi quét mã
  const [expanded, setExpanded] = useState(false)
  const { t } = useTranslation('checkin');

  const [form] = Form.useForm()

  const checkinData = useSelector(
    (state: RootState) => state.checkin.currentCheckIn
  )

  const dataListbooking = useSelector((state: RootState) => state.booking.bookingList)
  // Lấy dữ liệu booking từ store
  const detailBooking = useSelector(
    (state: RootState) => state.booking.currentBooking
  )

  console.log(detailBooking)

  // const handleCloseModal = () => {
  //   onClose(null) // Đóng modal và reset bookingId
  // }

  const handleScan = (data: any) => {
    if (data) {
      const scannedText = data.text
      setScannedPassport(scannedText) // Lưu passport quét được
      alert(scannedText);
      console.log('Mã quét được:', scannedText)
      // Kiểm tra xem khách hàng đã có trong currentCheckIn chưa
      const existingCustomer = checkinData?.users.find(
        (customer: CheckInUserDetails) => customer.passport === scannedText
      )

      // Nếu khách hàng đã được thêm vào thì không cho thêm nữa
      if (existingCustomer) {
        message.error('Khách hàng này đã được thêm vào check-in rồi.')
        return
      }

      // Tìm khách hàng trong danh sách khách hàng khớp với passport
      const matchedUser = detailBooking?.customers.find(
        (customer) => customer.Passport === scannedText
      )

      console.log('matchedUser', matchedUser)

      if (matchedUser) {
        // Cập nhật thông tin người dùng vào mảng check-in trong state
        const userDetails: CheckInUserDetails = {
          full_name: matchedUser.Fullname,
          birthday: '', // Nếu không có birthday thì gán null
          passport: matchedUser.Passport,
          phone: matchedUser.Phone,
          address: matchedUser.Address,
          email: matchedUser.Email, // Thêm email vào đây
          selectedTours: [], // Giả sử không chọn tour nào lúc này
        }

        // Thêm người dùng vào Redux state
        dispatch(addUserToCheckIn(userDetails))

        // Kiểm tra xem có tour nào cần thêm vào không
        const availableTours = checkinData.booking_tours.filter(
          (tour: any) => tour.remainingSlots > 0
        )

        // Nếu có 1 tour duy nhất, tự động thêm vào user
        if (availableTours.length === 1) {
          const tourId = availableTours[0].id
          handleTourSelect(matchedUser.Passport, [tourId])
        }
      }
    }
  }

  const handleError = (err: any) => {
    console.error('Lỗi từ camera hoặc quá trình quét:', err)
  }


  const toggleCamera = (checked: boolean) => {
    if (checked) {
      setCameraActive(true);
    } else {
      setCameraActive(false);
    }
  };


  useEffect(() => {
    // Kiểm tra nếu tất cả khách hàng đã được quét
    const allUsersScanned =
      detailBooking?.customers.length === checkinData?.users.length &&
      checkinData?.users.every(
        (user: any) => user.passport && user.full_name // Kiểm tra thông tin đầy đủ
      );

    // console.log("All users scanned:", allUsersScanned);
    // console.log("Detail Booking Customers:", detailBooking?.customers);
    // console.log("Checkin Data Users:", checkinData?.users);

    // Nếu tất cả khách hàng đã được quét, tự động tắt camera
    if (allUsersScanned && cameraActive) {
      message.info("Tất cả khách hàng đã được quét mã, camera sẽ tự động tắt.");
      setTimeout(() => setCameraActive(false), 1000); // Tắt camera sau 1 giây
    }
  }, [checkinData?.users, detailBooking?.customers, cameraActive]);

  console.log('checkinData:', checkinData)


  const handleAddUser = () => {
    // Tạo đối tượng CheckInUserDetails
    const newUser: CheckInUserDetails = {
      full_name: '',
      birthday: '',
      passport: '',
      address: '',
      phone: '',
      email: '',
      selectedTours: [],
    }

    // Dispatch action với đối tượng payload
    dispatch(addUserToCheckIn(newUser)) // Truyền đối tượng vào action
  }

  const loading = useSelector((state: RootState) => state.checkin.loading)

  const handleInputChange = (
    userIndex: number,
    field: keyof CheckInUserDetails,
    value: any
  ) => {
    if (!checkinData || !checkinData.users) {
      console.error('checkinData or users is undefined')
      return
    }
    dispatch(updateUserField({ userIndex, field, value }))
  }

  // const handleTourSelect = (passport: string, tourIds: number[]) => {
  //   tourIds.forEach((tourId) => {
  //     dispatch(selectTourForUser({ passPort: passport, bookingId: tourId }))
  //   })
  // }

  const handleTourSelect = (passport: string, tourIds: number[]) => {
    // Nếu tourIds là một phần tử đơn lẻ (không phải mảng), chuyển nó thành mảng
    const toursToProcess = Array.isArray(tourIds) ? tourIds : [tourIds]

    // Thực hiện thao tác với mỗi tourId trong mảng
    toursToProcess.forEach((tourId) => {
      dispatch(selectTourForUser({ passPort: passport, bookingId: tourId }))
    })
  }

  const handleUpdateServiceQuantity = (
    passport: string,
    tourId: number,
    serviceId: number,
    newQuantity: number
  ) => {
    // Tìm người dùng
    const userIndex = checkinData.users.findIndex(
      (u) => u.passport === passport
    )
    if (userIndex === -1) return

    const user = { ...checkinData.users[userIndex] }

    // Tìm tour
    const tourIndex = user.selectedTours.findIndex((t) => t.id === tourId)
    if (tourIndex === -1) return

    const tour = { ...user.selectedTours[tourIndex] }

    // Tìm dịch vụ trong booking_service_by_tours
    const serviceIndex = tour.booking_service_by_tours.findIndex(
      (s) => s.service_id === serviceId
    )
    if (serviceIndex === -1) return

    const service = { ...tour.booking_service_by_tours[serviceIndex] }

    // Tìm originalTour
    const originalTourIndex = checkinData.booking_tours.findIndex(
      (t) => t.id === tourId
    )
    if (originalTourIndex === -1) return

    const originalTour = { ...checkinData.booking_tours[originalTourIndex] }

    // Tìm originalService
    const originalServiceIndex = originalTour.services.findIndex(
      (s) => s.service_id === serviceId
    )
    if (originalServiceIndex === -1) return

    const originalService = {
      ...originalTour.services[originalServiceIndex],
    }

    // Tính toán chênh lệch số lượng
    const quantityDifference = newQuantity - service.quantity
    if (originalService.remainingQuantity < quantityDifference) {
      message.error('Không đủ số lượng dịch vụ còn lại!')
      return
    }

    // Cập nhật số lượng
    service.quantity = newQuantity
    originalService.remainingQuantity -= quantityDifference

    // Cập nhật mảng booking_service_by_tours
    const updatedBookingServices = [
      ...tour.booking_service_by_tours.slice(0, serviceIndex),
      service,
      ...tour.booking_service_by_tours.slice(serviceIndex + 1),
    ]

    tour.booking_service_by_tours = updatedBookingServices

    // Cập nhật mảng selectedTours
    const updatedSelectedTours = [
      ...user.selectedTours.slice(0, tourIndex),
      tour,
      ...user.selectedTours.slice(tourIndex + 1),
    ]

    user.selectedTours = updatedSelectedTours

    // Cập nhật mảng users
    const updatedUsers = [
      ...checkinData.users.slice(0, userIndex),
      user,
      ...checkinData.users.slice(userIndex + 1),
    ]

    // Cập nhật mảng booking_tours
    const updatedServices = [
      ...originalTour.services.slice(0, originalServiceIndex),
      originalService,
      ...originalTour.services.slice(originalServiceIndex + 1),
    ]

    originalTour.services = updatedServices

    const updatedBookingTours = [
      ...checkinData.booking_tours.slice(0, originalTourIndex),
      originalTour,
      ...checkinData.booking_tours.slice(originalTourIndex + 1),
    ]

    // Dispatch state mới
    dispatch(
      setCurrentCheckIn({
        ...checkinData,
        users: updatedUsers,
        booking_tours: updatedBookingTours,
      })
    )
  }

  const handleRemoveService = (
    passport: string,
    tourId: number,
    serviceId: number
  ) => {
    // Tìm người dùng
    const userIndex = checkinData.users.findIndex(
      (u) => u.passport === passport
    )
    if (userIndex === -1) return

    const user = { ...checkinData.users[userIndex] }

    // Tìm tour
    const tourIndex = user.selectedTours.findIndex((t) => t.id === tourId)
    if (tourIndex === -1) return

    const tour = { ...user.selectedTours[tourIndex] }

    // Tìm originalTour
    const originalTourIndex = checkinData.booking_tours.findIndex(
      (t) => t.id === tourId
    )
    if (originalTourIndex === -1) return

    const originalTour = { ...checkinData.booking_tours[originalTourIndex] }

    // Tìm dịch vụ trong booking_service_by_tours
    const serviceIndex = tour.booking_service_by_tours.findIndex(
      (s) => s.service_id === serviceId
    )
    if (serviceIndex === -1) return

    const service = { ...tour.booking_service_by_tours[serviceIndex] }

    // Tìm originalService
    const originalServiceIndex = originalTour.services.findIndex(
      (s) => s.service_id === serviceId
    )
    if (originalServiceIndex === -1) return

    const originalService = { ...originalTour.services[originalServiceIndex] }

    // Hoàn lại số lượng vào remainingQuantity
    originalService.remainingQuantity += service.quantity

    // Xóa dịch vụ khỏi danh sách đã chọn
    const updatedBookingServices = [
      ...tour.booking_service_by_tours.slice(0, serviceIndex),
      ...tour.booking_service_by_tours.slice(serviceIndex + 1),
    ]
    tour.booking_service_by_tours = updatedBookingServices

    // Cập nhật mảng selectedTours
    const updatedSelectedTours = [
      ...user.selectedTours.slice(0, tourIndex),
      tour,
      ...user.selectedTours.slice(tourIndex + 1),
    ]
    user.selectedTours = updatedSelectedTours

    // Cập nhật mảng users
    const updatedUsers = [
      ...checkinData.users.slice(0, userIndex),
      user,
      ...checkinData.users.slice(userIndex + 1),
    ]

    // Cập nhật mảng services trong originalTour
    const updatedOriginalServices = [
      ...originalTour.services.slice(0, originalServiceIndex),
      originalService,
      ...originalTour.services.slice(originalServiceIndex + 1),
    ]
    originalTour.services = updatedOriginalServices

    // Cập nhật mảng booking_tours
    const updatedBookingTours = [
      ...checkinData.booking_tours.slice(0, originalTourIndex),
      originalTour,
      ...checkinData.booking_tours.slice(originalTourIndex + 1),
    ]

    // Dispatch state mới
    dispatch(
      setCurrentCheckIn({
        ...checkinData,
        users: updatedUsers,
        booking_tours: updatedBookingTours,
      })
    )
  }

  const handleServiceSelect = (
    passport: string,
    tourId: number,
    service: any,
    quantity: number
  ) => {
    if (quantity > service.remainingQuantity) {
      message.error('Số lượng vượt quá khả dụng!')
      return
    }

    dispatch(
      selectServiceForTour({
        passPort: passport,
        bookingId: tourId,
        serviceData: {
          service_id: service.service_id,
          remainingQuantity: service.remainingQuantity, // Đồng bộ remainingQuantity
          unit: service.unit,
          price: service.price,
          sale_agent_id: service.sale_agent_id,
          quantity_customer: service.quantity_customer,
          start_time: service.start_time,
          end_time: service.end_time,
          quantity,
        },
      })
    )
  }

  const handleUpdateServiceAttribute = (
    passport,
    tourId,
    serviceId,
    attribute,
    value
  ) => {
    // Lấy chỉ số người dùng
    const userIndex = checkinData.users.findIndex(
      (u) => u.passport === passport
    )
    if (userIndex === -1) return

    // Tạo bản sao người dùng
    const user = { ...checkinData.users[userIndex] }

    // Lấy chỉ số tour
    const tourIndex = user.selectedTours.findIndex((t) => t.id === tourId)
    if (tourIndex === -1) return

    // Tạo bản sao tour
    const tour = { ...user.selectedTours[tourIndex] }

    // Lấy chỉ số dịch vụ trong tour
    const serviceIndex = tour.booking_service_by_tours.findIndex(
      (s) => s.service_id === serviceId
    )
    if (serviceIndex === -1) return

    // Tạo bản sao danh sách dịch vụ và dịch vụ cụ thể
    const updatedBookingServices = [...tour.booking_service_by_tours]
    const service = { ...updatedBookingServices[serviceIndex] }

    // Lấy originalTour để tham chiếu dữ liệu gốc
    const originalTourIndex = checkinData.booking_tours.findIndex(
      (t) => t.id === tourId
    )
    if (originalTourIndex === -1) return

    const originalTour = { ...checkinData.booking_tours[originalTourIndex] }

    // Lấy originalService để kiểm tra dữ liệu gốc
    const originalService = originalTour.services.find(
      (s) => s.service_id === serviceId
    )

    if (!originalService) {
      console.error('Original service not found!')
      return
    }

    // Cập nhật thuộc tính
    if (attribute === 'quantity') {
      // Xử lý riêng cho quantity (dùng cơ chế tính chênh lệch)
      const quantityDifference = value - service.quantity
      if (originalService.remainingQuantity < quantityDifference) {
        message.error('Số lượng vượt quá khả dụng!')
        return
      }
      service.quantity = value
      originalService.remainingQuantity -= quantityDifference
    } else {
      // Xử lý các thuộc tính khác
      service[attribute] = value
    }

    // Thay thế dịch vụ đã chỉnh sửa vào danh sách dịch vụ
    updatedBookingServices[serviceIndex] = service

    // Cập nhật danh sách dịch vụ trong tour
    const updatedTour = {
      ...tour,
      booking_service_by_tours: updatedBookingServices,
    }

    // Cập nhật danh sách tour của người dùng
    const updatedSelectedTours = [
      ...user.selectedTours.slice(0, tourIndex),
      updatedTour,
      ...user.selectedTours.slice(tourIndex + 1),
    ]

    // Cập nhật lại người dùng
    const updatedUser = { ...user, selectedTours: updatedSelectedTours }

    // Cập nhật danh sách người dùng
    const updatedUsers = [
      ...checkinData.users.slice(0, userIndex),
      updatedUser,
      ...checkinData.users.slice(userIndex + 1),
    ]

    // Cập nhật danh sách booking_tours
    const updatedBookingTours = [
      ...checkinData.booking_tours.slice(0, originalTourIndex),
      originalTour,
      ...checkinData.booking_tours.slice(originalTourIndex + 1),
    ]

    // Dispatch lại Redux state
    dispatch(
      setCurrentCheckIn({
        ...checkinData,
        users: updatedUsers,
        booking_tours: updatedBookingTours,
      })
    )
  }

  const handleRemoveUser = (userIndex: number) => {
    if (!checkinData || !checkinData.users) {
      console.error('checkinData or users is undefined')
      return
    }

    // Lấy danh sách ID của các tour được chọn
    const tourIdsToIncrement =
      checkinData.users[userIndex]?.selectedTours.map((tour) => tour.id) || []

    // Gọi action để tăng `remainingSlots` cho các tour liên quan
    dispatch(incrementRemainingSlots(tourIdsToIncrement))

    // Cập nhật danh sách người dùng mà không cần người dùng tại `userIndex`
    const updatedUsers = checkinData.users.filter(
      (_, index) => index !== userIndex
    )

    // Gọi action để cập nhật lại danh sách người dùng
    dispatch(
      setCurrentCheckIn({
        ...checkinData,
        users: updatedUsers,
      })
    )
  }

  const handleCheckInSubmit = async (user = null) => {
    if (!checkinData) {
      message.error('Không có dữ liệu để check-in')
      return
    }
    console.log('checkinData:', checkinData)
    const usersData = user
      ? [user] // Nếu có user được truyền vào, chỉ gửi dữ liệu của user đó
      : checkinData.users // Nếu không, gửi toàn bộ dữ liệu người dùng
    console.log('tetstttt', usersData)

    const data = usersData.map((user) => ({
      users: { full_name: user.full_name },
      user_details: {
        birthday: user.birthday,
        passport: user.passport,
        address: user.address,
        phone: user.phone,
      },
      booking_tours: user.selectedTours.map((tour) => ({
        id: tour.id,
        booking_service_by_tours: tour.booking_service_by_tours.map(
          (service) => ({
            id: service.id,
            quantity: service.quantity,
            unit: service.unit,
            // price: service.price,
            // sale_agent_id: service.sale_agent_id,
            // quantity_customer: service.quantity_customer,
            start_time: service.start_time,
            end_time: service.end_time,
          })
        ),
      })),
    }))

    try {
      const resultAction = await dispatch(checkInThunk({ data })).unwrap()

      console.log('Check-in thành công:', resultAction)

      if (resultAction) {
        console.log('Check-in thành công:', resultAction)
        message.success('Check-in thành công!')

        // Gọi API lấy thông tin bill
        const billResult = await dispatch(
          getBookingBill(resultAction.data)
        ).unwrap()
        dispatch(getBooking)
        // Chỉ hiển thị modal khi lấy bill thành công
        if (billResult) {
          // console.log('Thông tin bill:', billResult);
          dispatch(showModal('billModal'))
        } else {
          message.error('Không thể lấy thông tin bill.')
        }
      } else {
        message.error('Check-in thất bại.')
      }

    } catch (error) {
      message.error('Có lỗi xảy ra trong quá trình check-in')
    }
  }

  const toggleEditMode = (e, field) => {
    const cell = e.target.closest('.editable-cell') // Lấy phần tử cha chứa cả span và input
    const span = cell.querySelector('.display-text') // Lấy span chứa text hiển thị
    const input = cell.querySelector('.editable-input') // Lấy input tương ứng

    // Ẩn span, hiển thị input khi nhấn vào text
    span.style.display = 'none'
    input.style.display = 'block' // Hiển thị input (DatePicker)

    // Focus vào input để dễ dàng chỉnh sửa
    input.focus()

    // Thêm sự kiện click ra ngoài để ẩn input
    const handleOutsideClick = (event) => {
      if (!cell.contains(event.target)) {
        // Khi nhấp ra ngoài, ẩn input và hiển thị lại span
        span.style.display = 'block'
        input.style.display = 'none'
        // Hủy sự kiện lắng nghe để không gây rối
        document.removeEventListener('click', handleOutsideClick)
      }
    }

    // Lắng nghe sự kiện click ra ngoài ô input
    document.addEventListener('click', handleOutsideClick)
  }

  return (
    <Modal
      title="Check-in Booking"
      visible={true}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      {/* Switch để bật/tắt camera */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <label htmlFor="">{t('checkin.ScanCode')}</label>
        <Switch
          checked={cameraActive}
          onChange={toggleCamera}
          checkedChildren="Off"
          unCheckedChildren="On"
        />
      </div>

      {cameraActive && (
        <QrScanner
          delay={200}
          onError={handleError}
          onScan={handleScan}
          videoConstraints={{
            facingMode: 'environment',
            width: { ideal: 640 }, // Giảm độ phân giải của video
            height: { ideal: 480 }, // Giảm độ phân giải của video
          }}
          style={{
            width: '400px',
            height: '400px',
            display: 'block',
            margin: '0 auto',
          }}
        />
      )}

      <div className="UpdateBookingUser">
        <h3 style={{ textAlign: 'center', padding: '10px', fontSize: '24px' }}>
          {t('checkin.BookingDetails')}
        </h3>

        <Table
          size="small"
          dataSource={checkinData?.users}
          rowKey={(user) => user.passport}
          pagination={false}
          bordered
          expandable={{
            expandedRowRender: (user) => {
              const userIndex = checkinData.users.findIndex(
                (u: any) => u.passport === user.passport
              )

              return (
                <>
                  {/* Thông tin chi tiết của người dùng */}
                  <div style={{ padding: '10px' }}>

                    <div style={{ marginBottom: '20px' }}>
                      <table style={{ width: '100%', tableLayout: 'auto' }}>
                        <tbody>
                          {/* Dòng đầu tiên cho các tên cột */}
                          <tr>
                            <td style={{ fontWeight: 'bold' }}>{t('checkin.PassportNumber')}</td>
                            <td style={{ fontWeight: 'bold' }}>{t('checkin.FullName')}</td>
                            <td style={{ fontWeight: 'bold' }}>{t('checkin.Email')}</td>
                            {/* <td style={{ fontWeight: 'bold' }}>{t('checkin.Birthday')}</td> */}
                            <td style={{ fontWeight: 'bold' }}>{t('checkin.WhatsApp')}</td>
                            <td style={{ fontWeight: 'bold' }}>{t('checkin.Address')}</td>
                          </tr>
                          {/* Dòng thứ hai cho các giá trị (và ô input ẩn đi) */}
                          <tr>
                            <td>
                              <div className="editable-cell">
                                <span
                                  className="display-text"
                                  onClick={(e) => toggleEditMode(e, 'passport')}
                                >
                                  {user.passport || 'Chưa có dữ liệu'}
                                </span>
                                <input
                                  className="editable-input"
                                  value={user.passport}
                                  onChange={(e) =>
                                    handleInputChange(
                                      userIndex,
                                      'passport',
                                      e.target.value
                                    )
                                  }
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="editable-cell">
                                <span
                                  className="display-text"
                                  onClick={(e) =>
                                    toggleEditMode(e, 'full_name')
                                  }
                                >
                                  {user.full_name || 'Chưa có dữ liệu'}
                                </span>
                                <input
                                  className="editable-input"
                                  value={user.full_name}
                                  onChange={(e) =>
                                    handleInputChange(
                                      userIndex,
                                      'full_name',
                                      e.target.value
                                    )
                                  }
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="editable-cell">
                                <span
                                  className="display-text"
                                  onClick={(e) => toggleEditMode(e, 'email')}
                                >
                                  {user.email || 'Chưa có dữ liệu'}
                                </span>
                                <input
                                  className="editable-input"
                                  value={user.email}
                                  onChange={(e) =>
                                    handleInputChange(
                                      userIndex,
                                      'email',
                                      e.target.value
                                    )
                                  }
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </td>
                            {/* <td>
                              <div className="editable-cell">
                                <span
                                  className="display-text"
                                  onClick={(e) => toggleEditMode(e, 'birthday')}
                                >
                                  {user.birthday
                                    ? dayjs(user.birthday).format('YYYY-MM-DD')
                                    : 'Chưa có dữ liệu'}
                                </span>
                                <DatePicker
                                  className="editable-input"
                                  style={{ display: 'none' }}
                                  value={
                                    user.birthday ? dayjs(user.birthday) : null
                                  }
                                  onChange={(date) =>
                                    handleInputChange(
                                      userIndex,
                                      'birthday',
                                      date
                                        ? dayjs(date).format('YYYY-MM-DD')
                                        : ''
                                    )
                                  }
                                  format="YYYY-MM-DD"
                                />
                              </div>
                            </td> */}
                            <td>
                              <div className="editable-cell">
                                <span
                                  className="display-text"
                                  onClick={(e) => toggleEditMode(e, 'phone')}
                                >
                                  {user.phone || 'Chưa có dữ liệu'}
                                </span>
                                <input
                                  className="editable-input"
                                  value={user.phone}
                                  onChange={(e) =>
                                    handleInputChange(
                                      userIndex,
                                      'phone',
                                      e.target.value
                                    )
                                  }
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="editable-cell">
                                <span
                                  className="display-text"
                                  onClick={(e) => toggleEditMode(e, 'address')}
                                >
                                  {user.address || 'Chưa có dữ liệu'}
                                </span>
                                <input
                                  className="editable-input"
                                  value={user.address}
                                  onChange={(e) =>
                                    handleInputChange(
                                      userIndex,
                                      'address',
                                      e.target.value
                                    )
                                  }
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Chọn tour */}
                    <div>
                      {checkinData.booking_tours.filter(
                        (tour: any) => tour.remainingSlots > 0
                      ).length > 1 ? (
                        <div>
                          <h4>{t('checkin.SelectTourAndService')}</h4>
                          <Checkbox.Group
                            value={user.selectedTours.map(
                              (tour: any) => tour.id
                            )} // Giá trị là mảng các ID của các tour đã được chọn
                            onChange={(selectedTourIds) => {
                              // Đảm bảo selectedTourIds là mảng, nếu không thì biến nó thành mảng
                              if (!Array.isArray(selectedTourIds)) {
                                selectedTourIds = [selectedTourIds] // Chuyển thành mảng nếu chỉ có một giá trị
                              }
                              // Cập nhật mỗi lần chọn tour
                              selectedTourIds.forEach((tourId) => {
                                handleTourSelect(user.passport, tourId) // Gọi hàm để chọn tour
                              })
                            }}
                          >
                            {checkinData.booking_tours
                              .filter((tour: any) => tour.remainingSlots > 0) // Chỉ hiển thị những tour còn chỗ
                              .map((tour: any) => (
                                <Checkbox
                                  key={tour.id}
                                  value={tour.id} // Mỗi Checkbox có giá trị là ID của tour
                                  disabled={
                                    user.selectedTours.some(
                                      (t: any) => t.id === tour.id
                                    ) || tour.remainingSlots === 0 // Vô hiệu hóa nếu tour đã được chọn hoặc không còn chỗ
                                  }
                                >
                                  {tour.name} {/* Hiển thị tên của tour */}
                                </Checkbox>
                              ))}
                          </Checkbox.Group>
                        </div>
                      ) : null}
                      {/* Hiển thị các tour đã chọn và chọn dịch vụ */}
                      {user.selectedTours.map(
                        (tour: any, tourIndex: number) => {
                          const originalTour = checkinData.booking_tours.find(
                            (t: any) => t.id === tour.id
                          )

                          return (
                            <div key={tour.id}>
                              <div className="NameTour_selectService">
                                <h5>
                                  Tour :
                                  <span style={{ color: 'green' }}>
                                    {originalTour?.name}
                                  </span>
                                </h5>
                                <Select
                                  mode="multiple" // Cho phép chọn nhiều dịch vụ
                                  style={{
                                    width: '20%', // Phần select rộng hết chiều ngang
                                    whiteSpace: 'nowrap', // Không xuống dòng
                                    overflow: 'hidden', // Ẩn phần tràn ra ngoài
                                    textOverflow: 'ellipsis', // Hiển thị dấu "..."
                                  }}
                                  placeholder="Chọn dịch vụ"
                                  value={
                                    tour.booking_service_by_tours?.map(
                                      (service: any) => service.id
                                    ) || []
                                  }
                                  onChange={(selectedServiceIds) => {
                                    selectedServiceIds.forEach(
                                      (serviceId: any) => {
                                        const selectedService =
                                          originalTour?.services.find(
                                            (service: any) =>
                                              service.id === serviceId
                                          )
                                        if (selectedService) {
                                          handleServiceSelect(
                                            user.passport, // Passport của người dùng
                                            tour.id, // ID của tour
                                            selectedService, // Dịch vụ đã chọn
                                            1 // Số lượng dịch vụ còn lại
                                          )
                                        }
                                      }
                                    )
                                  }}
                                  maxTagCount={1} // Giới hạn số lượng tag hiển thị
                                  maxTagTextLength={15} // Giới hạn chiều dài mỗi tag
                                  tokenSeparators={[',']} // Cho phép tách tag bằng dấu phẩy nếu cần
                                  dropdownStyle={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                  }} // Đảm bảo dropdown không quá dài
                                  tagRender={(props) => {
                                    const { label, value, closable, onClose } =
                                      props
                                    return (
                                      <span
                                        className="ant-select-selection-item"
                                        style={{
                                          whiteSpace: 'nowrap', // Ngăn không cho tag xuống dòng
                                          overflow: 'hidden', // Ẩn phần vượt quá độ rộng
                                          textOverflow: 'ellipsis', // Hiển thị dấu "..."
                                        }}
                                      >
                                        {label}
                                        {closable && (
                                          <span onClick={onClose}> x </span>
                                        )}
                                      </span>
                                    )
                                  }}
                                >
                                  {originalTour?.services.map(
                                    (service: any) => (
                                      <Select.Option
                                        key={service.id}
                                        value={service.id}
                                        disabled={tour.booking_service_by_tours.some(
                                          (s: any) => s.id === service.id
                                        )}
                                      >
                                        {`${service.name} (Còn: ${service.remainingQuantity})`}
                                      </Select.Option>
                                    )
                                  )}
                                </Select>
                              </div>

                              {/* Hiển thị các dịch vụ đã chọn */}
                              {tour.booking_service_by_tours.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                  <table
                                    style={{
                                      width: '100%',
                                      tableLayout: 'auto',
                                      borderCollapse: 'collapse',
                                    }}
                                  >
                                    <thead>
                                      <tr>
                                        <th style={{ fontWeight: 'bold' }}>{t('checkin.ServiceName')}</th>
                                        <th style={{ fontWeight: 'bold' }}>{t('checkin.Quantity')}</th>
                                        <th style={{ fontWeight: 'bold' }}>{t('checkin.Unit')}</th>
                                        <th style={{ fontWeight: 'bold' }}>{t('checkin.Price')}</th>
                                        <th style={{ fontWeight: 'bold' }}>{t('checkin.SupplyTime')}</th>
                                        <th style={{ fontWeight: 'bold' }}>{t('checkin.Action')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tour.booking_service_by_tours.map(
                                        (service: any) => (
                                          <tr key={service.id}>
                                            {/* Tên dịch vụ */}
                                            <td>
                                              <div className="editable-cell">
                                                <span
                                                  className="display-text"
                                                  onClick={(e) =>
                                                    toggleEditMode(e, 'name')
                                                  }
                                                  style={{ fontWeight: 'bold', color: 'blue' }}

                                                >
                                                  {service.name}
                                                </span>
                                              </div>
                                            </td>

                                            {/* Số lượng */}
                                            <td>
                                              <div className="editable-cell">
                                                <span
                                                  className="display-text"
                                                  onClick={(e) =>
                                                    toggleEditMode(
                                                      e,
                                                      'quantity'
                                                    )
                                                  }
                                                >
                                                  {service.quantity}
                                                </span>
                                                <InputNumber
                                                  className="editable-input"
                                                  style={{
                                                    display: 'none',
                                                    maxWidth: '100%',
                                                  }}
                                                  min={1}
                                                  max={
                                                    service.remainingQuantity +
                                                    1
                                                  }
                                                  value={service.quantity}
                                                  onChange={(value) => {
                                                    handleUpdateServiceQuantity(
                                                      user.passport,
                                                      tour.id,
                                                      service.service_id,
                                                      value
                                                    )
                                                  }}
                                                />
                                              </div>
                                            </td>

                                            {/* Đơn vị */}
                                            <td>
                                              <div className="editable-cell">
                                                <span
                                                  className="display-text"
                                                  onClick={(e) =>
                                                    toggleEditMode(e, 'unit')
                                                  }
                                                >
                                                  {service.type === 'bus'
                                                    ? 1
                                                    : service.unit}
                                                </span>
                                                <InputNumber
                                                  className="editable-input"
                                                  style={{
                                                    display: 'none',
                                                    maxWidth: '100%',
                                                  }}
                                                  value={
                                                    service.type === 'bus'
                                                      ? 1
                                                      : service.unit
                                                  }
                                                  disabled={
                                                    service.type === 'bus'
                                                  }
                                                  onChange={(value) => {
                                                    handleUpdateServiceAttribute(
                                                      userIndex,
                                                      tour.id,
                                                      service.service_id,
                                                      'unit',
                                                      value
                                                    )
                                                  }}
                                                />
                                              </div>
                                            </td>

                                            {/* Giá */}
                                            <td>
                                              <div className="editable-cell">
                                                <span className="display-text" style={{ color: 'red' }}>
                                                  {service.price.toLocaleString()}{' '}
                                                  VND
                                                </span>
                                              </div>
                                            </td>

                                            {/* Thời gian cung ứng */}
                                            <td>
                                              <div className="editable-cell">
                                                <span
                                                  className="display-text"
                                                  onClick={(e) =>
                                                    toggleEditMode(
                                                      e,
                                                      'start_time'
                                                    )
                                                  }
                                                >
                                                  {service.start_time
                                                    ? dayjs(
                                                      service.start_time
                                                    ).format('YYYY-MM-DD')
                                                    : 'Chưa có thời gian'}
                                                </span>
                                                <DatePicker
                                                  className="editable-input"
                                                  style={{ display: 'none' }}
                                                  value={
                                                    service.start_time
                                                      ? dayjs(
                                                        service.start_time
                                                      )
                                                      : null
                                                  }
                                                  onChange={(date) => {
                                                    handleUpdateServiceAttribute(
                                                      userIndex,
                                                      tour.id,
                                                      service.service_id,
                                                      'start_time',
                                                      date
                                                        ? date.format(
                                                          'YYYY-MM-DD'
                                                        )
                                                        : ''
                                                    )
                                                  }}
                                                />
                                              </div>
                                            </td>
                                            <td>
                                              <div className="editable-cell">
                                                <Button
                                                  danger
                                                  onClick={() => {
                                                    if (
                                                      user.passport &&
                                                      tour.id &&
                                                      service.service_id
                                                    ) {
                                                      handleRemoveService(
                                                        user.passport,
                                                        tour.id,
                                                        service.service_id
                                                      )
                                                    } else {
                                                      console.warn(
                                                        'Thông tin không đầy đủ: passport, tour ID, hoặc service ID bị thiếu.'
                                                      )
                                                    }
                                                  }}
                                                // icon={<MdDeleteForever />}
                                                >
                                                  Hủy chọn
                                                </Button>
                                              </div>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )
                        }
                      )}
                    </div>

                    <Button
                      type="primary"
                      // onClick={() => handleCheckInSubmit(user)}
                      style={{ marginTop: '10px' }}
                    >
                      {t('checkin.IndividualPayment')}
                    </Button>
                  </div>
                </>
              )
            },
            rowExpandable: () => true,
          }}
        >
          <Column
            title={t('checkin.User')}
            dataIndex="full_name"
            key="full_name"
            render={(text: string, user: any, index: number) => (
              <>
                <AiOutlineClose
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: 'red',
                    marginRight: '8px',
                  }}
                  onClick={() => handleRemoveUser(index)}
                />
                {text}
              </>
            )}
          />
          <Column title={t('checkin.PassportNumber')} dataIndex="passport" key="passport" />
          {/* Có thể thêm các cột khác nếu cần */}
        </Table>

        <div className="button-checkin-all">
          <Button className="button-add-user-1" onClick={handleAddUser}>
            {t('checkin.UserAdd')}
          </Button>
          <Button
            className="button-add-user-2"
            onClick={() => handleCheckInSubmit()}
            loading={loading}
          >
            {t('checkin.GeneralPayment')}
          </Button>
        </div>
        <Bill />
      </div>
      <Bill />
    </Modal>
  )
}

export default CheckinBookingModal
