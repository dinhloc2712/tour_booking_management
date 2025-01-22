import { Button, Flex, Input, notification, Popover, Skeleton, Tag, theme } from "antd";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { deleteService } from "redux/API/DELETE/DeleteService";
import { getService } from "redux/API/GET/getService/GetService";
import { startEditingService } from "redux/Reducer/ServiceReducer";
import { RootState, useAppDispatch } from "redux/store";
import TableComponent from "component/Global/Table/TableComponent";
import EditService from "modal/Service/EditService";
import Table, { ColumnsType } from "antd/es/table";
import { showModal } from "redux/Redux/modal/modalSlice";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { SearchOutlined } from "@ant-design/icons";

const ServiceComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.service.serviceList);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const user = useSelector((state: RootState) => state.auth.user);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const services = useSelector((state: RootState) => state.service.serviceList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

    useEffect(() => {
        if (user) {
            setSkeletonLoading(true);
            dispatch(getService()).finally(() => {
                setSkeletonLoading(false);
            });
        }
    }, [dispatch, user]);

    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission);
    };

    const filteredServices = services.filter(service =>
        (service.name && service.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const { t } = useTranslation('service');

    const formatCurrency = (value) => {
        const numericValue = Number(value);
        if (!isNaN(numericValue)) {
            return numericValue.toLocaleString('vi-VN', { 
                style: 'currency', 
                currency: 'VND',
                currencyDisplay: 'code'
            });
        }
        return '0 VND'; 
    }
    

    const columns = [
        {
            title: 'STT',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
            key: 'id',
            width: '10%',
        },
        {
            title: t('service.name'),
            dataIndex: 'name',
            key: 'name',
            width: '25%',
        },
        {
            title: t('service.price'),
            dataIndex: 'price',
            key: 'price',
            width: '10%',
            render: (price) => formatCurrency(price),
        },
        {
            title: t('service.type'),
            dataIndex: 'type',
            key: 'type',
            width: '10%',
        },
        {
            title: t('service.description'),
            dataIndex: 'description',
            key: 'description',
            width: '25%',
            ellipsis: true,
            render: (text) => (
                <Popover content={<div style={{ maxWidth: 400 }}>{text}</div>} title="Description" trigger="click">
                    <span>{text}</span>
                </Popover>
            ),
        },
        {
            title: t('service.status'),
            dataIndex: "is_active",
            key: "is_active",
            width: '10%',
            render: (is_active: boolean) => (
                <Tag color={is_active ? "green" : "red"}>
                    {is_active ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            )
        },
        {
            title: t('service.actions'),
            key: "action",
            width: '10%',
            render: (text: string, record: { id: string }) => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107', color: 'white' }}
                    onClick={() => {
                        if (!hasPermission('edit service')) {
                            notification.error({
                                message: 'Không có quyền',
                                description: 'Bạn không có quyền chỉnh sửa dịch vụ!',
                            });
                            return;
                        }
                        dispatch(startEditingService(record.id));
                        setIsEditModalVisible(true);
                    }}
                    disabled={!hasPermission('edit service')}
                >
                    {t('service.Cập Nhật')}
                </Button>
            ),
        },
    ];

    const handleAddService = () => {
        dispatch(showModal('Modal Service'))
    }

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
    };

    const handleDeleteClick = async () => {
        if (!hasPermission('delete service')) {
            notification.error({
                message: 'Không có quyền',
                description: 'Bạn không có quyền xóa dịch vụ!',
            });
            return;
        }
        setButtonLoading(true);
        setSkeletonLoading(true);
        try {
            for (const id of selectedRowKeys) {
                await dispatch(deleteService(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Dịch vụ đã được xóa thành công!',
            });
            dispatch(getService());
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

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current || 1);
        setPageSize(pagination.pageSize || 10);
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
                            padding: "20px",
                            background: "#008000",
                            color: "#fff"
                        }}
                        onClick={handleAddService}
                        disabled={!hasPermission('create service')}
                    >
                        {t("service.Thêm Mới")}
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<RiDeleteBin5Line size={18} />}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: "20px",
                            background: "red",
                            color: "white",
                        }}
                        onClick={handleDeleteClick}
                        loading={buttonLoading}
                        disabled={!hasPermission('delete service')}
                    >
                        {t("service.Xóa")}
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

            <EditService
                visible={isEditModalVisible}
                onClose={handleEditModalClose}
            />
        </div>
    );
};

export default ServiceComponent;
