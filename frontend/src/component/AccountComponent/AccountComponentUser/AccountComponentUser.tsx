import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, notification, Skeleton, Table, Tag, theme } from "antd";
import ButtonShowModal from "component/Global/Button/ButtonModal";
import TableComponent from "component/Global/Table/TableComponent";
import EditStaff from "modal/Account/AddAccount/EditAccount";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getCustomer } from "redux/API/GET/GetCustomer";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { startEditingService } from "redux/Reducer/ServiceReducer";
import { startEditingStaff } from "redux/Reducer/StaffReducer";
import { showModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

const CustomerComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.customer.customerList);
    console.log(data);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const Customer = useSelector((state: RootState) => state.customer.customerList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);


    useEffect(() => {
        dispatch(getCustomer());
    }, [dispatch]);

    const filteredServices = Customer.filter(customer =>
        (customer.fullname && customer.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const { t } = useTranslation('user');

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
            title: t('user.phoneNumber'),
            dataIndex: ['user_detail', 'phone'],
            key: 'phone'
        },
        {
            title: t('user.birthday'),
            dataIndex: ['user_detail', 'birthday'],
            key: 'birthday'
        },
        // {
        //     title: t('user.avatar'),
        //     dataIndex: 'avatar',
        //     key: 'avtar'
        // },
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
            title: t('user.actions'),
            key: "action",
            render: (text: string, record: { id: string }) => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107' }}
                    onClick={() => {
                        dispatch(startEditingStaff(record.id));
                        setIsEditModalVisible(true);
                    }}
                >
                    Cập Nhật
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
                //await dispatch(deleteCustomer(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Dịch vụ đã được xóa thành công!',
            });
            dispatch(getCustomer());
        } catch (error) {
            notification.error({
                message: 'Xóa thất bại',
                description: 'Đã xảy ra lỗi khi xóa dịch vụ!',
            });
        } finally {
            setButtonLoading(false);
            setSkeletonLoading(false);
            setSelectedRowKeys([]);
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
            {/* <ButtonShowModal
                onDeleteClick={handleDeleteClick}
                onAddClick={handleAddAccount}
                loading={buttonLoading}
            /> */}
            <div className="button-index" style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}} >
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

export default CustomerComponent;



