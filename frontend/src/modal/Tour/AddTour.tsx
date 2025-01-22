import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Input, Modal, Select, Upload, message, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getTour } from 'redux/API/GET/GetTour';
import { getService } from 'redux/API/GET/getService/GetService';
import { Service } from 'redux/Reducer/ServiceReducer';
import { Tour } from 'redux/Reducer/TourReducer';
import { getBranchList } from 'redux/API/GET/GetBranch';
import { hideModal } from 'redux/Redux/modal/modalSlice';
import { useAppDispatch } from 'redux/store';
import { addTour } from 'redux/API/POST/PostTour';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface CustomModalProps {
  idModal: any;
}

const TourList: React.FC<CustomModalProps> = ({ idModal }) => {
  const dispatch = useAppDispatch();
  const showModalTour = useSelector((state: any) => state.modal.modals[idModal]);
  const services = useSelector((state: any) => state.service.serviceList);
  const branches = useSelector((state: any) => state.branch.branchList);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedServicePrices, setSelectedServicePrices] = useState<{ [key: string]: number }>({});

  const { t } = useTranslation("Addtour");

  useEffect(() => {
    dispatch(getTour());
    dispatch(getService());
    dispatch(getBranchList());
  }, [dispatch]);

  const handleServiceChange = (selectedServices: string[]) => {
    const newServicePrices: { [key: string]: number } = {};
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id.toString() === serviceId);
      if (service) {
        newServicePrices[serviceId] = service.price;
      }
    });
    setSelectedServicePrices(newServicePrices);
  };

  const handleUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      message.error('Bạn chỉ có thể tải lên các tệp hình ảnh (jpeg, png, jpg, gif)!');
      return;
    }

    const cloudName = 'datd0sl75';
    const uploadPreset = 'upload';
    const apiKey = '975853734376446';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', apiKey);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.secure_url);
      } else {
        message.error(`Tải lên không thành công: ${data.error.message}`);
      }
    } catch (error) {
      message.error('Tải lên hình ảnh thất bại');
    }
  };

  const handleCreateTour = async (values: any) => {
    const selectedServices = values.services.map((serviceId: string) => {
      const service = services.find((s: Service) => s.id.toString() === serviceId);
      return {
        id: service?.id,
        name: service?.name,
        price: selectedServicePrices[serviceId] || 0,
      };
    });

    const newTour: Omit<Tour, 'id'> = {
      name: values.name,
      price_min: parseFloat(values.price_min),
      price_max: parseFloat(values.price_max),
      quantity: parseInt(values.quantity, 10),
      description: values.description,
      is_active: true,
      branch_id: values.branch,
      services: selectedServices,
      tour_schedules: [],
      tour_gallery: [],
      branch: "",
      image: imageUrl,
    };

    try {
      setLoading(true);
      await dispatch(addTour(newTour)).unwrap();
      notification.success({
        message: 'Created tour successfully'
      });
      form.resetFields();
      setImageUrl('');
      setPreviewImage(null);
      setSelectedServicePrices({});
      dispatch(hideModal(idModal));
      dispatch(getTour());
    } catch (error) {
      message.error('Failed to create tour.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelModalTour = () => {
    form.resetFields();
    setImageUrl('');
    setPreviewImage(null);
    setSelectedServicePrices({});
    dispatch(hideModal(idModal));
  };

  return (
    <div>
      <Modal
        title={t("Addtour.Add New Tour")}
        open={showModalTour}
        onCancel={handleCancelModalTour}
        footer={[
          <Button key="cancel" onClick={handleCancelModalTour}>
            Hủy
          </Button>,
          <Button key="submit" onClick={() => form.submit()} type="primary" htmlType="submit" loading={loading}>
            Thêm Mới
          </Button>
        ]}
      >
        <div className="form_tour">
          <Form form={form} onFinish={handleCreateTour}>
            <Form.Item label={t("Addtour.Tour Name")} name="name" rules={[{ required: true, message: 'Please enter the tour name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t("Addtour.Price Min")} name="price_min" rules={[{ required: true, message: 'Please enter the minimum price!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t("Addtour.Price Max")} name="price_max" rules={[{ required: true, message: 'Please enter the maximum price!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t("Addtour.Quantity")} name="quantity" rules={[{ required: true, message: 'Please enter the quantity!' }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item label={t("Addtour.Description")} name="description" rules={[{ required: true, message: 'Please enter the description!' }]}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item label={t("Addtour.Services")} name="services" rules={[{ required: true, message: 'Please select at least one service!' }]}>
              <Select mode="multiple" placeholder="Services" onChange={handleServiceChange}>
                {services.map(service => (
                  <Option key={service.id} value={service.id.toString()}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              {Object.entries(selectedServicePrices).map(([serviceId, price]) => (
                <div key={serviceId} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ width: '111px' }}>{services.find(s => s.id.toString() === serviceId)?.name}:</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={e =>
                      setSelectedServicePrices({
                        ...selectedServicePrices,
                        [serviceId]: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
            </Form.Item>
            <Form.Item label={t("Addtour.Upload Image")} rules={[{ required: true, message: 'Please upload an image!' }]}>
              <Upload
                beforeUpload={file => {
                  setPreviewImage(URL.createObjectURL(file));
                  handleUpload(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Input type="file" name="image" />
              </Upload>
            </Form.Item>
            {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100px', marginTop: 10, marginBottom: 10 }} />}
            <Form.Item label={t("Addtour.Branch")} name="branch" rules={[{ required: true, message: 'Please select a branch!' }]}>
              <Select placeholder="Select Branch">
                {branches.map(branch => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TourList;
