// import React, { useState } from 'react'
// import { Input, Button, Select, message, DatePicker, InputNumber } from 'antd'
// import { AiOutlineClose } from 'react-icons/ai'
// import { useDispatch, useSelector } from 'react-redux'
// import { RootState, AppDispatch } from 'redux/store' // Đảm bảo bạn đã định nghĩa RootState và AppDispatch trong store
// import {
//   setCurrentCheckIn,
//   addUserToCheckIn,
//   updateUserField,
//   selectTourForUser,
//   selectServiceForTour,
//   CheckInUserDetails,
//   incrementRemainingSlots,
// } from 'redux/Reducer/CheckinReducer' // Sử dụng đúng reducerư

// import { checkInThunk } from 'redux/API/POST/CheckinThunk' // Import đúng thunk
// import { showModal } from 'redux/Redux/modal/modalSlice' // Import modal Bill
// import Bill from 'modal/Bill/Bill'
// import { getBookingBill } from 'redux/API/GET/GetBill' // Import action để lấy thông tin booking

// import dayjs from 'dayjs'
// const { Option } = Select

// const UpdateBookingUserComponent: React.FC = () => {
//   const dispatch: AppDispatch = useDispatch()

//   const checkinData = useSelector(
//     (state: RootState) => state.checkin.currentCheckIn
//   )

//   const handleAddUser = () => {
//     dispatch(addUserToCheckIn())
//   }

//   const loading = useSelector((state: RootState) => state.checkin.loading)

//   const handleInputChange = (
//     userIndex: number,
//     field: keyof CheckInUserDetails,
//     value: any
//   ) => {
//     if (!checkinData || !checkinData.users) {
//       console.error('checkinData or users is undefined')
//       return
//     }
//     dispatch(updateUserField({ userIndex, field, value }))
//   }

//   const handleTourSelect = (passport: string, tourIds: number[]) => {
//     tourIds.forEach((tourId) => {
//       dispatch(selectTourForUser({ passPort: passport, bookingId: tourId }))
//     })
//   }

//   const handleUpdateServiceQuantity = (
//     passport: string,
//     tourId: number,
//     serviceId: number,
//     newQuantity: number
//   ) => {
//     // Tìm người dùng
//     const userIndex = checkinData.users.findIndex(
//       (u) => u.passport === passport
//     )
//     if (userIndex === -1) return

//     const user = { ...checkinData.users[userIndex] }

//     // Tìm tour
//     const tourIndex = user.selectedTours.findIndex((t) => t.id === tourId)
//     if (tourIndex === -1) return

//     const tour = { ...user.selectedTours[tourIndex] }

//     // Tìm dịch vụ trong booking_service_by_tours
//     const serviceIndex = tour.booking_service_by_tours.findIndex(
//       (s) => s.service_id === serviceId
//     )
//     if (serviceIndex === -1) return

//     const service = { ...tour.booking_service_by_tours[serviceIndex] }

//     // Tìm originalTour
//     const originalTourIndex = checkinData.booking_tours.findIndex(
//       (t) => t.id === tourId
//     )
//     if (originalTourIndex === -1) return

//     const originalTour = { ...checkinData.booking_tours[originalTourIndex] }

//     // Tìm originalService
//     const originalServiceIndex = originalTour.services.findIndex(
//       (s) => s.service_id === serviceId
//     )
//     if (originalServiceIndex === -1) return

//     const originalService = {
//       ...originalTour.services[originalServiceIndex],
//     }

//     // Tính toán chênh lệch số lượng
//     const quantityDifference = newQuantity - service.quantity
//     if (originalService.remainingQuantity < quantityDifference) {
//       message.error('Không đủ số lượng dịch vụ còn lại!')
//       return
//     }

//     // Cập nhật số lượng
//     service.quantity = newQuantity
//     originalService.remainingQuantity -= quantityDifference

//     // Cập nhật mảng booking_service_by_tours
//     const updatedBookingServices = [
//       ...tour.booking_service_by_tours.slice(0, serviceIndex),
//       service,
//       ...tour.booking_service_by_tours.slice(serviceIndex + 1),
//     ]

//     tour.booking_service_by_tours = updatedBookingServices

//     // Cập nhật mảng selectedTours
//     const updatedSelectedTours = [
//       ...user.selectedTours.slice(0, tourIndex),
//       tour,
//       ...user.selectedTours.slice(tourIndex + 1),
//     ]

