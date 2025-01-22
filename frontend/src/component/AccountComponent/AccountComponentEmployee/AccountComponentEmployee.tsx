import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, notification, Skeleton, Table, Tag, theme } from "antd";
import ButtonShowModal from "component/Global/Button/ButtonModal";
import TableComponent from "component/Global/Table/TableComponent";
import EditStaff from "modal/Account/AddAccount/EditAccount";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { deleteStaff } from "redux/API/DELETE/DeleteStaff";
import { getStaff } from "redux/API/GET/GetStaff";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { startEditingStaff } from "redux/Reducer/StaffReducer";
import { showModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

const StaffComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.staff.staffList);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const user = useSelector((state: RootState) => state.auth.user);
    const Employee = useSelector((state: RootState) => state.staff.staffList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

    useEffect(() => {
        dispatch(getStaff());
    }, [dispatch]);

    const filteredServices = Employee.filter(staff =>
        (staff.fullname && staff.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const { t } = useTranslation(['user', 'button']);

    // Kiểm tra quyền
    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission);
    };
    const columns = [
        {
            title: 'STT',
            render: (text, record, index) => {
                return (currentPage - 1) * pageSize + index + 1;
            },
            key: 'id',
            width: '4%',
        },
        {
            title: t('user.name_branch'),
            dataIndex: ['branch', 'name'],
            key: "branch"
        },
        {
            title: t('user.fullname'),
            dataIndex: 'fullname',
            key: 'fullname'
        },
        {
            title: t('user.email'),
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: t('user.avatar'),
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar: string) => (
                <img
                    src={avatar}
                    alt="User"
                    style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 4, display: 'flex', margin: '0 auto' }}
                />
            )
        },
        {
            title: t('user.status'),
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active: boolean) => (
                <Tag color={is_active ? "green" : "red"}>
                    {is_active ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            )
        },
        {
            title: t('user.actions'), // Tiêu đề cột với ngôn ngữ đã dịch
            key: "action", // Khóa của cột
            render: (text: string, record: { id: string }) => ( // Hàm render cho cột hành động
                <Button
                    type="primary" // Kiểu nút
                    style={{ background: '#ffc107' }} // Màu nền của nút
                    onClick={() => { // Xử lý sự kiện click
                        dispatch(startEditingStaff(record.id)); // Gửi hành động bắt đầu chỉnh sửa nhân viên
                        setIsEditModalVisible(true); // Hiển thị modal chỉnh sửa
                    }}
                    disabled={!hasPermission('edit staff')}
                >
                    {t("user.Cập Nhật")}
                </Button>
            ),
        },
    ];

    const handleAddAccount = () => {
        dispatch(showModal('Modal Account Employee'));
    };

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
    };

    const handleDeleteClick = async () => {
        setButtonLoading(true);
        setSkeletonLoading(true);
        try {
            for (const id of selectedRowKeys) {
                await dispatch(deleteStaff(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Tài Khoản đã được xóa thành công!',
            });
            dispatch(getStaff());
        } catch (error) {
            notification.error({
                message: 'Xóa thất bại',
                description: 'Đã xảy ra lỗi khi xóa tài khoản!',
            });
        } finally {
            setButtonLoading(false);
            setSkeletonLoading(false);
            setSelectedRowKeys([]); // Reset selected rows
        }
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        columnWidth: "50px",
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSearchQuery(e.target.value));
        console.log(e.target.value);

    };
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    return (
        <div className="wrapper-layout-content">
            <div className="button-index" style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Flex gap="middle">
                    <Button
                        type="primary"
                        icon={<IoMdAdd color="#fff" size={14} />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            background: '#008000',
                            color: "#fff"
                        }}
                        onClick={handleAddAccount}
                        disabled={!hasPermission('create staff')}
                    >
                        {t("user.Thêm Mới")}
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<RiDeleteBin5Line size={18} />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            color: "#fff",
                            background: "red"
                        }}
                        onClick={handleDeleteClick}
                        loading={buttonLoading}
                        disabled={!hasPermission('delete staff') || selectedRowKeys.length === 0}
                    >
                        {t("user.Xóa")}
                    </Button>
                </Flex>
                <Input
                    placeholder="Tìm kiếm..."
                    onChange={handleSearch}
                    allowClear
                    style={{ width: 250 }}
                    prefix={<SearchOutlined />}
                />
            </div>
            {skeletonLoading ? (
                <Skeleton active />
            ) : (
                <div className="table-wrapper">
                    <Table
                        size="middle"
                        columns={columns}
                        loading={loading}
                        dataSource={filteredServices}
                        rowKey="id"
                        rowSelection={rowSelection}
                        scroll={{ y: 138.4 * 5 }}
                        style={{ overflow: 'hidden' }}
                        rowClassName={() => 'fixed-row-height'}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            onChange: handleTableChange,
                        }}
                    />
                </div>
            )}
            <EditStaff visible={isEditModalVisible} onClose={handleEditModalClose} />
        </div>
    );
};

export default StaffComponent;
