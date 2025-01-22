import React, { useState, useEffect } from 'react'
import {
  Button,
  Table,
  Form,
  Select,
  Card,
  Checkbox,
  InputNumber,
  message,
} from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, useAppDispatch } from 'redux/store'
import {
  addTour,
  removeService,
  updateService,
} from 'redux/Reducer/BookingUserdetailReducer'
import { getRefundServiceBill } from 'redux/API/POST/CreateRefundServicesBill'
import { showModal } from 'redux/Redux/modal/modalSlice'
import BillRefundService from 'modal/Bill/BillRefundService'
import BillAddService from 'modal/Bill/BillAddService'
import { getAllUserCheckin } from 'redux/API/GET/getBooking/GetAllUserCheckin'
import { checkInThunk } from 'redux/API/POST/CheckinThunk'
import { getAddServiceBill } from 'redux/API/POST/CreateBillAddService'
import { start } from 'repl'
import { noop } from 'antd/es/_util/warning'

const { Option } = Select

const UpdateBookingUserDetailComponent: React.FC = () => {
  const dispatch = useAppDispatch()

  const [availableServices, setAvailableServices] = useState([])

  // Sử dụng slice checkinUserAll thay vì checkin để tránh xung đột
  const checkedInUsers = useSelector(
    (state: RootState) => state.checkinAllUser.users
  )

  const currentBooking = useSelector(
    (state: RootState) => state.booking.currentBooking
  )

  console.log(currentBooking)

  console.log(checkedInUsers)

  const [isServiceFormVisible, setIsServiceFormVisible] = useState(false)
  const [serviceFormVisibility, setServiceFormVisibility] = useState<
    Record<number, boolean>
  >({})
  const [selectedServices, setSelectedServices] = useState<any[]>([])

  const handleToggleServiceForm = (userIndex: number) => {
    setServiceFormVisibility((prevState) => ({
      ...prevState,
      [userIndex]: !prevState[userIndex], // Toggle trạng thái form của người dùng cụ thể
    }))
  }

  const getRemainingServices = (tourIndex) => {
    // Lấy tour hiện tại từ checkedInUsers (userIndex không cần thiết nữa vì chúng ta xét tất cả người dùng)
    if (checkedInUsers.length === 0) return []
    const tour = checkedInUsers[0].tours[tourIndex]

    // Lấy tour tương ứng từ currentBooking để biết tổng số lượng dịch vụ có sẵn
    const bookingTour = currentBooking?.tours?.find(
      (tourItem) => tourItem.id === tour.id
    )

    if (!bookingTour) return [] // Nếu không tìm thấy tour trong booking, trả về mảng rỗng.

    const bookingServices = bookingTour?.services || [] // Lấy tất cả dịch vụ từ booking

    // Bước 1: Tính tổng số dịch vụ đã chọn của tất cả người dùng trong tour
    const totalUsedServices = checkedInUsers.reduce((acc, user) => {
      // Lọc những người dùng có tour này
      const userTour = user.tours.find((t) => t.id === tour.id)

      if (userTour) {
        // Nếu tour có trong user, cộng dồn số lượng dịch vụ đã chọn
        userTour.services.forEach((service) => {
          // Tăng số lượng dịch vụ đã chọn cho service_id tương ứng
          acc[service.service_id] =
            (acc[service.service_id] || 0) + service.quantity
        })
      }
      return acc
    }, {})

    // Bước 2: Tính số lượng dịch vụ còn lại
    const remainingServices = bookingServices
      .map((service) => {
        const usedServiceCount = totalUsedServices[service.service_id] || 0 // Lấy số dịch vụ đã chọn của tất cả người dùng
        const remainingQuantity = service.service_quantity - usedServiceCount // Tính số lượng còn lại

        return {
          ...service,
          remaining: remainingQuantity, // Thêm thuộc tính remaining để biết số lượng còn lại
        }
      })
      .filter((service) => service.remaining > 0) // Lọc ra chỉ các dịch vụ có số lượng còn lại > 0

    return remainingServices // Trả về các dịch vụ còn lại
  }
  console.log(getRemainingServices(0))

  const handleAddService = (tourIndex, userIndex, serviceId) => {
    // Tìm dịch vụ trong danh sách các dịch vụ còn lại
    const service = getRemainingServices(tourIndex).find(
      (service) => service.service_id === serviceId
    )

    // Kiểm tra nếu dịch vụ đã được chọn trước đó
    const existingService = selectedServices.find(
      (service) => service.service_id === serviceId
    )

    if (existingService) {
      // Nếu đã có, chỉ cần tăng số lượng lên
      setSelectedServices((prev) =>
        prev.map((service) =>
          service.service_id === serviceId
            ? { ...service, quantity: service.quantity + 1 }
            : service
        )
      )
    } else {
      // Nếu chưa chọn, thêm dịch vụ mới vào danh sách đã chọn
      setSelectedServices((prev) => [
        ...prev,
        {
          id: service?.id,
          service_id: service?.service_id,
          service_name: service?.service_name,
          quantity: 1,
          unit: service?.service_unit,
          price: service?.service_price,
          start_time: service?.time_service_start,
          end_time: service?.time_service_start,
          note: service?.service_note,
          remaining: service?.service_quantity,
        },
      ])
    }
  }

  const handleQuantityChange = (newQuantity, serviceId) => {
    setSelectedServices((prev) =>
      prev.map((service) =>
        service.service_id === serviceId
          ? {
              ...service,
              quantity: newQuantity,
              remaining: service.remaining - (newQuantity - service.quantity),
            }
          : service
      )
    )
  }

  const handleServiceCheckboxChange = (
    service: any,
    checked: boolean,
    userIndex: number,
    tourIndex: number
  ) => {
    if (checked) {
      // Thêm dịch vụ vào mảng đã chọn
      console.log('service', service)
      setSelectedServices((prev) => {
        const updatedServices = [...prev, { serviceId: service.id }]
        console.log('Updated selectedServices:', updatedServices)
        return updatedServices // Trả về mảng đã được cập nhật
      })
    } else {
      setSelectedServices((prev) =>
        prev.filter((service) => service.serviceId !== service.id)
      )

      console.log('serviceId', selectedServices)
    }
  }

  const handleRemoveServices = (tourIndex: number, userIndex: number) => {
    const servicesToRemove =
      selectedServices.length > 0
        ? selectedServices
        : checkedInUsers[userIndex].tours[tourIndex].services

    const user = checkedInUsers[userIndex]
    const tour = user.tours[tourIndex]

    const serviceIdsToRemove = servicesToRemove.map(
      (service) => service.serviceId
    )

    const DatatoSend = {
      booking_id: tour.booking_id, // Lấy ID booking của tour
      refunds: {
        customer_ids: [user.id], // ID của khách hàng cần hoàn lại tiền
        // bookingTour_ids: [tour.id], // ID của tour mà dịch vụ được chọn
        bookingTourServiceUser_ids: serviceIdsToRemove, // ID của các dịch vụ cần xóa
      },
    }

    console.log('DatatoSend:', DatatoSend)

    servicesToRemove.forEach((service) => {
      if (service.serviceId) {
        dispatch<any>(getRefundServiceBill(DatatoSend))
        dispatch(showModal('billModalRefund'))
      } else {
        dispatch(
          removeService({
            userId: checkedInUsers[userIndex].id,
            tourId: checkedInUsers[userIndex].tours[tourIndex].id,
            serviceId: service.serviceId,
          })
        )
      }
    })

    setSelectedServices([])
    const bookingId = checkedInUsers[userIndex]?.tours[tourIndex]?.booking_id
    console
    if (bookingId) {
      dispatch(getAllUserCheckin(bookingId)) // Lấy lại danh sách khách đã check-in
    }
  }

  const handleUpdateServices = async (tourIndex: number, userIndex: number) => {
    // Lấy thông tin người dùng
    const user = checkedInUsers[userIndex]
    const tour = user.tours[tourIndex]

    // Lấy các dịch vụ đã chọn từ selectedServices
    const updatedServices = selectedServices.map((service) => ({
      id: service.id,
      quantity: service.quantity,
      unit: service.unit,
      start_time: service.start_time,
      end_time: service.end_time,
    }))

    // Cập nhật dữ liệu theo cấu trúc yêu cầu
    const data = [
      {
        users: { full_name: user.fullname },
        user_details: {
          birthday: user.birthday,
          passport: user.passport,
          address: user.address,
          phone: user.phone,
        },
        booking_tours: user.tours.map((tour) => ({
          id: tour.id,
          booking_service_by_tours: updatedServices.map((service) => ({
            id: service.id,
            quantity: service.quantity,
            unit: service.unit,
            start_time: service.start_time,
            end_time: service.end_time,
          })),
        })),
      },
    ]

    console.log('Data to update:', data)

    try {
      const resultAction = await dispatch(checkInThunk({ data })).unwrap()

      console.log('Check-in thành công:', resultAction)

      if (resultAction) {
        console.log('Check-in thành công:', resultAction)
        message.success('Check-in thành công!')

        // Gọi API lấy thông tin bill
        const billResult = await dispatch(
          getAddServiceBill(resultAction.data)
        ).unwrap()

        // // Chỉ hiển thị modal khi lấy bill thành công
        if (billResult) {
          // console.log('Thông tin bill:', billResult);
          dispatch(showModal('billModalAdd'))
        } else {
          message.error('Không thể lấy thông tin bill.')
        }
      } else {
        message.error('Check-in thất bại.')
      }
    } catch (error) {
      message.error('Có lỗi xảy ra trong quá trình check-in')
    }

    setSelectedServices([])
    setIsServiceFormVisible(false)

    const bookingId = checkedInUsers[userIndex]?.tours[tourIndex]?.booking_id
    console
    if (bookingId) {
      dispatch(getAllUserCheckin(bookingId)) // Lấy lại danh sách khách đã check-in
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3
        style={{ textAlign: 'center', fontSize: '20px', marginBottom: '20px' }}
      >
        Danh sách khách hàng
      </h3>
      {checkedInUsers.map((user, userIndex) => (
        <div
          key={userIndex}
          style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h4>Thông tin khách hàng : {user.fullname}</h4>
            {user.user_active === 'checkin' && <Button> Thanh toán</Button>}
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p>
              <strong>Số hộ chiếu:</strong> {user.passport}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {user.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {user.address}
            </p>
            <p>
              <strong>Ngày sinh:</strong> {user.birthday}
            </p>
          </div>

          {user.tours.map((tour, tourIndex) => (
            <div key={tourIndex} style={{ padding: '15px 0' }}>
              <h4 style={{ marginBottom: '10px', color: '#1890ff' }}>
                {tour.name_tour}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p>
                  <strong>Ngày khởi hành:</strong> {tour.start_time}
                </p>
                <p>
                  <strong>Ngày kết thúc:</strong> {tour.end_time}
                </p>
                <p>
                  <strong>Giá tour:</strong> {tour.price.toLocaleString()} VND
                </p>
                <p>
                  <strong>Trạng thái:</strong> {tour.status}
                </p>
                <p>
                  <strong>Ghi Chú</strong> {tour.note}
                </p>
                <Button type="link" danger>
                  Hủy Tour
                </Button>
              </div>

              <h5 style={{ marginTop: '10px' }}>Dịch vụ đã chọn:</h5>
              <Table
                columns={[
                  {
                    title: '',
                    dataIndex: 'id',
                    key: 'id',
                    render: (text, record) => (
                      <Checkbox
                        onChange={(e) => {
                          console.log('record.id', record.id)
                          handleServiceCheckboxChange(
                            record,
                            e.target.checked,
                            userIndex,
                            tourIndex
                          )
                        }}
                        disabled={record.status === 'cancel'}
                      />
                    ),
                  },
                  {
                    title: 'Dịch Vụ',
                    dataIndex: 'name_service',
                    key: 'name_service',
                  },
                  {
                    title: 'Bắt đầu',
                    dataIndex: 'start_time',
                    key: 'start_time',
                  },
                  {
                    title: 'Kết thúc',
                    dataIndex: 'end_time',
                    key: 'end_time',
                  },
                  { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
                  { title: 'Đơn Vị', dataIndex: 'unit', key: 'unit' },
                  {
                    title: 'Đơn Giá',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price: number) => `${price} VND`,
                  },
                  {
                    title: 'Thành Tiền',
                    dataIndex: 'total',
                    key: 'total',
                    render: (_: any, record: any) => {
                      const total = record.quantity * record.price * record.unit // Tính Thành Tiền
                      return `${total} VND` // Hiển thị giá trị đã tính
                    },
                  },
                  {
                    title: 'Trạng Thái',
                    dataIndex: 'status',
                    key: 'status',
                  },
                  {
                    title: 'Ghi Chú',
                    dataIndex: 'note',
                    key: 'note',
                  },
                ]}
                dataSource={tour.services}
                pagination={false}
                rowKey="id"
                bordered
              />

              <Button
                type="primary"
                danger
                onClick={() => handleRemoveServices(tourIndex, userIndex)}
                style={{ margin: '10px 10px 0 0' }}
              >
                Hủy Dịch Vụ
              </Button>

              <Button
                type="dashed"
                onClick={() => handleToggleServiceForm(userIndex)}
                style={{ marginTop: '10px' }}
              >
                {serviceFormVisibility[userIndex]
                  ? 'Ẩn Thêm Dịch Vụ'
                  : 'Thêm Dịch Vụ'}
              </Button>

              {serviceFormVisibility[userIndex] && (
                <Card
                  style={{
                    padding: '15px',
                    marginTop: '10px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <h5>Chọn Dịch Vụ</h5>

                  <Select
                    placeholder="Chọn dịch vụ"
                    style={{ width: '100%' }}
                    onChange={(value) =>
                      handleAddService(tourIndex, userIndex, value)
                    }
                  >
                    {getRemainingServices(tourIndex).map((service) => (
                      <Option
                        key={service.service_id}
                        value={service.service_id}
                      >
                        {service.service_name} (Số lượng còn lại:{' '}
                        {service.remaining})
                      </Option>
                    ))}
                  </Select>

                  {selectedServices.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h5>Dịch vụ mới đã chọn:</h5>
                      <Table
                        columns={[
                          {
                            title: 'Dịch Vụ',
                            dataIndex: 'service_name',
                            key: 'service_name',
                          },
                          {
                            title: 'Bắt đầu',
                            dataIndex: 'start_time',
                            key: 'start_time',
                          },
                          {
                            title: 'Kết thúc',
                            dataIndex: 'end_time',
                            key: 'end_time',
                          },
                          {
                            title: 'Số Lượng',
                            dataIndex: 'quantity',
                            key: 'quantity',
                            render: (text, record) => (
                              <InputNumber
                                min={1}
                                max={record.remaining + 1}
                                value={record.quantity}
                                onChange={(value) =>
                                  handleQuantityChange(value, record.service_id)
                                }
                              />
                            ),
                          },
                          { title: 'Đơn Vị', dataIndex: 'unit', key: 'unit' },
                          {
                            title: 'Đơn Giá',
                            dataIndex: 'price',
                            key: 'price',
                            render: (price) => `${price} VND`,
                          },
                          {
                            title: 'Thành Tiền',
                            dataIndex: 'total',
                            key: 'total',
                            render: (_, record) =>
                              `${record.quantity * record.price} VND`,
                          },
                          {
                            title: 'Ghi Chú',
                            dataIndex: 'note',
                            key: 'note',
                          },
                        ]}
                        dataSource={selectedServices}
                        pagination={false}
                        rowKey="service_id"
                        bordered
                      />

                      <Button
                        type="primary"
                        onClick={() =>
                          handleUpdateServices(tourIndex, userIndex)
                        }
                        style={{ marginTop: '10px', width: '100%' }}
                      >
                        Cập Nhật Dịch Vụ
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>
          ))}
        </div>
      ))}
      <BillRefundService />
      <BillAddService />
    </div>
  )
}

export default UpdateBookingUserDetailComponent
