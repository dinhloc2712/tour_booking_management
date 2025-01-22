// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Table, Card, Steps, Button, Modal, message, Checkbox, Input } from 'antd';
// import { AppDispatch, RootState } from 'redux/store';
// import { BookingServiceUser, fetchBookingTourDetail, updateTourStatus } from 'redux/Reducer/BookingTourReducer';
// import HeaderUpdateBooking from 'component/UpdateBookingComponent/header';
// import { Link, useNavigate } from 'react-router-dom';

// const { Step } = Steps;

// const BookingTourDetailComponent: React.FC<{ bookingTourId: number }> = ({ bookingTourId }) => {
//     const dispatch = useDispatch<AppDispatch>();
//     const bookingTour = useSelector((state: RootState) => state.BookingTourReducer.bookingTourDetail);
//     const users = useSelector((state: RootState) => state.BookingTourReducer.users);
//     const status = useSelector((state: RootState) => state.BookingTourReducer.status);

//     const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
//     const [selectedActivity, setSelectedActivity] = useState<string>('');
//     const [currentStep, setCurrentStep] = useState<number>(0);
//     const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//     const [isModalVisibleUser, setIsModalVisibleUser] = useState<boolean>(false);
//     const [pendingData, setPendingData] = useState<any>(null);
//     const [lastAction, setLastAction] = useState<string>('');
//     const [selectedUser, setSelectedUser] = useState<any>(null);
//     const [selectAll, setSelectAll] = useState<boolean>(false);
//     const [note, setNote] = useState<string>('');
//     const navigate = useNavigate();
//     useEffect(() => {
//         dispatch(fetchBookingTourDetail(bookingTourId));
//     }, [dispatch, bookingTourId]);

//     useEffect(() => {
//         if (bookingTour?.bookingTour?.booking_activities) {
//             const currentActivity = bookingTour.bookingTour.booking_activities.slice(-1)[0]?.name || '';
//             const stepIndex = Object.entries(status).findIndex(([key, value]) => value === currentActivity);
//             setCurrentStep(stepIndex !== -1 ? stepIndex : 0);
//         }
//     }, [bookingTour, status]);

//     const formatCurrency = (value: string | number) => `${Number(value).toLocaleString('vi-VN')} VND`;

//     const handleSelectAllChange = (e: any) => {
//         const newSelectAll = e.target.checked;
//         setSelectAll(newSelectAll);

//         if (newSelectAll) {
//             const allUserIds = users.map((user: any) => user.id);
//             setSelectedUserIds(new Set(allUserIds));
//         } else {
//             setSelectedUserIds(new Set());
//         }
//     };

//     const columnsUser = [
//         {
//             title: (
//                 <Checkbox
//                     onChange={handleSelectAllChange}
//                     checked={selectAll}
//                 />
//             ),
//             key: 'select',
//             render: (text: any, record: any) => (
//                 <Checkbox
//                     onChange={(e) => handleUserSelectionChange(e, record.id)}
//                     checked={selectedUserIds.has(record.id)}
//                 />
//             ),
//         },
//         {
//             title: 'Họ và Tên',
//             dataIndex: 'fullname',
//             key: 'fullname',
//         },
//         {
//             title: 'Số Điện Thoại',
//             dataIndex: ['user_detail', 'phone'],
//             key: 'phone',
//         },
//         {
//             title: 'Số Hộ Chiếu',
//             dataIndex: ['user_detail', 'passport'],
//             key: 'passport',
//         },
//         {
//             title: 'Địa Chỉ',
//             dataIndex: ['user_detail', 'address'],
//             key: 'address',
//         },
//     ];

