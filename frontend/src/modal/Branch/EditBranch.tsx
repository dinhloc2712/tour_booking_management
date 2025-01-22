import { Modal, Form, Input, Select, notification, Button, Spin } from 'antd';
import { RootState, useAppDispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Branch } from 'redux/Reducer/BranchReducer';
import { updateBranch } from 'redux/API/PUT/EditBranch';
import { getBranchList } from 'redux/API/GET/GetBranch';
import { useTranslation } from 'react-i18next';

interface EditBranchProps {
  visible: boolean;
  onClose: () => void;
}

const initialState: Branch = {
  id: '',
  name: '',
  type: 'Chọn Loại'
};

const EditBranch: React.FC<EditBranchProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const typeBrach = useSelector((state: RootState) => state.typeBrach.types);
  const editingBranch = useSelector((state: RootState) => state.branch.editingBranch);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingBranch) {
      form.setFieldsValue(editingBranch);
    }
  }, [editingBranch, form]);
  const { t } = useTranslation('UpdateBranch');
  const handleSubmitUpdate = async (values: Branch) => {
    setLoading(true);
    try {
      if (editingBranch) {
        const result = await dispatch(
          updateBranch({
            id: editingBranch.id,
            body: values,
          })
        ).unwrap();
        await dispatch(getBranchList()).unwrap();
        if (result) {
          onClose();
          notification.success({
            message: "Cập nhật chi nhánh thành công",
          });
        }
      }
    } catch (error: any) {
      notification.error({
        message: 'Cập nhật thất bại',
        description: error.message || 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={t('UpdateBranch.Cập nhật Chi Nhánh')}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('UpdateBranch.Hủy')}
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
          {loading ? <Spin size="small" /> : t('UpdateBranch.Cập Nhật')}
        </Button>,
      ]}
    >
      <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
        <Form.Item label={t('UpdateBranch.Tên Chi Nhánh')} name="name" rules={[{ required: true, message: 'Vui lòng nhập Tên dịch vụ!' }]}>
          <Input placeholder={t('UpdateBranch.Tên Chi Nhánh')} />
        </Form.Item>
        <Form.Item label={t('UpdateBranch.Loại Chi Nhánh')} name="type" rules={[{ required: true, message: 'Vui lòng chọn loại chi nhánh!' }]}>
          <Select placeholder="Chọn loại chi nhánh">
            {typeBrach.map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditBranch;