//     user.selectedTours = updatedSelectedTours

//     // Cập nhật mảng users
//     const updatedUsers = [
//       ...checkinData.users.slice(0, userIndex),
//       user,
//       ...checkinData.users.slice(userIndex + 1),
//     ]

//     // Cập nhật mảng booking_tours
//     const updatedServices = [
//       ...originalTour.services.slice(0, originalServiceIndex),
//       originalService,
//       ...originalTour.services.slice(originalServiceIndex + 1),
//     ]

//     originalTour.services = updatedServices

//     const updatedBookingTours = [
//       ...checkinData.booking_tours.slice(0, originalTourIndex),
//       originalTour,
//       ...checkinData.booking_tours.slice(originalTourIndex + 1),
//     ]

//     // Dispatch state mới
//     dispatch(
//       setCurrentCheckIn({
//         ...checkinData,
//         users: updatedUsers,
//         booking_tours: updatedBookingTours,
//       })
//     )
//   }

//   const handleRemoveService = (
//     passport: string,
//     tourId: number,
//     serviceId: number
//   ) => {
//     // Tìm người dùng
//     const userIndex = checkinData.users.findIndex(
//       (u) => u.passport === passport
//     )
//     if (userIndex === -1) return

//     const user = { ...checkinData.users[userIndex] }

//     // Tìm tour
//     const tourIndex = user.selectedTours.findIndex((t) => t.id === tourId)
//     if (tourIndex === -1) return

//     const tour = { ...user.selectedTours[tourIndex] }

//     // Tìm originalTour
//     const originalTourIndex = checkinData.booking_tours.findIndex(
//       (t) => t.id === tourId
//     )
//     if (originalTourIndex === -1) return

//     const originalTour = { ...checkinData.booking_tours[originalTourIndex] }

//     // Tìm dịch vụ trong booking_service_by_tours
//     const serviceIndex = tour.booking_service_by_tours.findIndex(
//       (s) => s.service_id === serviceId
//     )
//     if (serviceIndex === -1) return

//     const service = { ...tour.booking_service_by_tours[serviceIndex] }

//     // Tìm originalService
//     const originalServiceIndex = originalTour.services.findIndex(
//       (s) => s.service_id === serviceId
//     )
//     if (originalServiceIndex === -1) return

//     const originalService = { ...originalTour.services[originalServiceIndex] }

//     // Hoàn lại số lượng vào remainingQuantity
//     originalService.remainingQuantity += service.quantity

//     // Xóa dịch vụ khỏi danh sách đã chọn
//     const updatedBookingServices = [
//       ...tour.booking_service_by_tours.slice(0, serviceIndex),
//       ...tour.booking_service_by_tours.slice(serviceIndex + 1),
//     ]
//     tour.booking_service_by_tours = updatedBookingServices

//     // Cập nhật mảng selectedTours
//     const updatedSelectedTours = [
//       ...user.selectedTours.slice(0, tourIndex),
//       tour,
//       ...user.selectedTours.slice(tourIndex + 1),
//     ]
//     user.selectedTours = updatedSelectedTours

//     // Cập nhật mảng users
//     const updatedUsers = [
//       ...checkinData.users.slice(0, userIndex),
//       user,
//       ...checkinData.users.slice(userIndex + 1),
//     ]

//     // Cập nhật mảng services trong originalTour
//     const updatedOriginalServices = [
//       ...originalTour.services.slice(0, originalServiceIndex),
//       originalService,
//       ...originalTour.services.slice(originalServiceIndex + 1),
//     ]
//     originalTour.services = updatedOriginalServices

//     // Cập nhật mảng booking_tours
//     const updatedBookingTours = [
//       ...checkinData.booking_tours.slice(0, originalTourIndex),
//       originalTour,
//       ...checkinData.booking_tours.slice(originalTourIndex + 1),
//     ]

//     // Dispatch state mới
//     dispatch(
//       setCurrentCheckIn({
//         ...checkinData,
//         users: updatedUsers,
//         booking_tours: updatedBookingTours,
//       })
//     )
//   }

//   const handleServiceSelect = (
//     passport: string,
//     tourId: number,
//     service: any,
//     quantity: number
//   ) => {
//     if (quantity > service.remainingQuantity) {
//       message.error('Số lượng vượt quá khả dụng!')
//       return
//     }

