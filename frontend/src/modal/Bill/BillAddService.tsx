import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, Select, message } from 'antd'
import store, { RootState } from 'redux/store'
import { hideModal } from 'redux/Redux/modal/modalSlice'
import { BillAddServiceOK } from 'redux/API/POST/PostAddService'
import { ThunkDispatch } from 'redux-thunk'
import { Action } from 'redux'
import { getAllUserCheckin } from 'redux/API/GET/getBooking/GetAllUserCheckin'
import {
  BillAddServiceInfo,
  ApiResponse,
  clearBillData,
} from 'redux/Reducer/BillReducer'

import html2pdf from 'html2pdf.js'
const { Option } = Select

const BillAddService: React.FC = () => {
  // const dispatch = useDispatch()
  const dispatch: ThunkDispatch<RootState, void, Action> = useDispatch()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id ? String(user.id) : 'No user logged in'
  const userName = user.fullname ? user.fullname : 'No user logged in'
  const branchId = user.branch_id ? user.branch_id : null

  const checkInAllResult = useSelector(
    (state: RootState) => state.checkinAllUser.users
  )

  const isOpen = useSelector(
    (state: RootState) => state.modal.modals['billModalAdd'] || false
  )
  const billData = useSelector(
    (state: RootState) => state.bill?.addServiceBillData
  )
  console.log('billData', billData)

  const handleOk = () => {
    dispatch(hideModal('billModalAdd'))
    window.print()
  }

  const handleCancel = () => {
    dispatch(hideModal('billModalAdd'))
  }

  const [selectedTypeBill, setSelectedTypeBill] = useState<string>('')
  const [isTypeBillSelected, setIsTypeBillSelected] = useState(false)

  const [selectedTypePayment, setSelectedTypePayment] = useState<string>('')
  const [isTypePaymentSelected, setIsTypePaymentSelected] = useState(false)

  const today = new Date()
  const formattedDate = () => {
    const today = new Date() // Ngày tháng năm hiện tại của máy tính
    const day = today.getDate()
    const month = today.getMonth() + 1 // Tháng bắt đầu từ 0 nên cần +1
    const year = today.getFullYear()

    return `Ngày ${day} Tháng ${month} Năm ${year}`
  }

  const calculateTotalAmount = () => {
    let totalAmount = 0

    // Kiểm tra nếu billData và refundServices có dữ liệu
    billData?.bookingTours?.forEach((tour) => {
      // Lặp qua các dịch vụ đã được đặt trong mỗi booking tour
      tour.bookingServices.forEach((service) => {
        // Tính tổng giá của dịch vụ (price * quantity)
        totalAmount += Number(service.price) * service.quantity
      })
    })

    return totalAmount
  }

  const convertNumberToWords = (number) => {
    // Hàm chuyển đổi số thành chữ bằng tiếng Việt (bạn có thể tìm thư viện hỗ trợ nếu cần)
    const units = [
      '',
      'một',
      'hai',
      'ba',
      'bốn',
      'năm',
      'sáu',
      'bảy',
      'tám',
      'chín',
    ]
    const tens = [
      '',
      '',
      'hai',
      'ba',
      'bốn',
      'năm',
      'sáu',
      'bảy',
      'tám',
      'chín',
    ]
    const scales = ['', 'nghìn', 'triệu', 'tỷ']

    // Phần này chỉ là ví dụ, bạn có thể cải thiện thêm để hỗ trợ số lớn hơn
    if (number === 0) return 'không đồng'

    let words = ''
    let scaleIndex = 0

    while (number > 0) {
      const part = number % 1000
      if (part !== 0) {
        let partWords = ''
        const hundreds = Math.floor(part / 100)
        const remainder = part % 100
        const tensDigit = Math.floor(remainder / 10)
        const unitsDigit = remainder % 10

        if (hundreds > 0) partWords += units[hundreds] + ' trăm '

        if (tensDigit > 1) {
          partWords += tens[tensDigit] + ' mươi '
          if (unitsDigit > 0) partWords += units[unitsDigit]
        } else if (tensDigit === 1) {
          partWords += 'mười '
          if (unitsDigit > 0) partWords += units[unitsDigit]
        } else if (unitsDigit > 0) {
          partWords += units[unitsDigit]
        }

        words = partWords + ' ' + scales[scaleIndex] + ' ' + words
      }

      scaleIndex++
      number = Math.floor(number / 1000)
    }

    return words.trim() + ' đồng'
  }

  const totalAmount = calculateTotalAmount()
  const totalAmountInWords = convertNumberToWords(totalAmount)

  const handleGeneratePDF = () => {
    const invoiceElement = document.getElementById('invoice-container') // Thay 'invoice-content' bằng id của thẻ bao quanh hóa đơn

    const options = {
      margin: 1,
      filename: 'BongTravel.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }

    if (invoiceElement) {
      html2pdf().from(invoiceElement).set(options).save()
    }
  }

  const [refundReason, setRefundReason] = useState('') // state để lưu lý do hủy

  // Cập nhật lý do hủy khi người dùng nhập
  const handleRefundReasonChange = (e) => {
    setRefundReason(e.target.value)

    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleSubmitBill = async () => {
    const totalAmount = calculateTotalAmount()

    const BillAddServiceInfo: BillAddServiceInfo = {
      booking_id: checkInAllResult[0]?.tours[0]?.booking_id,
      customer_id: billData?.customers[0]?.id,
      staff_id: userId,
      name_staff: userName,
      voucher_id: null,
      code_voucher: null,
      value_voucher: null,
      quantity_customer: billData?.customers.length,
      deposit: billData?.deposit || 0,
      total_amount: totalAmount,
      type_bill: selectedTypeBill,
      bill_services: billData?.bookingTours[0]?.bookingServices.map((service) => ({
        booking_tour_service_user_id: service.id,
        service_id: service.service_id,
        name_service: service.service.name,
        sale_agent_id: service.sale_agent_id,
        quantity: service.quantity,
        unit: service.unit,
        price: service.price,
        note: service.note,
        tour_id: service.booking_tour.tour_id,
      })),
      payment: {
        amount: totalAmount,
        type: selectedTypePayment,
      },
    }

    console.log('Bill payload data là :', BillAddServiceInfo)

    try {
      const result = await dispatch(
        BillAddServiceOK(BillAddServiceInfo)
      ).unwrap()
      console.log('Bill submitted successfully:', result)
      message.success('Bill submitted successfully')

      const bookingId = checkInAllResult[0]?.tours[0]?.booking_id
      console.log('bookingId', bookingId)
      if (bookingId) {
        dispatch(getAllUserCheckin(bookingId))
      }
      dispatch(clearBillData())

      setSelectedTypeBill('') // Reset the selected type bill
      setSelectedTypePayment('') // Reset the selected type payment
      setIsTypeBillSelected(false) // Reset the "selected" flag for type bill
      setIsTypePaymentSelected(false) // Reset the "selected" flag for type payment
      setRefundReason('')
      console.log('Bill submitted successfully:', store.getState().bill)
    } catch (error) {
      console.error('Error submitting bill:', error)
      message.error('Error submitting bill')
    }
  }

  return (
    <Modal
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="back" onClick={handleCancel} className="no-print">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            handleOk()
            handleGeneratePDF()
            handleSubmitBill()
          }}
          className="no-print"
        >
          Thanh toán
        </Button>,
      ]}
    >
      <div className="invoice-container" id="invoice-container">
        <div className="invoice-title">
          <h3>HÓA ĐƠN HOÀN TIỀN</h3>
          <p>(Bản thể hiện của hóa đơn điện tử)</p>
          <p>{formattedDate()}</p>
        </div>
        <hr />
        <div>
          <h5>CÔNG TY TNHH THƯƠNG MẠI VÀ DU LỊCH BÔNG TRAVEL</h5>
          <p>
            <b>Mã số thuế: </b> 0110545077
          </p>
          <p>
            <b>Địa chỉ: </b> Số 2 Thanh Hà, Phường Đồng Xuân, Quận Hoàn Kiếm,
            Thành phố Hà Nội, Việt Nam
          </p>
          <p>
            <b>Số điện thoại: </b> 0349180999 / 0812188
          </p>
        </div>
        <hr />
        <h4>Thông tin người thanh toán</h4>
        {billData && (
          <div className="invoice-info">
            <p>
              <label>Tên người thanh toán:</label>{' '}
              {billData.customers[0]?.fullname}
            </p>
            <p>
              <label>Số điện thoại:</label>{' '}
              {billData.customers[0]?.user_detail.phone || ''}
            </p>
            <p>
              <label>Số lượng khách:</label> {billData.customers.length}
            </p>
          </div>
        )}
        {/* Loại hóa đơn */}
        <div className="selected_bill">
          <div className="selected_bill_typeBill">
            {!isTypeBillSelected ? (
              <p>
                <label>Chọn Loại Hóa Đơn:</label>
                <Select
                  placeholder="Chọn loại hóa đơn"
                  style={{ width: '40%', margin: '10px' }}
                  value={selectedTypeBill}
                  onChange={(value) => {
                    setSelectedTypeBill(value)
                    setIsTypeBillSelected(true)
                  }}
                >
                  {billData?.typeBills?.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </p>
            ) : (
              <p>
                <label>
                  <b>Loại Hóa Đơn : </b>
                </label>{' '}
                {selectedTypeBill}
                <Button
                  type="link"
                  className="no-print"
                  onClick={() => setIsTypeBillSelected(false)}
                >
                  Chỉnh sửa
                </Button>
              </p>
            )}
          </div>
          <div className="selected_bill_typePayment">
            {!isTypePaymentSelected ? (
              <p>
                <label>Chọn Phương Thức Thanh Toán:</label>
                <Select
                  placeholder="Chọn phương thức thanh toán"
                  style={{ width: '40%', margin: '10px' }}
                  value={selectedTypePayment}
                  onChange={(value) => {
                    setSelectedTypePayment(value)
                    setIsTypePaymentSelected(true)
                  }}
                >
                  {billData?.typePayments?.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </p>
            ) : (
              <p>
                <label>
                  <b>Phương Thức Thanh Toán : </b>
                </label>{' '}
                {selectedTypePayment}
                <Button
                  type="link"
                  className="no-print"
                  onClick={() => setIsTypePaymentSelected(false)}
                >
                  Chỉnh sửa
                </Button>
              </p>
            )}
          </div>
        </div>
        <hr />
        {billData?.bookingTours[0]?.bookingServices?.map((service, index) => (
          <div className="tour-block page-break" key={service.id}>
            {/* Dịch vụ của tour */}
            <h5>Dịch Vụ Đã Chọn</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Dịch vụ</th>
                  <th>Đơn vị</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Nhóm các dịch vụ có cùng service_id và unit
                  const groupedServices =
                    billData?.bookingTours[0]?.bookingServices.reduce(
                      (acc, service) => {
                        const existingServiceIndex = acc.findIndex(
                          (item) =>
                            item.service_id === service.service_id &&
                            item.unit === service.unit
                        )

                        if (existingServiceIndex >= 0) {
                          // Nếu đã tồn tại dịch vụ trong nhóm, cộng thêm số lượng và tính lại thành tiền
                          acc[existingServiceIndex].quantity += service.quantity
                          acc[existingServiceIndex].totalPrice +=
                            service.price * service.quantity
                        } else {
                          // Nếu chưa có dịch vụ, thêm mới vào mảng
                          acc.push({
                            service_id: service.service_id,
                            unit: service.unit,
                            service_name: service.service.name,
                            quantity: service.quantity,
                            price: service.price,
                            totalPrice: service.price * service.quantity,
                          })
                        }

                        return acc
                      },
                      []
                    )

                  // Render các dịch vụ nhóm lại
                  return groupedServices.map((groupedService, serviceIndex) => (
                    <tr
                      key={`${groupedService.service_id}-${groupedService.unit}`}
                    >
                      <td>{serviceIndex + 1}</td>
                      <td>{groupedService.service_name}</td>
                      <td>{groupedService.unit}</td>
                      <td>{groupedService.quantity}</td>
                      <td>{Number(groupedService.price).toLocaleString()}đ</td>
                      <td>
                        {Number(groupedService.totalPrice).toLocaleString()}đ
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
            {/* <div className="noteRefund">
              <label htmlFor="refundReason">
                <h6>Lý do hủy</h6>
              </label>
              <textarea
                id="refundReason"
                value={refundReason}
                onChange={handleRefundReasonChange}
                placeholder="Nhập lý do hủy..."
                style={{
                  border: 'none', // Ẩn khung viền
                  background: 'none', // Ẩn nền
                  outline: 'none', // Xóa viền khi focus
                  width: '100%', // Chiều rộng 100%
                  padding: '5px', // Padding để có khoảng cách trong ô
                  fontSize: '16px', // Kích thước font chữ
                  resize: 'none', // Không cho phép thay đổi kích thước
                  textAlign: 'left', // Căn chỉnh văn bản sang trái
                  wordWrap: 'break-word', // Tự động xuống dòng khi văn bản quá dài
                  whiteSpace: 'pre-wrap', // Cho phép xuống dòng, giữ lại khoảng trắng
                  overflow: 'hidden', // Ẩn phần vượt quá khung
                }}
              />
            </div> */}
            <hr />
          </div>
        ))}

        {/* Tổng tiền thanh toán */}
        <div className="invoice-summary page-break">
          <p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <h5>{totalAmount < 0 ? 'Tiền hoàn trả' : 'Tổng tiền'} :</h5>
              <h4 style={{ color: 'red' }}>
                {Math.abs(totalAmount).toLocaleString()} VNĐ
              </h4>
            </div>
            {/* Tổng tiền từ dữ liệu của các tour */}
          </p>
          <p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <h5>Số tiền bằng chữ : </h5>
              <h4> {totalAmountInWords}</h4>
            </div>
          </p>
        </div>
        {/* Chữ ký */}
        <table className="footer-signature">
          <tbody>
            <tr>
              <td>
                Người mua hàng
                <br />
                (Ký, ghi rõ họ, tên)
              </td>
              <td>
                Người bán hàng
                <br />
                (Ký, ghi rõ họ, tên)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

export default BillAddService
