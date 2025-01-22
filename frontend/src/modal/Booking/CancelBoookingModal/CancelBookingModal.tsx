import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from 'redux/store';
import { Modal, Button, Input } from 'antd';
import { hideModal } from 'redux/Redux/modal/modalSlice';
import { CancelBooking } from 'redux/API/DELETE/CacelBooking';
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'

interface CustomModalProps {
  id: any;
}

const CancelBookingModal: React.FC<CustomModalProps> = ({ id }) => {
  const dispatch: AppDispatch = useDispatch();
  const showModalCancel = useSelector((state: RootState) => state.modal.modals[id]);

  // Lấy dữ liệu currentBooking từ Redux store
  const currentBooking = useSelector((state: RootState) => state.booking.currentBooking);
  
  // Trạng thái lưu trữ ghi chú
  const [note, setNote] = useState<string>('');

  const handleCancelModal = () => {
    // Kiểm tra nếu currentBooking có dữ liệu
    if (currentBooking && currentBooking.booking_id) {
      const bookingID = currentBooking.booking_id;
      // Gửi yêu cầu hủy booking lên server
      dispatch(CancelBooking({
        bookingID,
        note
      }))
        .unwrap()  // unwrap để lấy kết quả từ action async
        .then(() => {
          // Sau khi hủy thành công, gọi lại API để cập nhật danh sách booking
          dispatch(getBooking()); // Lấy lại danh sách booking sau khi hủy
          dispatch(hideModal(id)); // Đóng modal sau khi thực hiện xong
        })
        .catch((error) => {
          // Xử lý lỗi nếu có
          console.error('Lỗi khi hủy booking:', error);
        });
    } else {
      console.error('Không có thông tin booking hiện tại.');
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value); // Cập nhật giá trị ghi chú khi người dùng thay đổi
  };

  return (
    <div>
      <Modal
        open={showModalCancel}
        title="Hủy Booking"
        onCancel={handleCancelModal}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={handleCancelModal} type="primary" danger>
            Xác nhận hủy
          </Button>,
        ]}
      >
        <div>
          <p>Are you sure you want to cancel this booking?</p>
          
          {/* Trường nhập ghi chú lý do hủy */}
          <div style={{ marginTop: 20 }}>
            <label>Lý do hủy tour:</label>
            <Input.TextArea
              value={note}
              onChange={handleNoteChange}
              rows={4} // Số dòng hiển thị cho TextArea
              placeholder="Vui lòng nhập lý do hủy booking tại đây"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CancelBookingModal;