//     dispatch(
//       selectServiceForTour({
//         passPort: passport,
//         bookingId: tourId,
//         serviceData: {
//           service_id: service.service_id,
//           remainingQuantity: service.remainingQuantity, // Đồng bộ remainingQuantity
//           unit: service.unit,
//           price: service.price,
//           sale_agent_id: service.sale_agent_id,
//           quantity_customer: service.quantity_customer,
//           start_time: service.start_time,
//           end_time: service.end_time,
//           quantity,
//         },
//       })
//     )
//   }

//   const handleUpdateServiceAttribute = (
//     passport,
//     tourId,
//     serviceId,
//     attribute,
//     value
//   ) => {
//     // Lấy chỉ số người dùng
//     const userIndex = checkinData.users.findIndex(
//       (u) => u.passport === passport
//     )
//     if (userIndex === -1) return

//     // Tạo bản sao người dùng
//     const user = { ...checkinData.users[userIndex] }

//     // Lấy chỉ số tour
//     const tourIndex = user.selectedTours.findIndex((t) => t.id === tourId)
//     if (tourIndex === -1) return

//     // Tạo bản sao tour
//     const tour = { ...user.selectedTours[tourIndex] }

//     // Lấy chỉ số dịch vụ trong tour
//     const serviceIndex = tour.booking_service_by_tours.findIndex(
//       (s) => s.service_id === serviceId
//     )
//     if (serviceIndex === -1) return

//     // Tạo bản sao danh sách dịch vụ và dịch vụ cụ thể
//     const updatedBookingServices = [...tour.booking_service_by_tours]
//     const service = { ...updatedBookingServices[serviceIndex] }

//     // Lấy originalTour để tham chiếu dữ liệu gốc
//     const originalTourIndex = checkinData.booking_tours.findIndex(
//       (t) => t.id === tourId
//     )
//     if (originalTourIndex === -1) return

//     const originalTour = { ...checkinData.booking_tours[originalTourIndex] }

//     // Lấy originalService để kiểm tra dữ liệu gốc
//     const originalService = originalTour.services.find(
//       (s) => s.service_id === serviceId
//     )

//     if (!originalService) {
//       console.error('Original service not found!')
//       return
//     }

//     // Cập nhật thuộc tính
//     if (attribute === 'quantity') {
//       // Xử lý riêng cho quantity (dùng cơ chế tính chênh lệch)
//       const quantityDifference = value - service.quantity
//       if (originalService.remainingQuantity < quantityDifference) {
//         message.error('Số lượng vượt quá khả dụng!')
//         return
//       }
//       service.quantity = value
//       originalService.remainingQuantity -= quantityDifference
//     } else {
//       // Xử lý các thuộc tính khác
//       service[attribute] = value
//     }

//     // Thay thế dịch vụ đã chỉnh sửa vào danh sách dịch vụ
//     updatedBookingServices[serviceIndex] = service

//     // Cập nhật danh sách dịch vụ trong tour
//     const updatedTour = {
//       ...tour,
//       booking_service_by_tours: updatedBookingServices,
//     }

//     // Cập nhật danh sách tour của người dùng
//     const updatedSelectedTours = [
//       ...user.selectedTours.slice(0, tourIndex),
//       updatedTour,
//       ...user.selectedTours.slice(tourIndex + 1),
//     ]

//     // Cập nhật lại người dùng
//     const updatedUser = { ...user, selectedTours: updatedSelectedTours }

//     // Cập nhật danh sách người dùng
//     const updatedUsers = [
//       ...checkinData.users.slice(0, userIndex),
//       updatedUser,
//       ...checkinData.users.slice(userIndex + 1),
//     ]

//     // Cập nhật danh sách booking_tours
//     const updatedBookingTours = [
//       ...checkinData.booking_tours.slice(0, originalTourIndex),
//       originalTour,
//       ...checkinData.booking_tours.slice(originalTourIndex + 1),
//     ]

//     // Dispatch lại Redux state
//     dispatch(
//       setCurrentCheckIn({
//         ...checkinData,
//         users: updatedUsers,
//         booking_tours: updatedBookingTours,
//       })
//     )
//   }

