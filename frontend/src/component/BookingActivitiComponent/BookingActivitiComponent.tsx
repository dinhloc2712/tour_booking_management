// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Tabs, Table, Button, Card, Empty } from 'antd';  // Added Empty component
// import { AppDispatch, RootState } from 'redux/store';
// import { fetchBookingToursWithStatus } from 'redux/API/GET/getBookingActive/GetBookingTour';
// import { useNavigate } from 'react-router-dom';

// const { TabPane } = Tabs;

// const BookingActivitiComponent: React.FC = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const navigate = useNavigate();

//     const bookings = useSelector((state: RootState) => state.BookingTourReducer.bookings);

//     const reversedBookings = [...bookings].reverse();
//     const status = useSelector((state: RootState) => state.BookingTourReducer.status);

//     const [selectedStatus, setSelectedStatus] = useState<string>('all');
//     const [filteredBookings, setFilteredBookings] = useState<any[]>([]);

//     useEffect(() => {
//         dispatch(fetchBookingToursWithStatus());
//     }, [dispatch]);

//     useEffect(() => {
//         if (selectedStatus === 'all') {
//             setFilteredBookings(reversedBookings);
//         } else if (status[selectedStatus]) {
//             const newFilteredBookings = bookings.filter((booking) => {
//                 const activities = booking.bookingTour?.booking_activities;
//                 const latestActivity = activities && activities.length > 0 ? activities[activities.length - 1] : null;
//                 const activityName = latestActivity ? latestActivity.name : null;

//                 return activityName === status[selectedStatus];
//             });

//             setFilteredBookings(newFilteredBookings);
//         } else {
//             setFilteredBookings(bookings);
//         }
//     }, [selectedStatus, bookings, status]);

//     const handleDetailClick = (id: number) => {
//         navigate(`/booking-details/${id}`);
//     };

//     const formatDate = (isoString: string) => {
//         const date = new Date(isoString);
//         return (
//             date.toLocaleDateString("en-GB", {
//                 day: "2-digit",
//                 month: "2-digit",
//                 year: "numeric",
//             }) +
//             " " +
//             date.toLocaleTimeString("en-GB", {
//                 hour: "2-digit",
//                 minute: "2-digit",
//             })
//         );
//     };

//     const columns = [
//         {
//             title: 'STT',
//             dataIndex: ['bookingTour', 'id'],
//             key: 'id',
//             render: (_: any, record: any, index: number) => index + 1,
//         },
//         {
//             title: 'Tên Tour',
//             dataIndex: ['bookingTour', 'name_tour'],
//             key: 'nameTour',
//         },
//         {
//             title: 'Tên Người Đặt',
//             dataIndex: ['users', 0, 'fullname'],
//             key: 'fullname',
//         },
//         {
//             title: 'Số Điện Thoại',
//             dataIndex: ['users', 0, 'passport'],
//             key: 'email',
//         },
//         {
//             title: 'Số Lượng Người',
//             dataIndex: ['bookingTour', 'quantity_customer'],
//             key: 'quantityCustomer',
//         },
//         {
//             title: 'Trạng Thái Hành Trình',
//             key: 'status',
//             render: (_: any, record: any) => {
//                 const activities = record.bookingTour?.booking_activities;
//                 const latestActivity = activities && activities.length > 0 ? activities[activities.length - 1] : null;

//                 let activityName = 'Không có dữ liệu';  

//                 if (latestActivity) {
//                     if (latestActivity.name === 'booking') {
//                         activityName = 'Booking';
//                     } else if (latestActivity.name === 'checkin') {
//                         activityName = 'Checkin';
//                     } else if (latestActivity.name === 'paid') {
//                         activityName = 'Paid';
//                     } else if (latestActivity.name === 'on_bus') {
//                         activityName = 'On Bus';
//                     } else if (latestActivity.name === 'arrived') {
//                         activityName = 'Arrived';
//                     } else if (latestActivity.name === 'start_tour') {
//                         activityName = 'Start Tour';
//                     } else if (latestActivity.name === 'complete_tour') {
//                         activityName = 'Complete Tour';
//                     } else if (latestActivity.name === 'cancel') {
//                         activityName = 'Cancel';
//                     } else {
//                         activityName = 'Trạng thái chưa được cập nhật'
//                     }
//                 }

//                 return <div>{activityName}</div>;
//             },
//         },

//         {
//             title: 'Ngày Cập Nhật Hành Trình',
//             dataIndex: ['bookingTour', 'updated_at'],
//             key: 'updatedAt',
//             render: (updated_at: string) => formatDate(updated_at),
//         },
//         {
//             title: 'Hành Động',
//             key: 'actions',
//             render: (_: any, record: any) => (
//                 <Button
//                     type="primary"
//                     onClick={() => handleDetailClick(record.bookingTour?.id)}
//                 >
//                     Chi tiết
//                 </Button>
//             ),
//         },
//     ];

//     const formatTabTitle = (value: string) => {
//         if (value === 'NAME_BOOKING') return 'BOOKING';
//         if (value === 'NAME_CHECKIN') return 'CHECK IN';
//         return value
//             .replace(/_/g, ' ')
//             .replace(/\b\w/g, (char) => char.toUpperCase());
//     };

//     return (
//         <div className="wrapper-layout-content">
//             <Card style={{height: '100%',}}>
//                 <Tabs
//                     defaultActiveKey="all"
//                     onChange={(value) => {
//                         setSelectedStatus(value);
//                     }}
//                     style={{height: '100%'}}
//                 >
//                     <TabPane tab="Tất cả" key="all" style={{height: '100%'}}>
//                         <Table
//                         style={{height: '100%'}}
//                             columns={columns}
//                             dataSource={filteredBookings}
//                             rowKey={(record) => record.bookingTour.id}
//                             loading={filteredBookings.length === 0}
//                             pagination={{ pageSize: 10,position: ['bottomRight'] }}
//                             locale={{
//                                 emptyText: filteredBookings.length === 0 ? "Không có tour nào" : "Đang tải..."
//                             }}
//                         />
//                     </TabPane>
//                     {Object.entries(status).map(([key, value]) => (
//                         <TabPane tab={formatTabTitle(value)} key={key}>
//                             {filteredBookings.length === 0 ? (
//                                 <Empty description={`Không có tour nào đang ở trạng thái ${formatTabTitle(key)}`} />
//                             ) : (
//                                 <Table
//                                     columns={columns}
//                                     dataSource={filteredBookings}
//                                     rowKey={(record) => record.bookingTour.id}
//                                     loading={filteredBookings.length === 0}
//                                     pagination={{ pageSize: 10 ,
//                                         position: ['bottomRight'],
//                                     }}
//                                 />
//                             )}
//                         </TabPane>
//                     ))}
//                 </Tabs>
//             </Card>
//         </div>
//     );
// };

// export default BookingActivitiComponent;
