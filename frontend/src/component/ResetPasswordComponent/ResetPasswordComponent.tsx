import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notification } from 'antd';

const ResetPasswordComponent: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy token từ URL
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (!token) {
        notification.error({
            message: 'Lỗi',
            description: 'Token không hợp lệ hoặc đã hết hạn.',
        });
        navigate('/');
        return null;  // Ensure nothing is rendered if token is missing
    }

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng nhập đầy đủ thông tin!',
            });
            return;
        }

        if (password !== confirmPassword) {
            notification.error({
                message: 'Lỗi',
                description: 'Mật khẩu xác nhận không khớp!',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                notification.error({
                    message: 'Lỗi',
                    description: data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.',
                });
            } else {
                notification.success({
                    message: 'Thành công',
                    description: 'Mật khẩu của bạn đã được đặt lại thành công!',
                });
                navigate('/login'); // Navigate to login page after success
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi kết nối',
                description: 'Không thể kết nối đến API. Vui lòng thử lại.',
            });
        } finally {
            setLoading(false);  // Hide loading state once the process is done
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Đặt lại mật khẩu</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleResetPassword();
                }}
            >
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordComponent;