//   const handleRemoveUser = (userIndex: number) => {
//     if (!checkinData || !checkinData.users) {
//       console.error('checkinData or users is undefined')
//       return
//     }

//     // Lấy danh sách ID của các tour được chọn
//     const tourIdsToIncrement =
//       checkinData.users[userIndex]?.selectedTours.map((tour) => tour.id) || []

//     // Gọi action để tăng `remainingSlots` cho các tour liên quan
//     dispatch(incrementRemainingSlots(tourIdsToIncrement))

//     // Cập nhật danh sách người dùng mà không cần người dùng tại `userIndex`
//     const updatedUsers = checkinData.users.filter(
//       (_, index) => index !== userIndex
//     )

//     // Gọi action để cập nhật lại danh sách người dùng
//     dispatch(
//       setCurrentCheckIn({
//         ...checkinData,
//         users: updatedUsers,
//       })
//     )
//   }

//   const handleCheckInSubmit = async (user = null) => {
//     if (!checkinData) {
//       message.error('Không có dữ liệu để check-in')
//       return
//     }
//     console.log('checkinData:', checkinData)
//     const usersData = user
//       ? [user] // Nếu có user được truyền vào, chỉ gửi dữ liệu của user đó
//       : checkinData.users // Nếu không, gửi toàn bộ dữ liệu người dùng
//     console.log('tetstttt', usersData)

//     const data = usersData.map((user) => ({
//       users: { full_name: user.full_name },
//       user_details: {
//         birthday: user.birthday,
//         passport: user.passport,
//         address: user.address,
//         phone: user.phone,
//       },
//       booking_tours: user.selectedTours.map((tour) => ({
//         id: tour.id,
//         booking_service_by_tours: tour.booking_service_by_tours.map(
//           (service) => ({
//             id: service.id,
//             quantity: service.quantity,
//             unit: service.unit,
//             // price: service.price,
//             // sale_agent_id: service.sale_agent_id,
//             // quantity_customer: service.quantity_customer,
//             start_time: service.start_time,
//             end_time: service.end_time,
//           })
//         ),
//       })),
//     }))

//     try {
//       const resultAction = await dispatch(checkInThunk({ data })).unwrap()

//       console.log('Check-in thành công:', resultAction)

//       if (resultAction) {
//         console.log('Check-in thành công:', resultAction)
//         message.success('Check-in thành công!')

//         // Gọi API lấy thông tin bill
//         const billResult = await dispatch(
//           getBookingBill(resultAction.data)
//         ).unwrap()

//         // Chỉ hiển thị modal khi lấy bill thành công
//         if (billResult) {
//           // console.log('Thông tin bill:', billResult);
//           dispatch(showModal('billModal'))
//         } else {
//           message.error('Không thể lấy thông tin bill.')
//         }
//       } else {
//         message.error('Check-in thất bại.')
//       }
//     } catch (error) {
//       message.error('Có lỗi xảy ra trong quá trình check-in')
//     }
//   }
//   return (
//     <div className="UpdateBookingUser">
//       <h3 style={{ textAlign: 'center', padding: '10px', fontSize: '24px' }}>
//         Thông tin chi tiết thành viên Booking
//       </h3>

//       {checkinData?.users.map((user: any, userIndex: number) => (
//         <div
//           key={userIndex}
//           className="UserDetail"
//           style={{
//             marginBottom: '20px',
//             padding: '20px',
//             border: '1px solid #ddd',
//             borderRadius: '8px',
//             backgroundColor: '#f9f9f9',
//             position: 'relative',
//           }}
//         >
//           <AiOutlineClose
//             style={{
//               position: 'absolute',
//               top: '10px',
//               right: '10px',
//               cursor: 'pointer',
//               fontSize: '20px',
//             }}
//             onClick={() => handleRemoveUser(userIndex)}
//           />

//           <h4>Người dùng : {user.full_name}</h4>

//           <div className="UserInformation">
//             <div className="UserInformation-detail">
//               <div>
//                 <span>Số hộ chiếu</span>
//                 <Input
//                   value={user.passport}
//                   onChange={(e) =>
//                     handleInputChange(userIndex, 'passport', e.target.value)
//                   }
//                 />
//               </div>
//             </div>