//     const columns = [
//         {
//             title: (
//                 <Checkbox
//                     onChange={handleSelectAllChange}
//                     checked={selectAll}
//                 />
//             ),
//             key: 'select',
//             render: (text: any, record: any) => (
//                 <Checkbox
//                     onChange={(e) => handleUserSelectionChange(e, record.id)}
//                     checked={selectedUserIds.has(record.id)}
//                 />
//             ),
//         },
//         {
//             title: 'Họ và Tên',
//             dataIndex: 'fullname',
//             key: 'fullname',
//         },
//         {
//             title: 'Số Điện Thoại',
//             dataIndex: ['user_detail', 'phone'],
//             key: 'phone',
//         },
//         {
//             title: 'Số Hộ Chiếu',
//             dataIndex: ['user_detail', 'passport'],
//             key: 'passport',
//         },
//         {
//             title: 'Địa Chỉ',
//             dataIndex: ['user_detail', 'address'],
//             key: 'address',
//         },
//         {
//             title: 'Xem Chi Tiết',
//             key: 'action',
//             render: (text: any, record: any) => (
//                 <Button onClick={() => handleViewDetails(record)}>Xem Chi Tiết</Button>
//             ),
//         },
//     ];

//     const serviceColumns = [
//         {
//             title: 'Tên Dịch Vụ',
//             dataIndex: ['service', 'name'],
//             key: 'serviceName',
//         },
//         {
//             title: 'Số Lượng',
//             dataIndex: 'quantity',
//             key: 'quantity',
//         },
//         {
//             title: 'Giá',
//             dataIndex: 'price',
//             key: 'price',
//             render: (text: any) => formatCurrency(text),
//         },
//         {
//             title: 'Tổng Tiền',
//             dataIndex: 'total',
//             key: 'total',
//             render: (_: any, record: any) => formatCurrency(record.price * record.quantity),
//         },
//         {
//             title: 'Trạng Thái',
//             dataIndex: 'status',
//             key: 'status',
//         },
//     ];

//     const handleViewDetails = (user: any) => {
//         const filteredServices = user.booking_tour_service_users.filter(
//             (service: BookingServiceUser) => service.user_id === user.id
//         );
//         setSelectedUser({
//             ...user,
//             booking_tour_service_users: filteredServices,
//         });
//         setIsModalVisible(true);
//     };

//     const handleUserSelectionChange = (e: any, userId?: string) => {
//         const newSelectAll = e.target.checked;

//         if (userId) {
//             const newSelectedUserIds = new Set(selectedUserIds);
//             if (newSelectAll) {
//                 newSelectedUserIds.add(userId);
//             } else {
//                 newSelectedUserIds.delete(userId);
//             }
//             setSelectedUserIds(newSelectedUserIds);
//         } else {
//             const allUserIds = users.map((user: any) => user.id);
//             if (newSelectAll) {
//                 setSelectedUserIds(new Set(allUserIds));
//             } else {
//                 setSelectedUserIds(new Set());
//             }
//         }
//     };

//     const handleCancel = () => {
//         Modal.confirm({
//             title: 'Bạn có chắc chắn muốn hủy Booking Tour này?',
//             content: 'Hành động này sẽ hủy Booking Tour này.',
//             okText: 'Có',
//             cancelText: 'Không',
//             onOk: () => {
//                 console.log('ID booking tour:', bookingTourId);
//             },
//             onCancel: () => {
//             },
//         });
//     };

//     const handleNextStep = () => {
//         const nextStep = currentStep + 1;
       
//         if (nextStep < Object.keys(status).length) {
//             const nextActivity = Object.entries(status)[nextStep][1];
//             setSelectedActivity(nextActivity);

//             const customerIds = bookingTour?.bookingTour?.customer_ids || [];
//             const selectedUserIdsArray = Array.from(selectedUserIds);
//             const data = {
//                 bookingTourId,
//                 customer_Ids: selectedUserIdsArray,
//                 selectedActivity: nextActivity,
//             };

//             setPendingData(data);
//             setIsModalVisibleUser(true);
//             setLastAction('Next');
//         } else {
//             message.warning('Đây là bước cuối cùng.');
//         }
//     };

