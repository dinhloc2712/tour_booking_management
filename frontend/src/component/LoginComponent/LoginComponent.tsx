import { Modal, Input, Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authLogin, authLogout } from 'redux/API/POST/AuthThunks';
import { AppDispatch, RootState } from 'redux/store';
import LogoLogin from 'assets/images/1.png';

const LoginComponent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();
    const loading = useSelector((state: RootState) => state.auth.loading);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleForgotPassword = async () => {
        if (!forgotEmail.trim()) {
            notification.error({
                message: 'Vui lòng nhập email để đặt lại mật khẩu',
            });
            return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/password/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotEmail }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                notification.error({
                    message: 'Lỗi',
                    description: data.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.',
                });
            } else {
                // Hiển thị thông báo với link reset mật khẩu
                notification.success({
                    message: 'Thành công',
                    description: (
                        <>
                            Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.
                            <br />
                            <a href={data.reset_link} target="_blank" rel="noopener noreferrer">Click here to reset your password</a>
                        </>
                    ),
                });
                setIsModalVisible(false);
            }
        } catch (error) {
            // Lỗi kết nối
            notification.error({
                message: 'Lỗi kết nối',
                description: 'Không thể kết nối đến API. Vui lòng thử lại.',
            });
        }
    };
    


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            notification.error({
                message: 'Vui lòng nhập đầy đủ thông tin',
            });
            return;
        }

        try {
            const resultAction = await dispatch(authLogin({ email, password }));

            if (authLogin.fulfilled.match(resultAction)) {
                notification.success({
                    message: 'Đăng nhập thành công',
                    description: `Chào mừng, ${resultAction.payload.fullname}!`,
                });
                navigate('/home');
            } else {
                notification.error({
                    message: resultAction.payload || 'Tài khoản hoặc mật khẩu không chính xác.',
                });
                setPassword('');
            }
        } catch (err) {
            console.error('Đăng nhập thất bại:', err);
        }
    };

    return (
        <>
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="row border rounded-5 p-3 bg-white shadow box-area">
                    <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box" style={{ background: '#103cbe' }}>
                        <div className="featured-image mb-3">
                            <img src={LogoLogin} className="img-fluid" style={{ width: 250 }} />
                        </div>
                        <p className="text-white fs-2" style={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 600 }}>Be Verified</p>
                        <small className="text-white text-wrap text-center" style={{ width: '17rem', fontFamily: '"Courier New", Courier, monospace' }}>Join experienced Designers on this platform.</small>
                    </div>
                    <div className="col-md-6 right-box">
                        <form onSubmit={handleLogin}>
                            <div className="row align-items-center">
                                <div className="header-text mb-4">
                                    <h2>Hello, Again</h2>
                                    <p>We are happy to have you back.</p>
                                </div>
                                <div className="input-group mb-3">
                                    <input type="email"
                                        className="form-control form-control-lg bg-light fs-6"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-1">
                                    <input type="password"
                                        className="form-control form-control-lg bg-light fs-6"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-5 d-flex justify-content-between">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="formCheck" />
                                        <label htmlFor="formCheck" className="form-check-label text-secondary"><small>Remember Me</small></label>
                                    </div>
                                    <div className="forgot">
                                        <small><a href="#" onClick={() => setIsModalVisible(true)}>Forgot Password?</a></small>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                    <button className="btn btn-lg btn-primary w-100 fs-6" disabled={loading}>
                                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Modal
                title="Quên mật khẩu"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <p>Vui lòng nhập email của bạn để đặt lại mật khẩu:</p>
                <Input
                    type="email"
                    placeholder="Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                />
                <Button
                    type="primary"
                    className="mt-3"
                    onClick={handleForgotPassword}
                    block
                >
                    Xác nhận
                </Button>
            </Modal>

        </>
    );
};

export default LoginComponent;