//             <div>
//               <span>Tên người dùng</span>
//               <Input
//                 value={user.full_name}
//                 onChange={(e) =>
//                   handleInputChange(userIndex, 'full_name', e.target.value)
//                 }
//               />
//             </div>

//             <div>
//               <span style={{ marginBottom: '5px' }}>Ngày sinh</span>
//               <DatePicker
//                 style={{
//                   width: '100%',
//                   height: '32px',
//                   padding: '5px',
//                   marginTop: '10px',
//                 }}
//                 value={user.birthday ? dayjs(user.birthday) : null}
//                 onChange={(date) =>
//                   handleInputChange(
//                     userIndex,
//                     'birthday',
//                     date ? dayjs(date).format('YYYY-MM-DD') : ''
//                   )
//                 }
//                 format="YYYY-MM-DD"
//               />
//             </div>

//             <div>
//               <span>Số WhatsApp</span>
//               <Input
//                 value={user.phone}
//                 onChange={(e) =>
//                   handleInputChange(userIndex, 'phone', e.target.value)
//                 }
//               />
//             </div>

//             <div>
//               <span>Địa chỉ</span>
//               <Input
//                 value={user.address}
//                 onChange={(e) =>
//                   handleInputChange(userIndex, 'address', e.target.value)
//                 }
//               />
//             </div>
//           </div>
//           <hr
//             style={{
//               color: 'black', // Màu của đường kẻ
//               backgroundColor: 'black', // Màu nền của đường kẻ (nếu cần)
//               height: '1px', // Độ dày của đường kẻ
//               border: 'none', // Loại bỏ đường viền mặc định
//               margin: '20px 0', // Khoảng cách trên dưới (tùy chọn)
//             }}
//           />
//           <div className="BookingTours">
//             <h4>Chọn tour và dịch vụ</h4>
//             Chọn tour
//             <Select
//               placeholder="Chọn tour"
//               style={{ width: '100%', marginBottom: '10px' }}
//               onChange={(tourIds) => handleTourSelect(user.passport, tourIds)}
//               value={user.selectedTours.map((tour) => tour.id)} // Hiển thị các tour đã chọn
//               mode="multiple"
//             >
//               {checkinData.booking_tours
//                 .filter((tour) => tour.remainingSlots > 0) // Chỉ hiển thị tour còn chỗ
//                 .map((tour) => (
//                   <Option
//                     key={tour.id}
//                     value={tour.id}
//                     disabled={
//                       user.selectedTours.some((t) => t.id === tour.id) ||
//                       tour.remainingSlots === 0 // Tour không thể chọn nếu không còn chỗ
//                     }
//                   >
//                     {tour.name}
//                   </Option>
//                 ))}
//             </Select>
//             <div className="selected-tours">
//               {user.selectedTours.map((tour, tourIndex) => {
//                 const originalTour = checkinData.booking_tours.find(
//                   (t) => t.id === tour.id
//                 )

//                 return (
//                   <div
//                     key={tourIndex}
//                     style={{
//                       marginBottom: '20px',
//                       padding: '10px',
//                       border: '1px solid #ddd',
//                       borderRadius: '5px',
//                     }}
//                   >
//                     {/* Tên Tour */}
//                     <div
//                       className="tour-name"
//                       style={{ fontWeight: 'bold', marginBottom: '10px' }}
//                     >
//                       {originalTour?.name}
//                     </div>

//                     {/* Chọn và hiển thị dịch vụ của tour */}
//                     <div>
//                       <h5>Chọn dịch vụ:</h5>
//                       <Select
//                         mode="multiple"
//                         placeholder="Chọn dịch vụ"
//                         style={{ width: '100%', marginBottom: '10px' }}
//                         value={tour.booking_service_by_tours.map((s) => s.id)}
//                         onChange={(selectedServiceIds) =>
//                           selectedServiceIds.forEach((serviceId) => {
//                             const service = originalTour?.services.find(
//                               (s) => s.id === serviceId
//                             )
//                             if (service) {
//                               handleServiceSelect(
//                                 user.passport,
//                                 tour.id,
//                                 service,
//                                 1 // Default quantity or any other logic to determine quantity
//                               )
//                             }
//                           })
//                         }
//                       >
//                         {originalTour?.services.map((service) => (
//                           <Option
//                             key={service.id}
//                             value={service.id}
//                             disabled={
//                               !!tour.booking_service_by_tours.find(
//                                 (s) => s.id === service.id
//                               )
//                             }
//                           >
//                             {`${service.name} (Còn: ${service.remainingQuantity})`}
//                           </Option>
//                         ))}
//                       </Select>
//                     </div>

