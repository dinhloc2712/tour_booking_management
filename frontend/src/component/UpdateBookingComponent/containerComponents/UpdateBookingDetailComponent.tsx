import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Table,
  message,
  notification,
  Checkbox,
  Typography,
  Upload,
} from 'antd'
import { IoIosAddCircleOutline } from 'react-icons/io'
import { CiCircleMinus } from 'react-icons/ci'
import { FaRegTrashCan } from 'react-icons/fa6'
import { checkPassport } from 'redux/API/POST/CheckPassport'
import { clearPassportData } from 'redux/Reducer/PassportReducer'
import { RootState, useAppDispatch } from 'redux/store'
import { getSourceAgent } from 'redux/API/GET/GetSourceAgent'
import { GetSourceService } from 'redux/API/GET/GetSourceService'
import { getService } from 'redux/API/GET/getService/GetService'
import { getServiceTour } from 'redux/API/GET/getService/GetServiceTour'
import { getTour } from 'redux/API/GET/GetTour'
import { checkVoucherTour } from 'redux/API/POST/CheckVocherTour'
import { clearCheckedVoucherTourResult } from 'redux/Reducer/VoucherReducer'
import { useSelector, useDispatch } from 'react-redux'
import { AddBooking } from 'redux/API/POST/Booking'
import { updateBooking } from 'redux/API/PUT/BookingUpdate'
import { getAllUserCheckin } from 'redux/API/GET/getBooking/GetAllUserCheckin'
import { getOneBooking } from 'redux/API/GET/getBooking/getOneBooking'
import {
  setCurrentBooking,
  setCheckInStatus,
  updateBookingField,
  clearCurrentBooking,
  addTour,
  addServiceToTour,
  updateTourFields,
  updateServiceField,
  removeServiceFromTour,
  removeTour,
  Tour,
  SelectedService,
  Booking,
  addCustomer,
  updateCustomer,
  removeCustomer,
  importCustomers,
  Customers,
} from 'redux/Reducer/Booking'
import { clearBookingTourState } from 'redux/Reducer/BookingTourReducer'
import { clearCurrentCheckIn } from 'redux/Reducer/CheckinReducer'
import { clearAllUserCheckin } from 'redux/Reducer/BookingUserdetailReducer'
// import UpdateBookingUserComponent from './UpdateBookingUserComponents'
import UpdateBookingUserDetailComponent from './UpdateBookingUserDetailComponent'
import { LuImport } from 'react-icons/lu'
import CustomerModal from 'modal/customerBooking/CustomerModal'
import { showModal, hideModal } from 'redux/Redux/modal/modalSlice'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'
import emailjs from 'emailjs-com'

