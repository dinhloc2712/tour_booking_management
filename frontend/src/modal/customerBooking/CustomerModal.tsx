import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, DatePicker } from 'antd'
import { useDispatch } from 'react-redux'
import { addCustomer, updateCustomer } from 'redux/Reducer/Booking' // Import action
import { Customers } from 'redux/Reducer/Booking' // Interface Customers
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

interface CustomerModalProps {
  visible: boolean
  onCancel: () => void
  onConfirm: (values: Customers) => void
  editingCustomerIndex: number | null
  initialValues?: Customers
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  editingCustomerIndex,
  initialValues = {
    id: null,
    fullname: '',
    passport: '',
    Birthday: null,
    phone: '',
    email: '',
    address: '',
  },
}) => {
  const [customerForm] = Form.useForm()
  const { t } = useTranslation('form')
  // Effect khi modal mở và đóng
  useEffect(() => {
    if (visible) {
      if (editingCustomerIndex === null) {
        // Chế độ thêm mới: Reset form
        customerForm.resetFields();
      } else {
        // Chế độ sửa: Set giá trị vào form
        const formattedInitialValues = {
          ...initialValues,
          Birthday: initialValues?.Birthday
            ? dayjs(initialValues.Birthday, 'YYYY-MM-DD')
            : null, // Chuyển đổi birthday thành đối tượng dayjs nếu có giá trị
        };
  
        customerForm.setFieldsValue(formattedInitialValues);
      }
    }
  }, [visible, editingCustomerIndex, initialValues, customerForm]);
  
  const handleSaveCustomer = (values: Customers) => {
    console.log('Dữ liệu khách hàng trước:', values) // Log dữ liệu chưa định dạng
    const formattedValues = {
      ...values,
      Birthday: values.Birthday
        ? dayjs(values.Birthday).isValid()
          ? dayjs(values.Birthday).format('YYYY-MM-DD')
          : ''
        : '',
    }

    console.log('Dữ liệu khách hàng:', formattedValues) // Log dữ liệu đã định dạng

    onConfirm(formattedValues) // Gửi dữ liệu đã định dạng cho Redux hoặc callback

    customerForm.resetFields() // Reset form
  }

  return (
    <Modal
      title={
        editingCustomerIndex !== null
          ? t('form.Edit Customer')
          : t('form.Add Customer')
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={customerForm}
        onFinish={handleSaveCustomer}
        initialValues={initialValues}
      >
        <Form.Item
          label={t('form.fullname')}
          name="Fullname"
          // rules={[{ required: true, message: 'Please input the customer\'s fullname!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('form.Passport')}
          name="Passport"
          // rules={[{ required: true, message: 'Please input the passport number!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('form.Birthday')}
          name="Birthday"
          // rules={[
          //   { required: true, message: t('form.Please select a birthday') },
          // ]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: '100%' }}
            value={
              initialValues?.Birthday
                ? dayjs(initialValues.Birthday, 'YYYY-MM-DD')
                : null
            }
          />
        </Form.Item>

        <Form.Item
          label={t('form.phone')}
          name="Phone"
          // rules={[{ required: true, message: 'Please input the phone number!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('form.Email')}
          name="Email"
          // rules={[{ required: true, message: 'Please input the email address!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('form.address')}
          name="Address"
          // rules={[{ required: true, message: 'Please input the address!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editingCustomerIndex !== null
              ? t('form.Save Changes')
              : t('form.Add Customer')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CustomerModal