//                     {/* Hiển thị các dịch vụ đã chọn */}
//                     {tour.booking_service_by_tours.length > 0 && (
//                       <div style={{ marginTop: '10px' }}>
//                         <h5>Dịch vụ đã chọn:</h5>
//                         {tour.booking_service_by_tours.map((service, index) => (
//                           <div
//                             key={service.id}
//                             style={{
//                               marginBottom: '10px',
//                               border: '1px solid #ddd',
//                               padding: '10px',
//                               borderRadius: '5px',
//                             }}
//                           >
//                             <h5>{service.name}</h5>
//                             <div className="service-Checkin-User">
//                               <p>
//                                 <strong>Số lượng:</strong>
//                                 <InputNumber
//                                   min={1}
//                                   max={service.remainingQuantity}
//                                   value={service.quantity}
//                                   onChange={(value) => {
//                                     handleUpdateServiceQuantity(
//                                       user.passport,
//                                       tour.id,
//                                       service.service_id,
//                                       value
//                                     )
//                                   }}
//                                 />
//                               </p>
//                               <p>
//                                 <strong>Đơn vị: </strong>
//                                 <InputNumber
//                                   value={
//                                     service.type === 'bus' ? 1 : service.unit
//                                   }
//                                   disabled={service.type === 'bus'}
//                                   onChange={(e) =>
//                                     handleUpdateServiceAttribute(
//                                       user.passport,
//                                       tour.id,
//                                       service.service_id,
//                                       'unit',
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                               </p>
//                               <p>
//                                 <strong>Giá:</strong>{' '}
//                                 {service.price.toLocaleString()} VND
//                               </p>
//                               <p>
//                                 <strong>Thời gian cung ứng : </strong>
//                                 <DatePicker
//                                   value={
//                                     service.start_time
//                                       ? dayjs(service.start_time)
//                                       : null
//                                   }
//                                   onChange={(date) =>
//                                     handleUpdateServiceAttribute(
//                                       user.passport,
//                                       tour.id,
//                                       service.service_id,
//                                       'start_time',
//                                       date
//                                         ? dayjs(date).format('YYYY-MM-DD')
//                                         : ''
//                                     )
//                                   }
//                                 />
//                                 <DatePicker
//                                   value={
//                                     service.end_time
//                                       ? dayjs(service.end_time)
//                                       : null
//                                   }
//                                   onChange={(date) =>
//                                     handleUpdateServiceAttribute(
//                                       user.passport,
//                                       tour.id,
//                                       service.service_id,
//                                       'end_time',
//                                       date
//                                         ? dayjs(date).format('YYYY-MM-DD')
//                                         : ''
//                                     )
//                                   }
//                                 />
//                               </p>
//                               <Button
//                                 type="link"
//                                 danger
//                                 onClick={() => {
//                                   if (
//                                     user.passport &&
//                                     tour.id &&
//                                     service.service_id
//                                   ) {
//                                     handleRemoveService(
//                                       user.passport,
//                                       tour.id,
//                                       service.service_id
//                                     )
//                                   } else {
//                                     console.warn(
//                                       'Thông tin không đầy đủ: passport, tour ID, hoặc service ID bị thiếu.'
//                                     )
//                                   }
//                                 }}
//                               >
//                                 Hủy chọn dịch vụ
//                               </Button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           <Button
//             type="primary"
//             onClick={() => handleCheckInSubmit(user)}
//             style={{
//               background: 'blue',
//               color: '#fff',
//               marginTop: '10px',
//             }}
//           >
//             Thanh toán riêng
//           </Button>
//         </div>
//       ))}

//       <div className="button-checkin-all">
//         <Button
//           className='button-add-user-1'
//           onClick={handleAddUser}
//         >
//           Thêm Người Dùng
//         </Button>
//         <Button
//           className="button-add-user-2"
//           onClick={() => handleCheckInSubmit()}
//           loading={loading}
//         >
//           Thanh toán chung
//         </Button>
//       </div>
//       <Bill />
//     </div>
//   )
// }

// export default UpdateBookingUserComponent