//     const handlePreviousStep = () => {
//         Modal.confirm({
//             title: 'Bạn có chắc chắn muốn quay lại bước trước?',
//             content: 'Hành động này sẽ quay lại bước trước của quá trình.',
//             okText: 'Có',
//             cancelText: 'Không',
//             onOk: () => {
//                 const nextStep = currentStep - 1;
//                 if (nextStep >= 0) {
//                     const previousActivity = Object.entries(status)[nextStep][1];
//                     setSelectedActivity(previousActivity);
//                     const customerIds = bookingTour?.bookingTour?.customer_ids || [];
//                     const noteUser = "";
//                     const data = {
//                         bookingTourId,
//                         customer_Ids: customerIds,
//                         selectedActivity: previousActivity,
//                         note: noteUser
//                     };
//                     if (nextStep > 3) {
//                         setPendingData(data);
//                         setLastAction('Previous');
//                     } else {
//                         dispatch(updateTourStatus(data))
//                             .then(() => {
//                                 message.success('Cập nhật trạng thái thành công!');
//                                 dispatch(fetchBookingTourDetail(bookingTourId));
//                                 setCurrentStep(nextStep);
//                             })
//                             .catch((error: any) => {
//                                 message.error('Đã xảy ra lỗi khi cập nhật trạng thái!');
//                             });
//                     }
//                 } else {
//                     message.warning('Đây là bước đầu tiên.');
//                 }
//             },
//             onCancel: () => {
//                 setIsModalVisibleUser(false);
//             },
//         });
//     };

//     const handleModalOk = async () => {
//         if (pendingData) {
//             try {
//                 const statusValue = status[selectedActivity];
//                 const selectedUserIdsArray = Array.from(selectedUserIds);

//                 const data = {
//                     ...pendingData,
//                     customer_Ids: selectedUserIdsArray,
//                     status: statusValue,
//                     note: note,
//                 };
//                 console.log(data);

//                 await dispatch(updateTourStatus(data)).unwrap();

//                 message.success('Cập nhật trạng thái thành công!');

//                 await dispatch(fetchBookingTourDetail(bookingTourId));

//                 if (lastAction === 'Next') {
//                     setCurrentStep(currentStep + 1);
//                 } else if (lastAction === 'Previous') {
//                     setCurrentStep(currentStep - 1);
//                 }

//                 setIsModalVisible(false);
//                 setIsModalVisibleUser(false);
//                 setPendingData(null);
//                 setSelectedUserIds(new Set());
//                 setSelectAll(false)
//                 setNote('');
//             } catch (error) {
//                 message.error('Đã xảy ra lỗi khi cập nhật trạng thái!');
//                 setIsModalVisible(false);
//             }

//         }
//     };

//     const handleModalCancel = () => {
//         setIsModalVisible(false);
//         setPendingData(null);
//     };

//     const handleModalCancelUser = () => {
//         setIsModalVisibleUser(false);
//         setPendingData(null);
//     };
//     const paymentHistory = () => {
//         navigate(`/payment-history-booking-tour/${bookingTour?.bookingTour?.booking_id}`)
//       }
//     return (
//         <>
//             <HeaderUpdateBooking />

//             <div style={{ padding: 20 , marginTop:'170px' }}>
//                 <Card title="Trạng Thái Tour">
//                     {bookingTour?.bookingTour?.booking_activities && (
//                         <Steps
//                             size="small"
//                             current={currentStep}
//                             items={Object.entries(status)
//                                 .filter(([key, value]) => {
//                                     return !(currentStep === 5 && value === 'cancel');
//                                 })
//                                 .map(([key, value]) => ({
//                                     title:
//                                         value === 'on_bus' ? 'On Bus' :
//                                             value === 'paid' ? 'Paid' :
//                                                 value === 'arrived' ? 'Arrived' :
//                                                     value === 'start_tour' ? 'Start Tour' :
//                                                         value === 'complete_tour' ? 'Complete Tour' :
//                                                             value === 'cancel' ? 'Cancel' : value
//                                 }))
//                             }
//                         />
//                     )}
//                     <div style={{ marginTop: 20 }}>
//                         {/* <Button
//                             type="default"
//                             style={{
//                                 marginLeft: 10,
//                                 color: 'red',
//                                 borderColor: 'red',
//                                 backgroundColor: 'white',
//                             }}
//                             onClick={handleCancel}
//                         >
//                             Hủy
//                         </Button> */}
//                         <Button
//                             type="default"
//                             style={{ marginLeft: 10 }}
//                             onClick={handlePreviousStep}
//                             disabled={currentStep < 1}
//                         >
//                             Previous
//                         </Button>
//                         <Button
//                             type="primary"
//                             style={{ marginLeft: 10 }}
//                             onClick={handleNextStep}
//                             disabled={currentStep === 5 || currentStep < 1}