import { useFetchers, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import moment from 'moment'
import { now } from 'moment'
import { useTranslation } from 'react-i18next'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

const UpdateBookingDetailComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const bookingTour = useSelector(
    (state: RootState) => state.BookingTourReducer.bookingTourDetail
  )
  const { t } = useTranslation('form');

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id ? String(user.id) : 'No user logged in'
  const branchId = user.branch_id ? user.branch_id : null

  // console.log('userId: ', userId)

  const {
    currentPassport,
    currentUserDetails,
    loading: passportLoading,
    error: passportError,
  } = useSelector((state: RootState) => state.passport || {})

  const sourceAgent = useSelector(
    (state: RootState) => state.sourceAgent.sourceList
  )

  const sourceService = useSelector(
    (state: RootState) => state.source.sourceList
  )

  const serviceTourList = useSelector(
    (state: RootState) => state.service.serviceTourList
  )

  const tourList = useSelector((state: RootState) => state.tour.tourList)

  const {
    checkedVoucherTourResult,
    loading: voucherLoading,
    error: voucherError,
  } = useSelector((state: RootState) => state.voucher)

  const currentBooking = useSelector(
    (state: RootState) => state.booking.currentBooking
  )

  const bookingId = useSelector(
    (state: RootState) => state.booking.currentBooking?.booking_id
  )

  const checkInStatus = useSelector(
    (state: RootState) => state.booking.checkInStatus
  )

  const checkedInUsers = useSelector(
    (state: RootState) => state.checkinAllUser.users
  )

  const customers = useSelector(
    (state: any) => state.booking.currentBooking?.customers || []
  )

  const handleFileUpload = (file: any) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const binaryStr = event.target?.result
      if (binaryStr) {
        const wb = XLSX.read(binaryStr, { type: 'binary' })
        const sheetName = wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        console.log('ws', ws)
        // Chuyển đổi dữ liệu thành mảng khách hàng
        const data: Customers[] = XLSX.utils.sheet_to_json(ws)
        console.log('data', data)
        // Dispatch action để lưu vào Redux state
        dispatch(importCustomers(data))
        message.success('File uploaded successfully')
      }
    }
    reader.readAsBinaryString(file)
    return false // Ngừng hành động upload mặc định
  }

  // Hàm xử lý thêm tour mới
  const handleAddTour = () => {
    const newTour: Tour = {
      tour_id: 0,
      tour_name: '',
      tour_start_time: '',
      tour_end_time: '',
      tour_quantity_customers: 1,
      tour_price: 0,
      voucher_id: 0,
      voucher_code: '',
      voucher_value: 0,
      tour_status: 'waiting_checkin',
      tour_price_min: 0,
      tour_price_max: 0,
      total_tour_price: 0,
      services: [],
      note: '',
    }
    dispatch(addTour(newTour))
  }

  // Hàm xử lý xóa tour
  const handleRemoveTour = (tourIndex: number) => {
    dispatch(removeTour(tourIndex))
  }

  // Hàm cập nhật thông tin tour
  const handleTourChange = (tourIndex: any, field: keyof Tour, value: any) => {
    // Cập nhật giá trị của tour ngay lập tức
    dispatch(updateTourFields({ tourIndex, fields: { [field]: value } }))

    if (field === 'tour_id') {
      const userId = currentPassport?.id
      const tourData = {
        tourId: value,
        userId: userId || undefined, // Gửi userId nếu có
      }
      console.log('tourData', tourData)
      dispatch(getServiceTour(tourData))
    }

    // Kiểm tra nếu tên tour được chọn, cập nhật giá trị của tour_price_max và tour_price_min từ dữ liệu tour
    if (field === 'tour_name') {
      const selectedTourData = tourList.find((tour) => tour.name === value)
      if (selectedTourData) {
        // Cập nhật giá trị của tour_price_max và tour_price_min
        dispatch(
          updateTourFields({
            tourIndex,
            fields: {
              tour_price_max: selectedTourData.price_max,
              tour_price_min: selectedTourData.price_min,
            },
          })
        )
      }
    }
    // Gọi hàm tính toán giá ngay lập tức
    calculateFinalTourPrice(tourIndex)
  }

  const calculateFinalTourPrice = (tourIndex: number) => {
    const selectedTour = currentBooking?.tours[tourIndex]
    if (!selectedTour) {
      console.error(`Tour at index ${tourIndex} is undefined`)
      return
    }

    const quantityCustomers = selectedTour.tour_quantity_customers || 1
    const priceMax = parseFloat(selectedTour.tour_price_max)
    const priceMin = parseFloat(selectedTour.tour_price_min)

    if (isNaN(priceMax) || isNaN(priceMin)) {
      console.error('Tour priceMax or priceMin is undefined or not a number')
      return
    }

    let totalPrice = priceMax * quantityCustomers

    // Chỉ áp dụng mã giảm giá nếu mã giảm giá của tour hiện tại trùng với mã được trả về
    if (
      checkedVoucherTourResult &&
      selectedTour.voucher_code === checkedVoucherTourResult.code
    ) {
      const voucherType = checkedVoucherTourResult.type
      const voucherValue = parseFloat(checkedVoucherTourResult.value)

      if (voucherType === 'money') {
        totalPrice -= voucherValue
      } else if (voucherType === 'percent') {
        const discount = (voucherValue / 100) * totalPrice
        totalPrice -= discount
      }
      dispatch(
        updateTourFields({
          tourIndex,
          fields: {
            voucher_id: checkedVoucherTourResult.id,
          },
        })
      )
      dispatch(
        updateTourFields({
          tourIndex,
          fields: {
            voucher_value: voucherValue,
          },
        })
      )
    } else {
      dispatch(
        updateTourFields({
          tourIndex,
          fields: {
            voucher_id: '',
          },
        })
      )
      dispatch(
        updateTourFields({
          tourIndex,
          fields: { voucher_value: 0 },
        })
      )
    }

    const minTotalPrice = priceMin * quantityCustomers
    if (totalPrice < minTotalPrice) {
      totalPrice = minTotalPrice
    }

    const tourPricePerPerson = totalPrice / quantityCustomers

    dispatch(
      updateTourFields({
        tourIndex,
        fields: {
          total_tour_price: totalPrice,
          tour_price: tourPricePerPerson,
        },
      })
    )
  }

  // Cập nhật field bất kỳ trong booking
  const handleInputChange = <K extends keyof Booking>(
    field: K,
    value: Booking[K]
  ) => {
    dispatch(updateBookingField({ field, value }))
  }

  const handleCheckboxChange = (
    checked: boolean,
    record: any,
    tourIndex: number
  ) => {
    // Tạo đối tượng dịch vụ cần thêm vào
    const service: SelectedService = {
      id: record.id || null,
      service_id: record.service_id,
      service_name: record.service_name,
      service_quantity: 1,
      service_unit: 1,
      service_price: record.service_price,
      total_service_price: record.service_price,
      service_status: record.service_status || null, // Trạng thái chọn
      time_service_start: record.time_service_start,
      time_service_end: record.time_service_end,
      service_quantity_customer: 1, // Giá trị mặc định, có thể thay đổi sau
      source_service: record.source_service || null, // Nguồn dịch vụ
    }

    if (checked) {
      // Nếu checkbox được chọn, gọi action để thêm dịch vụ vào mảng services
      dispatch(addServiceToTour({ tourIndex, service })) // Thêm dịch vụ
    } else {
      // Nếu checkbox bị bỏ chọn, gọi action để loại bỏ dịch vụ khỏi mảng services
      dispatch(
        removeServiceFromTour({ tourIndex, serviceId: record.service_id })
      ) // Xóa dịch vụ
    }
  }

  const handleServiceChange = (
    value: any,
    field: keyof SelectedService,
    tourIndex: number,
    serviceIndex: number
  ) => {
    console.log('value', field, value, tourIndex, serviceIndex)

    const selectedTour = currentBooking?.tours[tourIndex]
    const selectedService = selectedTour?.services[serviceIndex]

    if (selectedService) {
      // Cập nhật các trường của dịch vụ
      const updatedFields: Partial<SelectedService> = { [field]: value }

      // Tính toán tổng giá dịch vụ sau khi cập nhật giá trị
      if (
        field === 'service_quantity' ||
        field === 'service_unit' ||
        field === 'service_price'
      ) {
        const serviceQuantity = parseFloat(
          updatedFields.service_quantity ||
          selectedService.service_quantity ||
          '1'
        )
        const serviceUnit = parseFloat(
          updatedFields.service_unit || selectedService.service_unit || '1'
        )
        const servicePrice = parseFloat(
          updatedFields.service_price || selectedService.service_price || '0'
        )

        // Tính tổng giá dịch vụ
        const totalServicePrice = serviceQuantity * serviceUnit * servicePrice
        updatedFields.total_service_price = totalServicePrice
      }

      console.log('updatedFields', updatedFields)

      // Dispatch cập nhật trường sau khi tính toán tổng giá
      dispatch(
        updateServiceField({
          tourIndex,
          serviceIndex,
          fields: updatedFields,
        })
      )
    }
  }

  const handlePassportBlur = () => {
    if (currentBooking && currentBooking.passport.trim()) {
      dispatch(checkPassport(currentBooking.passport))
    }
  }

  const handlePassportKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePassportBlur()
    }
  }

  const handleCheckVoucher = (tourIndex: number) => {
    const voucherCode = currentBooking?.tours[tourIndex].voucher_code
    const tour_id = currentBooking?.tours[tourIndex].tour_id

    if (!tour_id) {
      alert('Vui lòng chọn tour trước khi nhập mã voucher!')
      return
    }
    if (!userId) {
      alert('Không tìm thấy thông tin nhân viên, vui lòng đăng nhập lại!')
      return
    }

    message.loading('Đang kiểm tra voucher...')

    dispatch(
      checkVoucherTour({ voucher: voucherCode, tour_id, user_id: userId })
    )
  }

  const handleVoucherKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tourIndex: number
  ) => {
    if (e.key === 'Enter') {
      handleCheckVoucher(tourIndex) // Kiểm tra mã voucher khi nhấn Enter
    }
  }

  const [searchText, setSearchText] = useState<string>('') // Quản lý trạng thái tìm kiếm

  const sortServiceList = (
    serviceTourList: SelectedService[],
    currentBooking: Booking | null
  ) => {
    if (!currentBooking) return [...serviceTourList] // trả về bản sao mảng nếu currentBooking là null

    // Tạo một bản sao của serviceTourList trước khi sắp xếp
    const sortedList = [...serviceTourList]

    sortedList.sort((a, b) => {
      const isServiceASelected = currentBooking.tours.some((tour) =>
        tour.services.some((service) => service.service_id === a.service_id)
      )
      const isServiceBSelected = currentBooking.tours.some((tour) =>
        tour.services.some((service) => service.service_id === b.service_id)
      )

      // Đưa dịch vụ đã chọn lên đầu
      if (isServiceASelected && !isServiceBSelected) return -1
      if (!isServiceASelected && isServiceBSelected) return 1
      return 0
    })

    return sortedList
  }

  const sortedServiceTourList = sortServiceList(serviceTourList, currentBooking)

  const columns = (tourIndex: number) => [
    {
      title: '',
      dataIndex: 'service_id',
      key: 'service_id',
      width: '5%',
      render: (_, record) => {
        const selectedTour = currentBooking?.tours[tourIndex]
        const isServiceSelected = selectedTour?.services?.some(
          (service: SelectedService) => service.service_id === record.service_id
        )

        return (
          <Checkbox
            checked={isServiceSelected || false} // Nếu có dịch vụ trong mảng thì checkbox được chọn
            onChange={(e) =>
              handleCheckboxChange(e.target.checked, record, tourIndex)
            }
          />
        )
      },
    },
    {
      title: t('form.Servicer'),
      dataIndex: 'service_name',
      key: 'service_name',
      width: '30%',
      render: (text: any, record: any) => <Text>{record.service_name}</Text>,
    },
    {
      title: t('form.quantities'),
      dataIndex: 'service_quantity',
      key: 'service_quantity',
      width: '12%',
      render: (text: any, record: any, serviceIndex: number) => {
        const selectedTour = currentBooking?.tours[tourIndex]
        const isServiceSelected = selectedTour?.services?.some(
          (service: SelectedService) => service.service_id === record.service_id
        )
        const selectedService = selectedTour?.services?.find(
          (service: SelectedService) => service.service_id === record.service_id
        )
        const updatedQuantity =
          selectedService?.service_quantity || record.service_quantity

        return (
          <Input
            type="number"
            value={updatedQuantity || 1}
            min={1}
            onChange={(e) => {
              if (isServiceSelected) {
                handleServiceChange(
                  e.target.value,
                  'service_quantity',
                  tourIndex,
                  serviceIndex
                )
              }
            }}
            disabled={!isServiceSelected} // Chỉ cho phép thay đổi khi dịch vụ được chọn
          />
        )
      },
    },
    {
      title: t('form.Unit'),
      dataIndex: 'service_unit',
      key: 'service_unit',
      width: '12%',
      render: (text: any, record: any, serviceIndex: number) => {
        const selectedTour = currentBooking?.tours[tourIndex]
        const isServiceSelected = selectedTour?.services?.some(
          (service: SelectedService) => service.service_id === record.service_id
        )

        const selectedService = selectedTour?.services?.find(
          (service: SelectedService) => service.service_id === record.service_id
        )
        const updatedUnit = selectedService?.service_unit || record.service_unit

        const isBusService = record.service_type === 'bus'

        return (
          <Input
            type="number"
            value={isBusService ? 1 : updatedUnit || 1}
            min={1}
            onChange={(e) => {
              if (isServiceSelected && !isBusService) {
                handleServiceChange(
                  e.target.value,
                  'service_unit',
                  tourIndex,
                  serviceIndex
                )
              }
            }}
            disabled={!isServiceSelected || isBusService} // Chỉ cho phép thay đổi khi dịch vụ được chọn
          />
        )
      },
    },
    {
      title: t('form.Total Price'),
      dataIndex: 'total_service_price',
      key: 'total_service_price',
      width: '30%',
      render: (text: any, record: any) => {
        // Lấy dịch vụ từ currentBooking
        const selectedTour = currentBooking?.tours[tourIndex]
        const selectedService = selectedTour?.services?.find(
          (service: SelectedService) => service.service_id === record.service_id
        )

        // Lấy giá trị tổng giá từ currentBooking hoặc dùng giá trị từ record nếu không có trong currentBooking
        const totalPrice =
          selectedService?.total_service_price || record.total_service_price

        // Làm tròn và định dạng lại giá trị sau khi tính toán
        const formattedPrice = totalPrice
          ? Math.round(totalPrice).toLocaleString().replace(/,/g, '.')
          : null

        // Làm tròn giá gốc để hiển thị, ví dụ: 1000000 -> 1,000,000
        const formattedServicePrice = Math.round(record.service_price)
          .toLocaleString()
          .replace(/,/g, '.')

        return (
          <div>
            {/* Hiển thị giá đã được tính toán (updated price) */}
            <Text style={{ fontSize: '16px', marginLeft: '8px' }}>
              {formattedPrice || formattedServicePrice} VND
            </Text>
          </div>
        )
      },
    },
    // {
    //   title: 'Hành động',
    //   key: 'action',
    //   render: (text: any, record: any, serviceIndex: number) => (
    //     <div style={{ display: 'flex', gap: '5px' }}>
    //       <Button> Cập nhật </Button>
    //     </div>
    //   ),
    // },
  ]

  const [apiDataFetched, setApiDataFetched] = useState(false) // Biến cờ để theo dõi dữ liệu từ API

  const calculateTotalAmount = () => {
    let totalAmount = 0

    if (currentBooking?.tours) {
      // Tính tổng giá cho từng tour và dịch vụ trong tour
      currentBooking.tours.forEach((tour) => {

        console.log('tour', tour)
        // Tổng giá của tour
        totalAmount += parseFloat(tour.total_tour_price) || 0

        // Tổng giá các dịch vụ trong tour
        tour.services.forEach((service) => {
          totalAmount += parseFloat(service.total_service_price) || 0
        })
      })
    }

    return totalAmount
  }

  console.log('currentBooking', currentBooking)
  ///// comlumns customer \\\\\\

  const modals = useSelector((state: any) => state.modal.modals) // Quản lý modal từ Redux

  // State quản lý chỉ số khách hàng khi chỉnh sửa
  const [editingCustomerIndex, setEditingCustomerIndex] = useState<
    number | null
  >(null)
  const [initialValues, setInitialValues] = useState<Customers>({
    id: null,
    Fullname: '',
    Passport: '',
    Birthday: null,
    Phone: '',
    Email: '',
    Address: '',
  })

  useEffect(() => {
    if (!modals['addEditCustomerModal']) {
      setEditingCustomerIndex(null) // Reset trạng thái khi modal đóng
      setInitialValues({
        id: null,
        Fullname: '',
        Passport: '',
        Birthday: '',
        Phone: '',
        Email: '',
        Address: '',
      }) // Reset form
    }
  }, [modals])

  // Mở modal để thêm khách hàng
  const handleAddCustomer = () => {
    setEditingCustomerIndex(null)
    setInitialValues({
      id: null,
      Fullname: '',
      Passport: '',
      Birthday: '',
      Phone: '',
      Email: '',
      Address: '',
    }) // Reset form
    dispatch(showModal('addEditCustomerModal'))
  }

  // Mở modal để chỉnh sửa khách hàng
  const handleEditCustomer = (record: Customers, index: number) => {
    console.log('record', record)
    setEditingCustomerIndex(index)
    setInitialValues(record) // Cập nhật giá trị ban đầu khi chỉnh sửa
    dispatch(showModal('addEditCustomerModal'))
  }

  // Đóng modal
  const handleCancel = () => {
    dispatch(hideModal('addEditCustomerModal'))
  }

  // Thêm hoặc sửa khách hàng
  const handleSaveCustomer = (values: Customers) => {
    if (editingCustomerIndex !== null) {
      dispatch(
        updateCustomer({ customerIndex: editingCustomerIndex, fields: values })
      )
    } else {
      dispatch(addCustomer(values))
    }
    dispatch(hideModal('addEditCustomerModal')) // Đóng modal sau khi lưu
    message.success('Customer saved successfully!')
  }

  // Xóa khách hàng
  const handleRemoveCustomer = (index: number) => {
    dispatch(removeCustomer(index))
    message.success('Customer removed successfully!')
  }

  console.log('customers', customers)

  const customerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: any, record: any, index: number) => index + 1,
    },
    {
      title: t('form.fullname'),
      dataIndex: 'Fullname',
      key: 'fullname',
    },
    {
      title: t('form.Passport'),
      dataIndex: 'Passport',
      key: 'passport',
    },
    // {
    //   title:'Ngày Sinh',
    //   dataIndex: 'Birthday',
    //   key: 'birthday',
    // },
    {
      title: t('form.phone'),
      dataIndex: 'Phone',
      key: 'phone',
    },
    {
      title: t('form.address'),
      dataIndex: 'Address',
      key: 'address',
    },
    {
      title: t('form.Email'),
      dataIndex: 'Email',
      key: 'email',
    },
    {
      title: t('form.Actions'),
      key: 'actions',
      render: (_: any, record: Customers, index: number) => (
        <span>
          <Button
            onClick={() => handleEditCustomer(record, index)}
            type="link"
            icon={<EditOutlined />}
            style={{
              color: '#1890ff',
              transition: 'all 0.3s ease',
            }}
          >
            {t('form.Edit')}
          </Button>
          <Button
            onClick={() => handleRemoveCustomer(index)}
            type="link"
            danger
            icon={<DeleteOutlined />}
            style={{
              color: '#ff4d4f',
              transition: 'all 0.3s ease',
            }}
          >
            {t('form.Delete')}
          </Button>
        </span>
      ),
    },
  ]

  useEffect(() => {
    const totalAmount = calculateTotalAmount()
    dispatch(updateBookingField({ field: 'total_amount', value: totalAmount }))
  }, [currentBooking, dispatch])

  useEffect(() => {
    if (currentPassport && currentUserDetails && !apiDataFetched) {
      // Chỉ cập nhật booking nếu thông tin từ API chưa được đổ ra form
      const updatedBooking: Booking = {
        ...currentBooking,
        fullname: currentPassport.fullname || currentBooking?.fullname,
        address: currentUserDetails.address || currentBooking?.address,
        phone: currentUserDetails.phone || currentBooking?.phone || '',
        passport: currentUserDetails.passport || currentBooking?.passport,
        booking_id: currentBooking?.booking_id || '',
        checkin_time: currentBooking?.checkin_time || '',
        quantity_customer: currentBooking?.quantity_customer || 1,
        deposit: currentBooking?.deposit || 0,
        status_payment: currentBooking?.status_payment || 'unpaid',
        status_touring: currentBooking?.status_touring || 'waiting',
        source_id: currentBooking?.source_id || '',
        note: currentBooking?.note || '',
        customers: currentBooking?.customers || [],
        tours: currentBooking?.tours || [],
        total_amount: currentBooking?.total_amount || 0,
      }

      // Cập nhật currentBooking khi có sự khác biệt và dữ liệu từ API chưa được đổ ra form
      if (JSON.stringify(updatedBooking) !== JSON.stringify(currentBooking)) {
        dispatch(setCurrentBooking(updatedBooking))
        setApiDataFetched(true) // Đánh dấu là dữ liệu đã được đổ ra form
      }
    }

    // Tính toán giá cho các tour sau khi cập nhật thông tin booking
    if (currentBooking?.tours && currentBooking.tours.length > 0) {
      currentBooking.tours.forEach((_, tourIndex) => {
        calculateFinalTourPrice(tourIndex)
      })
    }

    // Kiểm tra trước khi gọi API
  }, [
    currentPassport,
    currentUserDetails,
    checkedVoucherTourResult,
    currentBooking,
    dispatch,
  ])

  useEffect(() => {
    // Kiểm tra và gọi API chỉ khi cần thiết
    if (sourceAgent.length === 0) {
      dispatch(getSourceAgent())
    }
    if (tourList.length === 0) {
      dispatch(getTour())
    }
    dispatch(GetSourceService())
  }, [])

  //////// Gọi bookingid từ phần state của booking \\\\\\\
  useEffect(() => {
    if (bookingId) {
      dispatch(getAllUserCheckin(bookingId))
    }
  }, [dispatch, bookingId])

  ////// Gọi bookingid từ phần bookingactive \\\\\\\
  useEffect(() => {
    const bookingId = bookingTour?.bookingTour.booking_id
    if (bookingId) {
      dispatch(getOneBooking(bookingId))
      dispatch(getAllUserCheckin(bookingId))
    }
  }, [dispatch, bookingId])

  const showCheckInErrorNotification = () => {
    if (
      currentBooking &&
      checkedInUsers.length >= currentBooking.quantity_customer
    ) {
      notification.error({
        message: 'Lỗi',
        description: 'Số lượng người check-in đã đạt giới hạn cho phép.',
        placement: 'topRight',
        duration: 3,
      })
    }
  }

  const [hasSubmitted, setHasSubmitted] = useState(false) // Trạng thái theo dõi hành động người dùng

  const timeServiceStart = currentBooking?.tours[0]?.tour_start_time
  const timeServiceEnd = currentBooking?.tours[0]?.tour_end_time

  const handleSubmit = async (isCheckIn: any) => {
    if (currentBooking) {
      const dataToSend = {
        users: {
          full_name: currentBooking.fullname,
        },
        user_details: {
          passport: currentBooking.passport,
          address: currentBooking.address,
          phone: currentBooking.phone,
          birthday: null,
        },
        bookings: {
          total_amount: currentBooking.total_amount,
          staff_id: userId,
          branch_id: branchId,
          quantity_customer: currentBooking.quantity_customer,
          checkin_time: currentBooking.checkin_time,
          deposit: currentBooking.deposit,
          note: currentBooking.note,
          sale_agent_id: currentBooking.source_id,
          customers: currentBooking.customers.map((customer) => ({
            id: customer.id,
            full_name: customer.Fullname,
            passport: customer.Passport,
            phone: customer.Phone,
            email: customer.Email,
            address: customer.Address,
            birthday: customer.Birthday,
          })),
          booking_tour: currentBooking.tours.map((tour) => ({
            id: tour.id,
            tour_id: tour.tour_id,
            name_tour: tour.tour_name,
            start_time: tour.tour_start_time,
            end_time: tour.tour_end_time,
            quantity_customer: tour.tour_quantity_customers,
            voucher_id: tour.voucher_id || null,
            voucher_value: tour.voucher_value || null, //xóa voucher_value: tour.voucher_value null,
            voucher_code: tour.voucher_code || null,
            price: tour.tour_price_max,
            note: tour.note || '',
            booking_services_by_tour: tour.services.map((service) => ({
              id: service.id,
              service_id: service.service_id,
              quantity: service.service_quantity,
              quantity_customer: service.service_quantity_customer,
              unit: service.service_unit,
              price: service.service_price,
              sale_agent_id: service.source_service,
              start_time: service.time_service_start || timeServiceStart,
              end_time: service.time_service_end || timeServiceEnd,
            })),
          })),
        },
      }

      console.log('dataToSend', dataToSend)
      let resultAction
      if (bookingId) {
        // Gọi API cập nhật nếu booking_id tồn tại
        resultAction = await dispatch(updateBooking({ dataToSend, bookingId }))
        // console.log('resultAction updatttaaee', resultAction)
      } else {
        // Gọi API tạo mới nếu không có booking_id
        resultAction = await dispatch(AddBooking({ dataToSend }))
      }

      if (resultAction.meta.requestStatus === 'fulfilled') {
        // console.log('resultAction.payload', resultAction.payload)
        const newBookingId = resultAction.payload
        dispatch(
          updateBookingField({ field: 'booking_id', value: newBookingId })
        )
        if (isCheckIn) {
          const bookingResult = await dispatch(
            getOneBooking(newBookingId)
          ).unwrap()
          dispatch(setCheckInStatus(true))
        } else {
          navigate('/home')
          dispatch(clearBookingTourState())
          dispatch(clearCurrentBooking())
          dispatch(clearCurrentCheckIn())
          dispatch(clearAllUserCheckin())
          dispatch(setCheckInStatus(false))
        }
        try {
          // Gửi email cho tất cả khách hàng trong booking
          for (const customer of currentBooking.customers) {
            await sendEmailWithQRCode(customer)
          }
          message.success('Email đã được gửi thành công cho khách hàng!')
        } catch (error) {
          console.error('Gửi email thất bại:', error)
          message.error('Gửi email thất bại.')
        }
        setHasSubmitted(true)
      } else {
        console.error('Failed to add booking:', resultAction.payload)
        message.error('Thao tác không thành công. Vui lòng thử lại.')
      }
    }
  }

  const generateQRCode = async (passport) => {
    try {
      // Chuyển đổi passport thành mã QR và trả về Base64
      return await QRCode.toDataURL(passport)
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const handleUploadQRCode = async (qrCodeBase64: string) => {
    const cloudName = 'datd0sl75'
    const uploadPreset = 'upload'
    const apiKey = '975853734376446'

    // Chuyển đổi base64 thành File
    const response = await fetch(qrCodeBase64)
    const blob = await response.blob()
    const file = new File([blob], 'qrcode.png', { type: 'image/png' })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']

    if (!allowedTypes.includes(file.type)) {
      message.error(
        'Bạn chỉ có thể tải lên các tệp hình ảnh (jpeg, png, jpg, gif)!'
      )
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('api_key', apiKey)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      if (response.ok) {
        const imageUrl = data.secure_url
        const resizedUrl = imageUrl.replace('/upload/', '/upload/w_500,h_500/')
        console.log('Resized Image URL:', resizedUrl)
        return resizedUrl
        // console.log('Image URL from Cloudinary:', imageUrl)
        // Bạn có thể cập nhật vào state hoặc gửi URL trong email
        // return imageUrl
      } else {
        message.error(`Tải lên không thành công: ${data.error.message}`)
      }
    } catch (error) {
      message.error('Tải lên hình ảnh thất bại')
      console.error('Upload error:', error)
    }
  }

  const sendEmailWithQRCode = async (customer) => {
    const qrCodeDataUrl = await generateQRCode(customer.Passport)
    console.log('qrCodeDataUrl', qrCodeDataUrl)

    if (!qrCodeDataUrl) {
      message.error(`Không thể tạo mã QR cho khách hàng ${customer.Fullname}`)
      return
    }

    // Tải ảnh lên Cloudinary và lấy URL
    const qrCodeUrl = await handleUploadQRCode(qrCodeDataUrl)

    console.log('qrCodeUrl', qrCodeUrl)

    if (!qrCodeUrl) {
      message.error(
        `Không thể tải ảnh QR lên Cloudinary cho khách hàng ${customer.Fullname}`
      )
      return
    }

    console.log('Sending email to', customer.Email)

    const templateParams = {
      to_email: customer.Email,
      subject: 'Your QR Code for Check-in',
      message: `Dear ${customer.Fullname}, please find your QR code below:`,
      qr_code: qrCodeUrl, // URL ảnh trên Cloudinary
    }

    try {
      // Gửi email qua EmailJS
      await emailjs.send(
        'service_ljwd48q',
        'template_eehrnas',
        templateParams,
        '_89s9QCDPKaKw6XoT'
      )
      message.success(`Email sent successfully to ${customer.Email}`)
    } catch (error) {
      console.error('Failed to send email', error)
      message.error(`Failed to send email to ${customer.Email}`)
    }
  }

  // Hàm xử lý gửi email cho tất cả khách hàng
  const handleSendEmails = async () => {
    console.log('Sending emails to all customers...')
    for (const customer of currentBooking?.customers || []) {
      await sendEmailWithQRCode(customer)
    }
    console.log('All emails sent successfully!')
  }

  return (
    <>
      <div className="FormBooking" onSubmit={handleSubmit}>
        <Form layout="horizontal">
          <div className="FormBooking-detail">
            <div className="top-checkin">
              <div className="top-checkin-left">
                <h3 style={{ marginBottom: '25px' }}>{t('form.Khách hàng Booking')}</h3>
                <hr />
                <div className="Booker-Information">
                  <Form.Item
                    label={t('form.Số hộ chiếu')}
                    required
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Input
                      value={currentBooking?.passport}
                      onChange={(e) =>
                        handleInputChange('passport', e.target.value)
                      }
                      onBlur={handlePassportBlur}
                      onKeyDown={handlePassportKeyPress}
                      required
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.fullname')}
                    required
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Input
                      value={currentBooking?.fullname}
                      onChange={(e) =>
                        handleInputChange('fullname', e.target.value)
                      }
                      disabled={!!currentPassport?.fullname}
                      required
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.address')}
                    required
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Input
                      value={currentBooking?.address}
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      disabled={!!currentUserDetails?.address}
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.phone')}
                    required
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Input
                      value={currentBooking?.phone || ''}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      required
                    />
                  </Form.Item>
                </div>
                <div>
                  {passportLoading ? (
                    <p className="loading-text" style={{ color: 'blue' }}>
                      {t('form.passportLoading')}
                    </p>
                  ) : passportError ? (
                    <p className="error-text" style={{ color: 'red' }}>
                      {passportError}
                    </p>
                  ) : currentPassport ? (
                    <p className="success-text" style={{ color: 'green' }}>
                      {t('form.passportSuccess')}
                    </p>
                  ) : null}
                </div>
              </div>
              <hr />
              <div className="top-checkin-right">
                <h3 style={{ marginBottom: '25px' }}>{t('form.bookingInformation')}</h3>
                <hr />
                <div className="Booking-Information">
                  <Form.Item
                    label={t('form.checkinDate')}
                    required
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      showTime
                      value={
                        currentBooking?.checkin_time
                          ? moment(currentBooking.checkin_time)
                          : undefined
                      }
                      onChange={(date) => {
                        dispatch(
                          updateBookingField({
                            field: 'checkin_time',
                            value: date
                              ? dayjs(date.toDate()).format(
                                'YYYY-MM-DD HH:mm:ss'
                              )
                              : '',
                          })
                        )
                      }}
                      disabledDate={(current) =>
                        current && current < moment().startOf('day')
                      }
                      placeholder={t('form.selectCheckinDate')}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t('form.numberOfGuests')}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Input
                      type="number"
                      min={1}
                      value={currentBooking?.quantity_customer}
                      onChange={(e) => {
                        dispatch(
                          updateBookingField({
                            field: 'quantity_customer',
                            value: parseInt(e.target.value, 10) || 1,
                          })
                        )
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('form.depositAmount')}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Input
                      type="number"
                      value={currentBooking?.deposit}
                      onChange={(e) => {
                        dispatch(
                          updateBookingField({
                            field: 'deposit',
                            value: parseFloat(e.target.value) || 0,
                          })
                        )
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t('form.customerSource')}
                    required
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <Select
                      placeholder="Chọn nguồn khách hàng"
                      value={currentBooking?.source_id}
                      onChange={(value) => {
                        dispatch(
                          updateBookingField({ field: 'source_id', value })
                        )
                      }}
                    >
                      {sourceAgent.map((agent) => (
                        <Option key={agent.id} value={agent.id}>
                          {agent.name} - {agent.type}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('form.notes')}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    <TextArea
                      value={currentBooking?.note}
                      onChange={(e) => {
                        dispatch(
                          updateBookingField({
                            field: 'note',
                            value: e.target.value,
                          })
                        )
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <hr />
              <div>
                <h2 className="totalAllBooking">
                  {t('form.totalAmount')}:{' '}
                  <span style={{ color: 'red' }}>
                    {Math.round(calculateTotalAmount())
                      .toLocaleString()
                      .replace(/,/g, '.')}{' '}
                    VND
                  </span>
                </h2>
              </div>
            </div>
            <div className="Bookingbytour-Information">
              <div className="FormBooking-Footter">
                <div className="button-update-booking">
                  <Button
                    size="large"
                    onClick={handleAddTour}
                    style={{ width: '100%' }}
                  >
                    <IoIosAddCircleOutline /> {t('form.add')}
                  </Button>
                </div>
                <div>
                  {checkInStatus ? (
                    <>
                      <div className="button-update-booking">
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleSubmit(true)}
                        >
                          {t('form.bookingUpdate')}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="button-update-booking">
                      {/* <Button
                        type="primary"
                        size="large"
                        onClick={() => handleSubmit(true)}
                      >
                        {t('form.bookingUpdate')}
                      </Button> */}
                      <Button
                        onClick={() => handleSubmit(false)}
                        style={{ backgroundColor: 'green', color: 'white' }}
                        size="large"
                      >
                        {t('form.savebooking')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {currentBooking?.tours.map((tour, tourIndex) => (
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  key={tourIndex}
                >
                  <div
                    className="Bookingbytour-Information-header"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h3>
                      Tour :{' '}
                      <span style={{ color: 'orangered' }}>
                        {tour.tour_name}
                      </span>
                    </h3>
                    <FaRegTrashCan
                      color="red"
                      onClick={() => handleRemoveTour(tourIndex)}
                      size={18}
                      style={{ marginRight: '20px', cursor: 'pointer' }}
                    />
                  </div>
                  <div className="Bookingbytour-Information-container">
                    <div className="BookingbytourName-Information">
                      <Form.Item
                        label={t('form.tourName')}
                        required
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ fontWeight: 'bold' }}
                      >
                        <Select
                          placeholder={t('form.tourName')}
                          value={tour.tour_name}
                          onChange={(value) => {
                            const selectedTour = tourList.find(
                              (tourOption) => tourOption.id === value
                            )
                            if (selectedTour) {
                              // Cập nhật tên và giá tour
                              handleTourChange(
                                tourIndex,
                                'tour_id',
                                selectedTour.id
                              )
                              handleTourChange(
                                tourIndex,
                                'tour_name',
                                selectedTour.name
                              )
                              handleTourChange(
                                tourIndex,
                                'tour_price_max',
                                selectedTour.price_max
                              )
                              handleTourChange(
                                tourIndex,
                                'tour_price_min',
                                selectedTour.price_min
                              )
                            }
                          }}
                        >
                          {tourList.map((tourOption) => (
                            <Option key={tourOption.id} value={tourOption.id}>
                              {tourOption.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={t('form.startDate1')}
                        required
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ fontWeight: 'bold' }}
                      >
                        <div className="time-booking-tour">
                          <DatePicker
                            style={{ width: '100%', marginBottom: '16px' }}
                            showTime
                            value={
                              tour.tour_start_time
                                ? dayjs(
                                  tour.tour_start_time,
                                  'YYYY-MM-DD HH:mm:ss'
                                )
                                : undefined
                            }
                            onChange={(date) => {
                              const checkinTime = dayjs(
                                currentBooking?.checkin_time
                              )

                              if (!checkinTime || !checkinTime.isValid()) {
                                notification.error({
                                  message: 'Lỗi',
                                  description:
                                    'Vui lòng chọn ngày checkin trước!',
                                  duration: 3,
                                })
                                return
                              }
                              if (
                                date &&
                                date.isBefore(checkinTime, 'minutes')
                              ) {
                                // Nếu thời gian bắt đầu nhỏ hơn thời gian checkin, cảnh báo
                                notification.error({
                                  message: 'Lỗi',
                                  description:
                                    'Thời gian bắt đầu phải lớn hơn thời gian checkin!',
                                  duration: 3,
                                })
                                return
                              }
                              handleTourChange(
                                tourIndex,
                                'tour_start_time',
                                date ? date.format('YYYY-MM-DD HH:mm:ss') : ''
                              )
                            }}
                            disabledDate={(current) =>
                              current && current < dayjs().startOf('day')
                            }
                            disabledTime={() => {
                              const now = dayjs()
                              const isToday = now.isSame(dayjs(), 'day')
                              return isToday
                                ? {
                                  disabledHours: () =>
                                    Array.from(
                                      { length: now.hour() },
                                      (_, i) => i
                                    ),
                                }
                                : {}
                            }}
                            placeholder={t('form.startDate')}
                          />
                          <DatePicker
                            style={{ width: '100%' }}
                            showTime
                            value={
                              tour.tour_end_time
                                ? dayjs(
                                  tour.tour_end_time,
                                  'YYYY-MM-DD HH:mm:ss'
                                )
                                : undefined
                            }
                            onChange={(date) => {
                              const startTime = dayjs(tour.tour_start_time)
                              if (!startTime || !dayjs(startTime).isValid()) {
                                notification.error({
                                  message: 'Lỗi',
                                  description:
                                    'Vui lòng nhập Thời gian bắt đầu trước khi chọn Thời gian kết thúc!',
                                  duration: 3,
                                })
                                return
                              }

                              if (date && date.isBefore(startTime, 'minute')) {
                                notification.error({
                                  message: 'Lỗi',
                                  description:
                                    'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!',
                                  duration: 3,
                                })
                                return
                              }
                              handleTourChange(
                                tourIndex,
                                'tour_end_time',
                                date ? date.format('YYYY-MM-DD HH:mm:ss') : ''
                              )
                            }}
                            disabledDate={(current) => {
                              const startTime = dayjs(tour.tour_start_time)
                              if (!startTime.isValid()) {
                                return (
                                  current &&
                                  current.isBefore(dayjs().startOf('day'))
                                )
                              }
                              return (
                                current && current.isBefore(startTime, 'day')
                              )
                            }}
                            disabledTime={() => {
                              const now = dayjs()
                              const isToday = now.isSame(dayjs(), 'day')
                              return isToday
                                ? {
                                  disabledHours: () =>
                                    Array.from(
                                      { length: now.hour() },
                                      (_, i) => i
                                    ), // Disable các giờ đã qua trong ngày hiện tại
                                }
                                : {}
                            }}
                            placeholder={t('form.endDate')}
                          />
                        </div>
                      </Form.Item>

                      <Form.Item
                        label={t('form.numberOfGuests')}
                        required
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ fontWeight: 'bold' }}
                      >
                        <Input
                          type="number"
                          min={1}
                          value={tour.tour_quantity_customers || 1}
                          onChange={(e) =>
                            handleTourChange(
                              tourIndex,
                              'tour_quantity_customers',
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={t('form.voucherCode')}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ fontWeight: 'bold' }}
                      >
                        <Input
                          type="text"
                          value={tour.voucher_code}
                          onChange={(e) =>
                            handleTourChange(
                              tourIndex,
                              'voucher_code',
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => handleVoucherKeyPress(e, tourIndex)}
                          onBlur={() => handleCheckVoucher(tourIndex)}
                          disabled={!tour.tour_id}
                        />
                      </Form.Item>
                      <Form.Item
                        label={t('form.note')}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ fontWeight: 'bold' }}
                      >
                        <TextArea
                          value={tour.note}
                          onChange={(e) =>
                            handleTourChange(tourIndex, 'note', e.target.value)
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={t('form.tourPrice')}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ fontWeight: 'bold' }}
                      >
                        <Text
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'red',
                          }}
                        >
                          {tour.total_tour_price
                            ? `${tour.total_tour_price.toLocaleString()} VND`
                            : '0 VND'}
                        </Text>
                      </Form.Item>
                    </div>
                    <div className="Servicebytour-Information">
                      <Table
                        columns={columns(tourIndex)}
                        dataSource={sortedServiceTourList}
                        pagination={{ pageSize: 15, position: ['bottomRight'] }}
                        size="small"
                        rowKey="service_id"
                        style={{
                          width: '100%',
                          height: '100%',
                          paddingLeft: '30px',
                        }}
                        className="table-with-sticky-header"
                      />
                    </div>
                  </div>
                  <hr
                    style={{
                      color: 'black', // Màu của đường kẻ
                      backgroundColor: 'black', // Màu nền của đường kẻ (nếu cần)
                      height: '1px', // Độ dày của đường kẻ
                      border: 'none', // Loại bỏ đường viền mặc định
                      margin: '20px 0', // Khoảng cách trên dưới (tùy chọn)
                    }}
                  />
                </Space>
              ))}
            </div>
          </div>
        </Form>
        <hr />
        <div className="customers-table">
          <div className="button-table-customer">
            <div>
              <Button type="primary" onClick={handleAddCustomer}>
                {t('form.addcustomer')}
              </Button>
            </div>
            <div>
              <Upload
                accept=".xlsx, .xls"
                showUploadList={false}
                customRequest={({ file }) => handleFileUpload(file)}
              >
                <Button icon={<LuImport />}>{t('form.import')}</Button>
              </Upload>
            </div>
            <div>
              <Button type="primary" onClick={handleSendEmails}>
                {t('form.Send Email')}
              </Button>
            </div>
          </div>
          <h3 style={{ color: 'green' }}>{t('form.Customer List')}</h3>
          <Table
            columns={customerColumns}
            dataSource={customers}
            rowKey="id"
            pagination={{ pageSize: 10 }} // Không phân trang nếu bạn không cần
          />
          <CustomerModal
            visible={modals['addEditCustomerModal'] || false}
            onCancel={handleCancel}
            onConfirm={handleSaveCustomer}
            editingCustomerIndex={editingCustomerIndex}
            initialValues={initialValues}
          />
        </div>
      </div>
      {/* {bookingId && checkedInUsers && <UpdateBookingUserDetailComponent />} */}
    </>
  )
}
export default UpdateBookingDetailComponent
