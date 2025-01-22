import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Modal } from 'antd'
import { RootState, useAppDispatch } from 'redux/store'
import { useParams } from 'react-router-dom'
import HeaderUpdateBooking from 'component/UpdateBookingComponent/header'
import { fetchPaymentHistory } from 'redux/Reducer/PaymentHistory'
import html2pdf from 'html2pdf.js'
import { useTranslation } from 'react-i18next'

const PaymentHistoryComponent = () => {
    const { id } = useParams<{ id: string }>()
    const dispatch = useAppDispatch()

    const historyData = useSelector((state: RootState) => state.paymentHistory.historyData)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [invoiceData, setInvoiceData] = useState<any>(null)
    const { t } = useTranslation('TableBills');

    useEffect(() => {
        if (id) {
            dispatch(fetchPaymentHistory(id))
        }
    }, [id, dispatch])

    const formatCurrency = (value: string | number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(Number(value))
    }

    const columns = [
        {
            title: t('TableBills.paymentName'),
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: t('TableBills.tourName'),
            dataIndex: 'name_tour',
            key: 'name_tour',
        },
        {
            title: t('TableBills.serviceName'),
            dataIndex: 'name_service',
            key: 'name_service',
        },
        {
            title: t('TableBills.serviceQuantity'),
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: t('TableBills.customerQuantity'),
            dataIndex: 'quantity_customer',
            key: 'quantity_customer',
        },
        {
            title: t('TableBills.payment'),
            colSpan: 3,
            children: [
                {
                    title: t('TableBills.paymentTime'),
                    dataIndex: 'payment_time',
                    key: 'payment_time',
                    render: (text: any, record: any) => {
                        return new Date(record.payment_time).toLocaleString('vi-VN')
                    }
                },
                {
                    title: t('TableBills.totalAmount'),
                    dataIndex: 'total_amount',
                    key: 'total_amount',
                    render: (text: any) => formatCurrency(text)
                },
                {
                    title: t('TableBills.deposit'),
                    dataIndex: 'deposit',
                    key: 'deposit',
                    render: (text: any) => formatCurrency(text)
                }
            ]
        },
        {
            title: t('TableBills.discount'),
            dataIndex: 'value_voucher',
            key: 'value_voucher',
            render: (valueVoucher: string | null) => {
                if (valueVoucher && !isNaN(Number(valueVoucher))) {
                    return formatCurrency(valueVoucher)
                }
                return 'Không dùng mã giảm giá';
            }
        },
        {
            title: t('TableBills.finalAmount'),
            dataIndex: 'final_amount',
            key: 'final_amount',
            render: (finalAmount: string) => formatCurrency(finalAmount),
        },
        {
            title: t('TableBills.action'),
            key: 'action',
            render: (text: any, record: any) => (
                <Button onClick={() => handleShowInvoice(record)}>
                     {t('TableBills.exportInvoice')}
                </Button>
            ),
        }
    ]

    const dataSource = historyData.map((item: any) => {
        return item.bill_services.map((service: any) => {
            const refundAmount = item.refunds.reduce((acc: number, refund: any) => acc + parseFloat(refund.amount || '0'), 0)
            const finalAmount = parseFloat(item.total_amount) - parseFloat(item.deposit) - (item.value_voucher ? parseFloat(item.value_voucher) : 0) + refundAmount

            return {
                key: service.id,
                name_service: service.name_service,
                name_tour: item.bill_tours?.map((tour: any) => tour.name_tour).join(", "),
                quantity: service.quantity,
                quantity_customer: item.booking.quantity_customer,
                total_amount: item.total_amount,
                deposit: item.deposit,
                refunds: item.refunds || [],
                fullname: item.customer?.fullname,
                value_voucher: item.value_voucher || 'Không dùng mã giảm giá',
                payment_time: item.created_at,
                final_amount: finalAmount.toString(),
            }
        })
    }).flat()

    const handleShowInvoice = (record: any) => {
        setInvoiceData(record)  // Set dữ liệu hóa đơn cho modal
        setIsModalVisible(true)  // Hiển thị modal
    }

    const handleCancelModal = () => {
        setIsModalVisible(false)
    }

    const handleGeneratePDF = () => {
        const invoiceElement = document.getElementById('invoice-container'); // Thay 'invoice-container' bằng id của thẻ bao quanh hóa đơn

        const options = {
            margin: 1,
            filename: 'invoice.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        };

        if (invoiceElement) {
            html2pdf().from(invoiceElement).set(options).save();
        }
    };

    return (
        <div className='wrapper_payment'>
            <HeaderUpdateBooking />
            <div className="container" style={{ marginTop:'170px'}}>
                <div className="payment_history">
                    <h2>{t('TableBills.paymentHistory')}</h2>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey="key"
                        pagination={false}
                    />
                </div>
            </div>

            {/* Modal hiển thị thông tin hóa đơn */}
            <Modal
                title="Hóa Đơn Chi Tiết"
                visible={isModalVisible}
                onCancel={handleCancelModal}
                footer={[
                    <Button key="back" onClick={handleCancelModal}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleGeneratePDF}>
                        Xuất Hóa Đơn PDF
                    </Button>,
                ]}
                width={800}
            >
                {invoiceData && (
                    <div id="invoice-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ borderBottom: '2px solid #000', marginBottom: '20px', textAlign: 'center' }}>
                            <h2>Hóa Đơn Thanh Toán</h2>
                            <p><strong>Mã Hóa Đơn:</strong> {invoiceData.key}</p>
                        </div>
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td><strong>Tên Khách Hàng:</strong> {invoiceData.fullname}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tên Tour:</strong> {invoiceData.name_tour}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tên Dịch Vụ:</strong> {invoiceData.name_service}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Số Lượng Dịch Vụ:</strong> {invoiceData.quantity}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Số Lượng Khách Hàng:</strong> {invoiceData.quantity_customer}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tổng Tiền Thanh Toán:</strong> {formatCurrency(invoiceData.total_amount)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tiền Cọc:</strong> {formatCurrency(invoiceData.deposit)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Giảm Giá:</strong> {invoiceData.value_voucher}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Số Tiền Thực Thu:</strong> {formatCurrency(invoiceData.final_amount)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Thời Gian Thanh Toán:</strong> {new Date(invoiceData.payment_time).toLocaleString('vi-VN')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default PaymentHistoryComponent;
