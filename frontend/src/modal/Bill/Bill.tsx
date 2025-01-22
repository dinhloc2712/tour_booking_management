import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, Select, message } from 'antd'
import { RootState } from 'redux/store'
import { hideModal } from 'redux/Redux/modal/modalSlice'
import { BillOK } from 'redux/API/POST/BillOK'
import { ThunkDispatch } from 'redux-thunk'
import { Action } from 'redux'
import { getAllUserCheckin } from 'redux/API/GET/getBooking/GetAllUserCheckin'
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'

import { BillPayload, ApiResponse, clearBillData } from 'redux/Reducer/BillReducer'

import html2pdf from 'html2pdf.js'
import { get } from 'lodash'
const { Option } = Select

const Bill: React.FC = () => {
  // const dispatch = useDispatch()
  const dispatch: ThunkDispatch<RootState, void, Action> = useDispatch()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.id ? String(user.id) : 'No user logged in'
  const userName = user.fullname ? user.fullname : 'No user logged in'
  const branchId = user.branch_id ? user.branch_id : null


  const checkInResult = useSelector(
    (state: RootState) => state.checkin.checkInResult
  )

  // Sử dụng `checkInResult` để hiển thị hoặc tính toán
  // console.log('Check-In Result for Bill:', checkInResult)

  const isOpen = useSelector(
    (state: RootState) => state.modal.modals['billModal'] || false
  )
  const billData = useSelector((state: RootState) => state.bill?.data)
  console.log('billData', billData)

  const handleOk = () => {
    dispatch(hideModal('billModal'))
    window.print()
  }

  const handleCancel = () => {
    dispatch(hideModal('billModal'))
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

    billData?.bookingTours?.forEach((tour) => {
      // Tính giá tour cho số lượng khách
      const tourTotal = Number(tour.price) * tour.quantity_customer

      // Tính tổng giá của các dịch vụ trong tour
      const servicesTotal = tour.bookingServices.reduce(
        (sum, service) => sum + Number(service.price) * service.quantity * service.unit,
        0
      )

      // Cộng tổng giá tour và dịch vụ lại
      totalAmount += tourTotal + servicesTotal
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
  const amount = totalAmount - billData?.deposit
  const totalAmountInWords = convertNumberToWords(amount)

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

  

  const bookingId = billData?.booking_id

  const handleSubmitBill = async () => {
    const totalAmount = calculateTotalAmount()
    const amount = totalAmount - billData?.deposit

    const billPayload: BillPayload = {
      booking_id: checkInResult.data.booking_id,
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
      bill_tours:
        billData?.bookingTours.map((tour) => ({
          booking_tour_id: tour.booking_tour_id,
          name_tour: tour.name_tour,
          customer_ids: tour.customer_ids || [],
          quantity_customer: tour.quantity_customer,
          price: parseFloat(tour.price),
          note: tour.note || null,
        })) || [],
      bill_services:
        billData?.bookingTours.flatMap((tour) =>
          tour.bookingServices.map((service) => ({
            sale_agent_id: service.sale_agent_id || null,
            tour_id: service.booking_tour.tour_id,
            booking_tour_service_user_id: service.id,
            name_service: service.service.name,
            service_id: service.service_id,
            quantity: service.quantity,
            unit: service.unit,
            price: parseFloat(service.price),
            note: service.note || null,
            customer_id: service.user_id,
          }))
        ) || [],
      payment: {
        amount: amount,
        type: selectedTypePayment,
      },
    }

    console.log('Bill payload data là :', billPayload)

    try {
      const result = await dispatch(BillOK(billPayload)).unwrap()
      console.log('Bill submitted successfully:', result)
      message.success('Bill submitted successfully')
      dispatch(clearBillData())
      dispatch(getBooking())
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
          <h3>HÓA ĐƠN</h3>
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
        <h3>Thông tin người thanh toán</h3>
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
        {/* Thông tin tour đã đặt */}
        <h3 className="invoice-section-title" style={{ marginBottom: '20px' }}>
          Thông tin tour đã đặt
        </h3>
        {billData?.bookingTours?.map((tour, index) => (
          <div key={tour.tour_id} className="tour-block page-break">
            <div
              className="tour-info"
              style={{
                
              }}
            >
              <div>
                <p>
                  <label>
                    <h5>Tên Tour : </h5>
                  </label>{' '}
                  {tour.name_tour}
                </p>
              </div>
              <div>
                <p>
                  <label>
                    <b>Số lượng khách : </b>
                  </label>{' '}
                  {tour.quantity_customer}
                </p>
              </div>
              <div>
                <p>
                  <label>
                    <b>Giá Tour : </b>
                  </label>{' '}
                  {Number(tour.price * tour.quantity_customer).toLocaleString()}đ
                </p>
              </div>
            </div>

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
                  const groupedServices = tour.bookingServices.reduce(
                    (acc, service) => {
                      const existingServiceIndex = acc.findIndex(
                        (item) =>
                          item.service_id === service.service_id &&
                          item.unit === service.unit
                      )

                      if (existingServiceIndex >= 0) {
                        acc[existingServiceIndex].quantity += service.quantity
                        acc[existingServiceIndex].totalPrice +=
                          service.price * service.quantity
                      } else {
                        acc.push({
                          ...service,
                          totalPrice: service.price * service.quantity,
                        })
                      }

                      return acc
                    },
                    []
                  )

                  return groupedServices.map((service, serviceIndex) => (
                    <tr key={`${service.service_id}-${service.unit}`}>
                      <td>{serviceIndex + 1}</td>
                      <td>{service.service.name}</td>
                      <td>{service.unit}</td>
                      <td>{service.quantity}</td>
                      <td>{Number(service.price).toLocaleString()}đ</td>
                      <td>{Number(service.totalPrice).toLocaleString()}đ</td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
            <hr />
          </div>
        ))}
        {/* Tổng tiền thanh toán */}
        <div className="invoice-summary page-break">
          <p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '30px',
              }}
            >
            <div style={{ display: 'flex', alignItems: 'center' }}> 
            <h5>Tổng tiền tour : </h5>
              <h4 style={{ color: 'red' }}>
                {totalAmount.toLocaleString()} VNĐ{' '}
              </h4>
            </div>
             <div style={{ display: 'flex', alignItems: 'center' }}> 
             <h5>Tiền Cọc : </h5>
              <h4 style={{ color: 'red' }}>
                {billData?.deposit.toLocaleString()} VNĐ{' '}
              </h4>
             </div>
            <div style={{ display: 'flex', alignItems: 'center' }}> 
            <h5>Tổng tiền thanh toán : </h5>
              <h4 style={{ color: 'red' }}>
                {amount.toLocaleString()} VNĐ{' '}
              </h4>
            </div>
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

export default Bill
