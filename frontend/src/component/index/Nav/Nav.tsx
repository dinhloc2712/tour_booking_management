import { Button, Dropdown, Flex, MenuProps, notification, Popover, Modal, Form, Input, Select, Spin, Upload, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { setDarkMode, toggleDarkMode } from 'redux/Redux/DarkMode/DarkMode';
import { showModal } from 'redux/Redux/modal/modalSlice';
import { RootState, useAppDispatch } from 'redux/store';
import { useTranslation } from 'react-i18next';
import { authLogout } from 'redux/API/POST/AuthThunks';
import { useNavigate } from 'react-router-dom';
import { vnFlag, enFlag } from 'assets/image';
import { startEditingStaff } from 'redux/Reducer/StaffReducer';
import { updateStaff } from 'redux/API/PUT/EditStaff';
import { getStaff } from 'redux/API/GET/GetStaff';
import { fetchBranchRoleData } from 'redux/Reducer/TypeCustomerReducer';
import { changePassword } from 'redux/Reducer/ChangePassword';
import { USERImage } from 'assets/image';

interface User {
  id: any;
  fullname: any;
  avatar: any;
  role: any;
  branch_id: any;
}

const Nav: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useSelector((state: RootState) => state.darkMokde.darkMode);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const { roles, branches, error } = useSelector((state: RootState) => state.typeBranchAndRole);
  const { t } = useTranslation('Updateuser')

  useEffect(() => {
    dispatch(fetchBranchRoleData());
  }, [dispatch]);

  const handleUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      message.error('Bạn chỉ có thể tải lên các tệp hình ảnh (jpeg, png, jpg, gif)!');
      return;
    }

    const cloudName = 'dpdx2qktg';
    const uploadPreset = 'upload';
    const apiKey = '878578594343584';

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
        setPreviewImage(data.secure_url);
        return data.secure_url;
      } else {
        message.error(`Tải lên không thành công: ${data.error.message}`);
      }
    } catch (error) {
      message.error('Tải lên hình ảnh thất bại');
    }
  };

  // Lấy thông tin người dùng từ localStorage
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUser(userData);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(authLogout()).unwrap();
      notification.success({
        message: 'Đăng xuất thành công',
      });
      navigate('/');
    } catch (error) {
      notification.error({
        message: 'Đăng xuất thất bại',
      });
    }
  };

  // Ngôn ngữ
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng: 'en' | 'vi') => {
    i18n.changeLanguage(lng);
  };

  const content = (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Button style={{ width: '100%' }} onClick={() => changeLanguage('en')}>
          English
        </Button>
      </div>
      <div>
        <Button onClick={() => changeLanguage('vi')}>Việt Nam</Button>
      </div>
    </div>
  );

  const handleAccountClick = () => {
    setIsModalVisible(true);
  };

  const handleChangePassword = () => {
    setIsModalChangePasswword(true);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Flex gap="middle">
          <Button style={{ all: 'unset', cursor: 'default' }} type="primary">
            {user?.fullname}
          </Button>
        </Flex>
      ),
    },
    {
      key: '2',
      label: (
        <Flex gap="middle">
          <Button style={{ all: 'unset', width: "150px" }} type="primary" onClick={handleAccountClick}>
            {t('Updateuser.Thông Tin Tài Khoản')}
          </Button>
        </Flex>
      ),
    },

    {
      key: '3',
      label: (
        <Flex gap="middle">
          <Button style={{ all: 'unset' }} type="primary" onClick={handleChangePassword}>
            {t('Updateuser.Đổi Mật Khẩu')}
          </Button>
        </Flex>
      ),
    },

    {
      key: '4',
      label: (
        <Flex gap="middle">
          <Button style={{ all: 'unset' }} type="primary" onClick={() => handleLogout()}>
            {t('Updateuser.Đăng Xuất')}
          </Button>
        </Flex>
      ),
    },
  ];
  const [isModalChangePasswword, setIsModalChangePasswword] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      form.setFieldsValue({
        fullname: parsedUser.fullname,
        email: parsedUser.email,
        avatar: parsedUser.avatar,
        status: parsedUser.status,
        branch_id: parsedUser.branch_id,
        phone: parsedUser.phone,
        phone_relative: parsedUser.phone_relative,
        roles: parsedUser.role,
      });
    }
  }, [form]);
  const handleSubmitUpdate = async (values: any) => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        notification.error({
          message: 'Không tìm thấy thông tin người dùng',
          description: 'Vui lòng đăng nhập lại.',
        });
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id;

      const updatedValues = {
        ...values,
        roles: Array.isArray(values.roles) ? values.roles.join(',') : values.roles,
        avatar: imageUrl,
      };

      console.log('Data being sent to the API:', updatedValues);

      const result = await dispatch(
        updateStaff({
          id: userId,
          body: updatedValues,
        })
      ).unwrap();

      const updatedUser = {
        ...parsedUser,
        ...updatedValues,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (result) {
        notification.success({
          message: 'Cập nhật tài khoản thành công',
        });
      }
    } catch (error: any) {
      console.error('Error during API request:', error);
      notification.error({
        message: 'Cập nhật thất bại',
        description: error.message || 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleOk = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      notification.error({
        message: 'Mật khẩu xác nhận không khớp!',
      });
      return;
    }

    setLoading(true);

    try {
      // Gọi action changePassword và kiểm tra kết quả
      const response = await dispatch(changePassword({
        passwordCurrent: currentPassword,
        passwordNew: newPassword,
        passwordNew_confirmation: confirmPassword,
      })).unwrap();

      // Hiển thị thông báo thành công
      notification.success({
        message: 'Đổi mật khẩu thành công!',
      });

      setIsModalChangePasswword(false);
    } catch (error: any) {
      if (error.message === 'Mật khẩu cũ không đúng!') {
        notification.error({
          message: 'Mật khẩu cũ không đúng!',
        });
      } else {
        // Các lỗi khác
        notification.error({
          message: 'Đổi mật khẩu thất bại',
          description: error.message || 'Mật khẩu cũ không chính xác',
        });
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <div className="header_right">
        <div className="header_icon">
          <div className="changeLanguage">
            <Popover content={content}>
              <Button className="language-button">
                <img
                  src={currentLanguage === 'vi' ? vnFlag : enFlag}
                  alt={currentLanguage === 'vi' ? 'Vietnam Flag' : 'UK Flag'}
                  style={{ width: '27px', height: '20px' }}
                  className="flagIcon"
                />
                {currentLanguage === 'vi' ? 'Tiếng Việt' : 'English'}
              </Button>
            </Popover>
          </div>
        </div>
        <div style={{ lineHeight: '35px' }}>
          <Dropdown menu={{ items }} placement="bottom" arrow={{ pointAtCenter: true }}>
            <img
              style={{ borderRadius: '50%', cursor: 'pointer', width: '60px' }}
              width={'50px'}
              src={user?.avatar || USERImage}
            />
          </Dropdown>
        </div>
      </div>

      <Modal
        title={t('Updateuser.Thông Tin Tài Khoản')}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            {t('Updateuser.Đóng')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
            {loading ? <Spin size="small" /> : t('Updateuser.Cập Nhật')}
          </Button>
        ]}
      >
        <Form form={form} onFinish={handleSubmitUpdate} layout="vertical">
          <Form.Item label={t('Updateuser.Tên tài khoản')} name="fullname" rules={[{ required: true, message: 'Vui lòng nhập Tên tài khoản!' }]}>
            <Input placeholder={t('Updateuser.Tên tài khoản')} />
          </Form.Item>
          <Form.Item label={t('Updateuser.Tên Email')} name="email" rules={[{ required: true, message: 'Vui lòng nhập tên email!' }]}>
            <Input type="email" placeholder={t('Updateuser.Tên Email')} />
          </Form.Item>
          <Form.Item label={t('Updateuser.Số Điện Thoại')} name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input type="text" placeholder="Số Điện Thoại" />
          </Form.Item>
          <Form.Item label={t('Updateuser.Số Điện Thoại Người Thân')} name="phone_relative" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại người thân!' }]}>
            <Input type="text" placeholder={t('Updateuser.Số Điện Thoại Người Thân')} />
          </Form.Item>
          <div className='upload' style={{ width: "100%" }}>
            <Form.Item label={t('Updateuser.Avatar')}>
              <Upload
                style={{ width: "100%" }}
                beforeUpload={(file) => {
                  setPreviewImage(URL.createObjectURL(file));
                  handleUpload(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button style={{ width: "100%" }}>{t('Updateuser.Chọn Avatar')}</Button>
              </Upload>

              <div style={{ marginTop: "10px" }}>
                {previewImage ? (
                  <div>
                    <img
                      src={previewImage}
                      alt="Avatar Preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  user?.avatar && (
                    <div>
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  )
                )}
              </div>
            </Form.Item>
          </div>
          <Form.Item label={t('Updateuser.Chi Nhánh')} name="branch_id" rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}>
            <Select placeholder={t('Updateuser.Chi Nhánh')}>
              {branches.map((branch) => (
                <Select.Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={t('Updateuser.Phân Quyền')} name="roles" rules={[{ required: true, message: 'Vui lòng chọn phân quyền' }]}>
            <Select placeholder={t('Updateuser.Phân Quyền')}>
              {roles.map((role) => (
                <Select.Option key={role} value={role}>
                  {role}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('Updateuser.Thông Tin Tài Khoản')}
        visible={isModalChangePasswword}
        onCancel={() => setIsModalChangePasswword(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalChangePasswword(false)}>
            {t('Updateuser.Đóng')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
            {loading ? <Spin size="small" /> : t('Updateuser.Cập Nhật')}
          </Button>
        ]}
      >
        <Form form={form} onFinish={handleOk} layout="vertical"

          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
        >
          <Form.Item
            label={t('Updateuser.Mật khẩu hiện tại')}
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label={t('Updateuser.Mật khẩu mới')}
            name="newPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label={t('Updateuser.Xác nhận mật khẩu mới')}
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Nav;
