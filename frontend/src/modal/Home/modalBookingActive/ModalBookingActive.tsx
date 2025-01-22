import React, { useEffect, useState } from 'react'
import {
  Modal,
  Switch,
  message,
  Table,
  Typography,
  Tag,
  Checkbox,
  Button,
  Card,
  Descriptions,
  Steps,
  List,
  notification,
  Drawer,
  Input,
} from 'antd'
import QrScanner from 'react-qr-scanner'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from 'redux/store'
import {
  addUserIdActive,
  removerUserIdActive,
  clearBookingUserActive,
  clearBookingTourState,
} from 'redux/Reducer/BookingTourReducer'
import {
  CheckCircleOutlined,
  DollarOutlined,
  CarOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  SmileOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { BookingActivityOk } from 'redux/API/POST/BookingActive'
import { fetchBookingToursWithStatus } from 'redux/API/GET/getBookingActive/GetBookingTour'
import { CancelBookingTour } from 'redux/API/DELETE/CacelBookingTour'
import { CancelBookingTourUser } from 'redux/API/DELETE/CancelUserBooking'
import { getServiceTour } from 'redux/API/GET/getService/GetServiceTour'
import {
  addUserToCheckIn,
  clearCurrentCheckIn,
  addServiceToBookingTourUsers,
  removeServiceFromBookingTourUsers,
  updateServiceQuantityAndUnit,
} from 'redux/Reducer/CheckinReducer'
import { checkInThunk } from 'redux/API/POST/CheckinThunk'
import { getBookingBill } from 'redux/API/GET/GetBill'
import { showModal } from 'redux/Redux/modal/modalSlice'
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'
import { FaRegTrashCan } from 'react-icons/fa6'


const { Title, Text } = Typography
const { Step } = Steps

interface BookingActiveModalProps {
  onClose: () => void // Function to close the modal
}

const BookingActiveModal: React.FC<BookingActiveModalProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch()

  const [cameraActive, setCameraActive] = useState<boolean>(false) // Camera state
  const [scannedPassport, setScannedPassport] = useState<string | null>(null)
  // Lấy dữ liệu từ Redux store
  const usersDetail = useSelector(
    (state: RootState) => state.BookingTourReducer.users
  )
  const BookingDetail = useSelector(
    (state: RootState) => state.BookingTourReducer.bookingTourDetail
  )
  const StatusBookingActive = useSelector(
    (state: RootState) => state.BookingTourReducer.status
  )

  const checkinData = useSelector(
    (state: RootState) => state.checkin.currentCheckIn
  )

  //   console.log('Dữ liệu sttttttt:', StatusBookingActive)

  const bookingActiveUser = useSelector(
    (state: RootState) => state.BookingTourReducer.bookingActiveUser
  )

  const usersWithSelection = usersDetail.map((user) => ({
    ...user,
    isSelected: bookingActiveUser.includes(user.id),
  }))

  // Kiểm tra dữ liệu từ Redux state

//   console.log('Dữ liệu người dùng:', usersDetail)
    console.log('Dữ liệu tour:', BookingDetail)

  // Handle successful QR scan
  const handleScan = (data: any) => {
    if (data) {
      const scannedText = data.text
      setScannedPassport(scannedText)
      //   alert('Đã quét mã QR: ' + scannedText)
      //   console.log('Dữ liệu mã QR:', scannedText)

      const userActiveOk = usersDetail.find(
        (user) => user.passport === scannedText
      )

      if (userActiveOk) {
        // Kiểm tra xem userId đã tồn tại trong bookingActiveUser chưa
        if (bookingActiveUser.includes(userActiveOk.id)) {
          message.info('Người dùng đã được thêm vào danh sách.')
          console.log(
            'Người dùng đã tồn tại trong bookingActiveUser:',
            userActiveOk
          )
        } else {
          dispatch(addUserIdActive(userActiveOk.id))
          console.log('Đã thêm người dùng vào bookingActiveUser:', userActiveOk)
          message.success('Đã thêm người dùng thành công.')
        }
      } else {
        message.warning('Không tìm thấy người dùng với hộ chiếu này.')
      }
    }
  }
  //   console.log('Dữ liệu người dùng đã thêm:', bookingActiveUser)
  // Handle errors in the QR scanner
  const handleError = (err: any) => {
    console.error('Lỗi từ camera hoặc quá trình quét:', err)
    message.error('Có lỗi xảy ra khi sử dụng camera.')
  }

  // Toggle camera on/off
  const toggleCamera = (checked: boolean) => {
    setCameraActive(checked)
  }

  //   chọn chekcbox

  const handleCheckboxChange = (
    e: CheckboxChangeEvent, // Sử dụng CheckboxChangeEvent thay vì ChangeEvent<HTMLInputElement>
    userId: string
  ) => {
    if (e.target.checked) {
      // Nếu checkbox được chọn, thêm user vào mảng bookingActiveUser
      dispatch(addUserIdActive(userId))
    } else {
      // Nếu checkbox bị bỏ chọn, xóa user khỏi mảng bookingActiveUser
      dispatch(removerUserIdActive(userId)) // Giả sử bạn có action removeUserIdActive để xóa user
    }
  }

  //////// lấy dịch vụ của tour \\\\\\\\\

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
  const listServiceTour = useSelector(
    (state: RootState) => state.service.serviceTourList
  )

  const handleAddService = (
    userId: any,
    fullname: any,
    passport: any,
    phone: any,
    address: any,
    email: any,
    birthday: any
  ) => {
    const userDetails = {
      id: userId,
      full_name: fullname,
      passport: passport,
      phone: phone,
      birthday: '',
      address: address,
      email: '',
      selectedTours: [],
    }

    const tourId = BookingDetail?.bookingTour?.tour_id
    dispatch(addUserToCheckIn(userDetails))
    dispatch(getServiceTour({ tourId, userId }))
    setDrawerVisible(true)
  }

//   console.log('Dữ liệu người dùngdddđ:', checkinData)

  const closeDrawer = () => {
    dispatch(clearCurrentCheckIn())
    setDrawerVisible(false)
  }

  const selectedServicesFromRedux = useSelector(
    (state: RootState) => state.checkin.currentCheckIn.checkInServiceForUser
  )

  const handleCheckboxChangeService = (e: CheckboxChangeEvent, record: any) => {
    const checked = e.target.checked
    if (checked) {
      dispatch(
        addServiceToBookingTourUsers({
          id: record.service_id,
          service_id: record.service_id,
          name: record.service_name,
          quantity: record.service_quantity || 1,
          unit: record.service_unit || 1,
          price: record.service_price || 0,
          type: record.type || '',
          sale_agent_id: null,
          quantity_customer: 1,
          start_time: record.start_time || null,
          end_time: record.end_time || null,
          remainingQuantity: 1,
        })
      )
      console.log('Dịch vụ được chọn:', record)
    } else {
      console.log('Dịch vụ bị bỏ chọn:', record)
      dispatch(removeServiceFromBookingTourUsers({ id: record.service_id }))
    }
  }
//   console.log('Dữ liệu dịch vụ đã chọn:', selectedServicesFromRedux)

  const handleCheckInService = async (user = null) => {
    if (!checkinData) {
      message.error('Không có dữ liệu để check-in');
      return;
    }
  
    console.log('checkinData:', checkinData);
  
    // Lấy ID của tour từ BookingDetail
    const bookingTourId = BookingDetail?.bookingTour?.booking_id;
    const startTime = BookingDetail?.bookingTour?.start_time;
    const endTime = BookingDetail?.bookingTour?.end_time;
  
    if (!bookingTourId) {
      message.error('Không tìm thấy ID của tour trong BookingDetail');
      return;
    }
  
    // Tùy chọn: lấy thông tin từ user hoặc tất cả người dùng trong checkinData
    const usersData = user
      ? [user] // Nếu có user được truyền vào, chỉ gửi dữ liệu của user đó
      : checkinData.users; // Nếu không, gửi toàn bộ dữ liệu người dùng
  
    console.log('usersData:', usersData);
  
    // Tạo payload từ checkinData
    const data = usersData.map((user) => ({
      users: {
        full_name: user.full_name,
      },
      user_details: {
        birthday: user.birthday,
        passport: user.passport,
        address: user.address,
        phone: user.phone,
      },
      booking_tours: {
        id: Number(bookingTourId), // Lấy ID từ BookingDetail
        booking_tour_service_users: checkinData.checkInServiceForUser.flatMap(
          (serviceUser) =>
            serviceUser.booking_tour_service_users.map((service) => ({
                service_id: service.service_id,
              quantity: service.quantity,
              unit: service.unit,
                price: service.price,
              start_time: startTime,
              end_time: endTime,
              sale_agent_id: '1',
            }))
        ),
      },
    }));
  
    console.log('Payload để check-in:', data);
  
    try {
      const resultAction = await dispatch(checkInThunk({ data })).unwrap();
  
      console.log('Check-in thành công:', resultAction);
  
      if (resultAction) {
        message.success('Check-in thành công!');
  
        // Gọi API lấy thông tin bill
        const billResult = await dispatch(
          getBookingBill(resultAction.data)
        ).unwrap();
  
        dispatch(getBooking());
  
        // Hiển thị modal nếu lấy bill thành công
        if (billResult) {
          dispatch(showModal('billModal'));
        } else {
          message.error('Không thể lấy thông tin bill.');
        }
      } else {
        message.error('Check-in thất bại.');
      }
    } catch (error) {
      console.error('Lỗi khi check-in:', error);
      message.error('Có lỗi xảy ra trong quá trình check-in');
    }
  };
  

  const columnsService = () => [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: '5%',
      render: (_, record) => (
        <Checkbox
          onChange={(e) => handleCheckboxChangeService(e, record)}
          checked={selectedServicesFromRedux.some((serviceUser) =>
            serviceUser.booking_tour_service_users?.some(
              (service) => service.service_id === record.service_id
            )
          )}
        />
      ),
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'service_name',
      key: 'service_name',
      width: '30%',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'service_quantity',
      key: 'service_quantity',
      width: '12%',
      render: (text, record) => (
        <Input
        type="number"
        min={1}
        value={record.quantity || 1} // Giá trị mặc định là 1
        onChange={(e) => {
          const newQuantity = Number(e.target.value);
          dispatch(
            updateServiceQuantityAndUnit({
              serviceId: record.service_id,
              quantity: newQuantity,
              unit: record.unit || 1, // Giữ nguyên đơn vị cũ
            })
          );
        }}
      />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'service_unit',
      key: 'service_unit',
      width: '12%',
      render: (text, record) => (
        <Input
        type="number"
        min={1}
        disabled={record.type === 'bus'}
        value={record.unit || 1} // Giá trị mặc định là 1
        onChange={(e) => {
          const newUnit = Number(e.target.value);
          dispatch(
            updateServiceQuantityAndUnit({
              serviceId: record.service_id,
              quantity: record.quantity || 1, // Giữ nguyên số lượng cũ
              unit: newUnit,
            })
          );
        }}
      />
      ),
    },
    {
      title: 'Giá tiền',
      dataIndex: 'total_service_price',
      key: 'total_service_price',
      width: '30%',
      render: (_, record) => {
        // Tính giá tiền: dịch vụ * số lượng * đơn vị
        const price = record.service_price || 0 // Giá dịch vụ
        const quantity = record.service_quantity || 1 // Số lượng
        const unit = record.service_unit || 1 // Đơn vị

        const totalPrice = price * quantity * unit

        // Định dạng lại giá tiền
        const formattedPrice = totalPrice
          ? Math.round(totalPrice).toLocaleString().replace(/,/g, '.')
          : 'Chưa có giá'

        return <Text>{formattedPrice} VND</Text>
      },
    },
  ]

  // Columns for the main table (Users)
  const userColumns = [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      render: (_, record) => (
        <Checkbox
          checked={record.isSelected}
          onChange={(e) => handleCheckboxChange(e, record.id)}
        />
      ),
      width: 40,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Hộ chiếu',
      dataIndex: 'passport',
      key: 'passport',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() =>
            handleAddService(
              record.id,
              record.fullname,
              record.passport,
              record.phone,
              record.address,
              record.email,
              record.birthday
            )
          }
        >
          Thêm dịch vụ
        </Button>
      ),
    },
  ]

  // Columns for the expanded table (Services)
  const serviceColumns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'name',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'waiting' ? 'orange' : 'green'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
    },

    {
      title: 'Giá',
      dataIndex: ['service', 'price'],
      key: 'price',
      render: (price) => `${price} VND`,
    },

    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Hành động',
      dataIndex: 'note',
      key: 'note',
    },
  ]

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getStatusTagColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'orange'
      case 'paid':
        return 'green'
      case 'cancelled':
        return 'red'
      case 'completed':
        return 'blue'
      default:
        return 'default'
    }
  }

  const details = [
    { label: 'Trạng thái', value: BookingDetail?.bookingTour?.status },
    {
      label: 'Số lượng khách',
      value: BookingDetail?.bookingTour?.quantity_customer,
    },
    {
      label: 'Thời gian bắt đầu',
      value: BookingDetail?.bookingTour?.start_time,
    },
    {
      label: 'Thời gian kết thúc',
      value: BookingDetail?.bookingTour?.end_time,
    },
  ]

  ///// các bước của tour \\\\\

  // Định nghĩa thứ tự các bước
  const stepsFromState = Object.values(StatusBookingActive)

  const stepOrder = stepsFromState

  //   console.log('Dữ liệu bước:', stepOrder)

  // Định nghĩa tiêu đề và màu sắc cho từng bước
  const stepDetails = {
    checkin: { title: 'Checkin', icon: <HomeOutlined /> },
    paid: { title: 'Thanh toán', icon: <DollarOutlined /> },
    on_bus: { title: 'Đang đi bus', icon: <CarOutlined /> },
    arrived: {
      title: 'Đến nơi',
      icon: <CheckCircleOutlined />,
    },
    start_tour: {
      title: 'Bắt đầu tour',
      icon: <PlayCircleOutlined />,
    },
    complete_tour: {
      title: 'Hoàn thành tour',
      icon: <SmileOutlined />,
    },
    cancel: { title: 'Hủy bỏ', icon: <CloseCircleOutlined /> },
  }

  // Lấy các hoạt động từ booking_activities
  const bookingActivities = BookingDetail?.bookingTour?.booking_activities || []

  // Lấy tên của hoạt động mới nhất
  const latestActivity =
    bookingActivities.length > 0
      ? bookingActivities[bookingActivities.length - 1].name
      : null

  // Xác định chỉ số của bước hiện tại trong stepOrder
  const currentStepIndex = latestActivity
    ? stepOrder.indexOf(latestActivity)
    : 0

  // Đảm bảo chỉ số hợp lệ
  const currentStep = currentStepIndex !== -1 ? currentStepIndex : 0

  // Tạo mảng các bước cho Steps component

  const steps = stepOrder.map((status, index) => {
    const isCompleted = index < currentStep // Bước đã hoàn thành
    const isActive = index === currentStep // Bước hiện tại
    const isUpcoming = index > currentStep // Bước sắp tới

    // Màu của icon: Hoàn thành hoặc hiện tại thì dùng màu gốc, nếu chưa tới thì màu xám
    const iconColor =
      isCompleted || isActive ? stepDetails[status].color : '#ccc'
    // Màu của tên bước: Hoàn thành hoặc hiện tại thì sáng hơn, bước chưa tới thì tối hơn
    const titleColor = isCompleted || isActive ? '#000' : '#ccc'
    // Độ đậm của tên bước: bước hiện tại in đậm
    const fontWeight = isActive ? 'bold' : 'normal'

    return {
      key: status,
      title: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: 24, color: iconColor }}>
            {stepDetails[status].icon}
          </div>
          {/* Tên bước */}
          <div style={{ marginTop: 8, color: titleColor, fontWeight }}>
            {stepDetails[status].title}
          </div>
        </div>
      ),
    }
  })

  const handleNextStep = () => {
    // Kiểm tra xem có bước tiếp theo không
    if (currentStep < stepOrder.length - 1) {
      const nextStepIndex = currentStep + 1
      const nextStepName = stepOrder[nextStepIndex]

      if (nextStepName === 'complete_tour') {
        notification.info({
          message: 'Tour đã hoàn thành',
          description:
            'Tour đã hoàn thành và không thể hủy. Vui lòng kiểm tra lại.',
          placement: 'topRight',
          duration: 3,
        })
        return // Dừng lại không chuyển bước
      }

      const bookingId = BookingDetail?.bookingTour?.id
      // Tạo payload
      const payload = {
        customer_ids: bookingActiveUser,
        name: nextStepName,
      }

      console.log('Dữ liệu payload:', payload)

      // Tìm các khách hàng còn thiếu
      const missingCustomers = usersDetail.filter(
        (user) => !bookingActiveUser.includes(user.id)
      )

      if (missingCustomers.length > 0) {
        Modal.confirm({
          title: 'Xác nhận bỏ qua khách hàng',
          content: (
            <div>
              <p style={{ fontWeight: 'bold' }}>
                Danh sách khách hàng chưa được chọn:
              </p>
              {missingCustomers.map((user) => (
                <Card
                  key={user.id}
                  size="small"
                  style={{ marginBottom: '10px', backgroundColor: '#f9f9f9' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text>
                      <Text strong>Họ tên:</Text> {user.fullname}
                    </Text>
                    <Text>
                      <Text strong>Passport:</Text> {user.passport || 'N/A'}
                    </Text>
                  </div>
                </Card>
              ))}
              <p
                style={{
                  marginTop: '10px',
                  fontStyle: 'italic',
                  color: '#d46b08',
                }}
              >
                Hãy chắc chắn rằng bạn muốn bỏ qua các khách hàng này để chuyển
                bước.
              </p>
            </div>
          ),
          okText: 'Chắc chắn',
          cancelText: 'Hủy',
          width: 600,
          onOk: () => {
            proceedToStep(payload, bookingId)
            dispatch(fetchBookingToursWithStatus())
          },
        })
      } else {
        proceedToStep(payload, bookingId)
        dispatch(fetchBookingToursWithStatus())
      }
    } else {
      message.info('Đã ở bước cuối cùng, không thể next.')
    }
  }

  const handleBackStep = () => {
    // Kiểm tra xem có bước trước đó không
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1
      const prevStepName = stepOrder[prevStepIndex]

      if (prevStepName === 'checkin') {
        notification.info({
          message: 'Không thể quay lại bước checkin',
          description:
            'Bạn không thể quay lại bước checkin. Vui lòng tiếp tục các bước tiếp theo.',
          placement: 'topRight', // Vị trí thông báo
          duration: 3, // Thời gian hiển thị thông báo (tính bằng giây)
        })
        return
      }
      // Lấy tất cả id từ usersDetail
      const allUserIds = usersDetail.map((user) => user.id)

      // Tạo payload
      const payload = {
        customer_ids: allUserIds,
        name: prevStepName,
      }

      const bookingId = BookingDetail?.bookingTour?.id

      Modal.confirm({
        title: 'Xác nhận quay lại bước trước',
        content: 'Bạn có chắc chắn muốn quay lại bước trước?',
        okText: 'Có',
        cancelText: 'Không',
        onOk: () => {
          const prevStepIndex = currentStep - 1
          const prevStepName = stepOrder[prevStepIndex]

          // Lấy tất cả id từ usersDetail
          const allUserIds = usersDetail.map((user) => user.id)

          // Tạo payload
          const payload = {
            customer_ids: allUserIds,
            name: prevStepName,
          }

          const bookingId = BookingDetail?.bookingTour?.id

          proceedToStep(payload, bookingId)
          dispatch(fetchBookingToursWithStatus())
        },
        onCancel: () => {
          message.info('Không thực hiện hành động quay lại bước trước.')
        },
      })
      proceedToStep(payload, bookingId)
      dispatch(fetchBookingToursWithStatus())
    } else {
      message.info('Đã ở bước đầu tiên, không thể quay lại.')
    }
  }

  const proceedToStep = (payload, bookingId) => {
    dispatch(BookingActivityOk({ payload, bookingId }))
      .unwrap()
      .then(() => {
        dispatch(fetchBookingToursWithStatus())
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật bước thành công!',
          placement: 'topRight',
          duration: 3,
        })
      })
      .catch((error) => {
        notification.error({
          message: 'Thất bại',
          description: error?.message || 'Cập nhật thất bại!',
          placement: 'topRight',
          duration: 3,
        })
      })
  }

  //////// Lịch sử các bước của tour \\\\\\\\\

  const [open, setOpen] = useState(false)

  const showDrawer = () => {
    setOpen(true)
  }

  const onCloseok = () => {
    setOpen(false)
  }

  //////// Cancel Booking \\\\\\\\\
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalUserCancel, setIsModalUserCancel] = useState(false)
  const [note, setNote] = useState('') // Lý do hủy tour

  const handleCancelBooking = () => {
    setIsModalVisible(true) // Mở Modal
  }

  const handleOk = () => {
    if (!note.trim()) {
      message.error('Vui lòng nhập lý do hủy tour')
      return
    }

    const bookingId = BookingDetail?.bookingTour?.id
    dispatch(CancelBookingTour({ bookingID: bookingId, note }))
      .unwrap()
      .then(() => {
        dispatch(fetchBookingToursWithStatus())
        notification.success({
          message: 'Thành công',
          description: 'Hủy tour thành công!',
          placement: 'topRight',
          duration: 3,
        })
        setIsModalVisible(false) // Đóng Modal sau khi hoàn thành
      })
      .catch((error) => {
        dispatch(fetchBookingToursWithStatus())
        notification.error({
          message: 'Thất bại',
          description: error?.message || 'Hủy tour thất bại!',
          placement: 'topRight',
          duration: 3,
        })
      })
  }

  const handleCancel = () => {
    message.info('Không thực hiện hành động hủy tour.')
    setIsModalVisible(false) // Đóng Modal khi nhấn "Cancel"
  }

  const handleCancelUserBooking = () => {
    setIsModalUserCancel(true) // Mở Modal
  }

  const handleOkUser = () => {
    if (!note.trim()) {
      message.error('Vui lòng nhập lý do hủy tour')
      return
    }

    const customerIds = bookingActiveUser // Giả sử bạn lấy `id` từ mỗi phần tử trong bookingActiveUser
    const bookingId = BookingDetail?.bookingTour?.id

    console.log('Dữ liệu bookingActiveUser:', bookingActiveUser)

    // Gửi dữ liệu qua API hoặc Dispatch Redux action (ví dụ: sử dụng Axios hoặc Redux thunk)
    dispatch(CancelBookingTourUser({ bookingID: bookingId, note, customerIds }))
      .unwrap()
      .then(() => {
        dispatch(fetchBookingToursWithStatus())
        notification.success({
          message: 'Thành công',
          description: 'Hủy tour thành công!',
          placement: 'topRight',
          duration: 3,
        })
      })
      .catch((error) => {
        // Xử lý lỗi khi hủy tour không thành công
        message.error('Đã xảy ra lỗi khi hủy tour. Vui lòng thử lại.')
      })
  }

  const handleCancelUser = () => {
    message.info('Không thực hiện hành động hủy tour.')
    setIsModalUserCancel(false) // Đóng Modal khi nhấn "Cancel"
  }

  //////// reser booking user active \\\\\\\\\

  useEffect(() => {
    return () => {
      dispatch(clearBookingUserActive())
      dispatch(clearBookingTourState())
    }
  }, [dispatch])

  return (
    <>
      <Modal
        title="Quét mã QR"
        visible={true}
        onCancel={onClose} // Handle modal close
        footer={null}
        width={1200}
      >
        {/* Toggle to activate/deactivate camera */}
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <label htmlFor="">Bật/Tắt Camera</label>
          <Switch
            checked={cameraActive}
            onChange={toggleCamera}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
        </div>

        {/* QR Scanner */}
        {cameraActive && (
          <QrScanner
            delay={200}
            onError={handleError}
            onScan={handleScan}
            videoConstraints={{
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 },
            }}
            style={{
              width: '400px',
              height: '400px',
              display: 'block',
              margin: '0 auto',
            }}
          />
        )}

        {/* Tour Information */}
        <Card style={{ marginTop: 20 }} size="small">
          <div
            style={{
              display: 'flex',
              justifyContent: 'end',
              alignItems: 'center',
            }}
          >
            <FaRegTrashCan
              color="red"
              size={18}
              style={{ marginRight: '20px', cursor: 'pointer' }}
              onClick={handleCancelBooking}
            />
          </div>
          <Steps
            // progressDot
            size="small"
            current={currentStep}
            direction="horizontal"
            style={{ margin: '40px 0', padding: '0 20px' }}
          >
            {steps.map((step) => (
              <Step
                key={step.key}
                title={stepDetails[step.key].title}
                icon={stepDetails[step.key].icon}
              />
            ))}
          </Steps>
          <div className="TitleModalBookingActive">
            <Title level={2}>
              Tour:{' '}
              <span style={{ color: 'green' }}>
                {BookingDetail?.bookingTour?.name_tour}
              </span>
            </Title>
            <div className="ButtonModalBookingActive">
              <Button
                style={{
                  backgroundColor: '#f39c12', // Màu vàng
                  borderColor: '#f39c12', // Màu viền vàng
                  color: 'white', // Màu chữ trắng
                }}
                onClick={handleBackStep}
              >
                Back
              </Button>
              <Button type="primary" onClick={handleNextStep}>
                Next
              </Button>
              <Button type="default" onClick={showDrawer}>
                Lịch sử
              </Button>
            </div>
          </div>

          <Descriptions size="small" bordered column={4} layout="horizontal">
            {details.map((item, index) => (
              <Descriptions.Item
                label={<Text strong>{item.label}</Text>}
                key={index}
              >
                {item.label === 'Trạng thái' ? (
                  <Tag color={getStatusTagColor(item.value)}>
                    {item.value && typeof item.value === 'string'
                      ? item.value.charAt(0).toUpperCase() + item.value.slice(1)
                      : 'N/A'}
                  </Tag>
                ) : (
                  item.value
                )}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
        {/* User Table */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title level={4}>Danh sách người dùng</Title>
            <FaRegTrashCan
              color="red"
              size={18}
              style={{ marginRight: '20px', cursor: 'pointer' }}
              onClick={handleCancelUserBooking}
            />
          </div>
          <hr />
          <Table
            size="small"
            dataSource={usersWithSelection}
            columns={userColumns}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  dataSource={record.booking_tour_service_users || []} // Danh sách dịch vụ
                  columns={serviceColumns}
                  pagination={false}
                  rowKey="id"
                />
              ),
              rowExpandable: (record) =>
                (record.booking_tour_service_users?.length || 0) > 0,
            }}
            pagination={{ pageSize: 5 }}
          />
        </div>
        <Drawer title="Basic Drawer" onClose={onCloseok} open={open}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </Modal>

      <Modal
        title="Xác nhận hủy tour"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Có"
        cancelText="Không"
      >
        <div>
          <p>Bạn có chắc chắn muốn hủy tour này?</p>
          <Input.TextArea
            placeholder="Nhập lý do hủy tour"
            value={note}
            onChange={(e) => setNote(e.target.value)} // Lưu lý do vào state
            rows={4}
          />
        </div>
      </Modal>
      <Modal
        title="Xác nhận hủy tour"
        visible={isModalUserCancel}
        onOk={handleOkUser}
        onCancel={handleCancelUser}
        okText="Có"
        cancelText="Không"
      >
        <div>
          <p>Bạn có chắc chắn muốn hủy tour này?</p>
          <Input.TextArea
            placeholder="Nhập lý do hủy tour"
            value={note}
            onChange={(e) => setNote(e.target.value)} // Lưu lý do vào state
            rows={4}
          />
        </div>
      </Modal>

      {/* dịch vụ  */}

      <Drawer
        title={`Thêm dịch vụ cho`}
        visible={drawerVisible}
        onClose={closeDrawer}
        width={800}
        extra={
            <Button
              type="primary"
              onClick={() => {
                handleCheckInService()
                closeDrawer()
              }}
            >
              Xác nhận
            </Button>
          }
      >
        {' '}
        <Table
          columns={columnsService()}
          dataSource={listServiceTour}
          rowKey="service_id"
          pagination={false}
        />
      </Drawer>
    </>
  )
}

export default BookingActiveModal