//                         >
//                             Next
//                         </Button>
//                     </div>
//                 </Card>

//                 <Card title="Thông Tin Tour">
//                     <div className="booking_tour-info">
//                         <div>
//                             <strong>Tên Tour: </strong> {bookingTour?.bookingTour.name_tour}
//                             <br />
//                             <strong>Giá Tour: </strong> {formatCurrency(bookingTour?.bookingTour.price || 0)}
//                             <br />
//                             <strong>Số Lượng Người: </strong> {bookingTour?.bookingTour.quantity_customer || 0}
//                             <br />
//                             <strong>Ngày Bắt Đầu:</strong> {bookingTour?.bookingTour.start_time}
//                             <br />
//                             <strong>Ngày Kết Thúc:</strong> {bookingTour?.bookingTour.end_time}
//                             <br />
//                         </div>
//                     </div>
//                     <div style={{}}>
//                         <Link to="/updatebooking">
//                             <Button className="mt-3" type="primary">
//                                 Cập nhật thông tin
//                             </Button>
//                         </Link>
//                         <Button  style={{margin: "0 20px"}} key="update" type="primary" onClick={paymentHistory}>
//                             Lịch sử thanh toán
//                         </Button>,
//                     </div>
//                 </Card>

//                 <Card title="Danh Sách Người Dùng">
//                     <Table columns={columns} dataSource={users} rowKey="id" />
//                 </Card>
//             </div>

//             <Modal
//                 title={`Dịch Vụ của ${selectedUser?.fullname}`}
//                 visible={isModalVisible}
//                 onOk={handleModalOk}
//                 onCancel={handleModalCancel}
//                 width={800}
//                 centered
//             >
//                 {selectedUser && selectedUser.booking_tour_service_users && (
//                     <Table
//                         columns={serviceColumns}
//                         dataSource={selectedUser.booking_tour_service_users}
//                         rowKey="id"
//                         pagination={false}
//                     />
//                 )}
//                 {/* <div style={{ marginTop: 20 }}>
//                     <strong>Ghi Chú (Lý do vắng mặt): </strong>
//                     <Input.TextArea
//                         value={note}
//                         onChange={(e) => setNote(e.target.value)}
//                         rows={4}
//                         placeholder="Nhập lý do vắng mặt"
//                     />
//                 </div> */}
//             </Modal>

//             <Modal
//                 title="Danh Sách Hành Khách"
//                 visible={isModalVisibleUser}
//                 onOk={handleModalOk}
//                 onCancel={handleModalCancelUser}
//                 width={800}
//                 centered
//             >
//                 {users && (
//                     <Table
//                         columns={columnsUser}
//                         dataSource={users}
//                         rowKey="id"
//                         pagination={false}
//                     />
//                 )}
//                 <div style={{ marginTop: 20 }}>
//                     <p>Ghi Chú (Lý do vắng mặt): </p>
//                     <Input.TextArea
//                         value={note}
//                         onChange={(e) => setNote(e.target.value)}
//                         rows={4}
//                         placeholder="Nhập lý do vắng mặt"
//                     />
//                 </div>
//             </Modal>
//         </>
//     );
// };

// export default BookingTourDetailComponent;
