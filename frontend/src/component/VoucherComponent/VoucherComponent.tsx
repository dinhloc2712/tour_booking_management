import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, notification, Popover, Skeleton, Table, Tag, theme } from "antd";
import ButtonShowModal from "component/Global/Button/ButtonModal";
import TableComponent from "component/Global/Table/TableComponent";
import EditService from "modal/Service/EditService";
import EditVoucher from "modal/Voucher/EditVoucher";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { deleteVoucher } from "redux/API/DELETE/DeleteVoucher";
import { getVoucherList } from "redux/API/GET/GetVoucher";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { startEditingVoucher } from "redux/Reducer/VoucherReducer";
import { showModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

const ServiceComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.voucher.voucherList);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const user = useSelector((state: RootState) => state.auth.user);
    const voucher = useSelector((state: RootState) => state.voucher.voucherList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

    useEffect(() => {
        dispatch(getVoucherList());
    }, [dispatch]);

    const filteredServices = voucher.filter(voucher =>
        (voucher.code && voucher.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission);
    };

    const { t } = useTranslation('voucher');
    const columns = [
        {
            title: 'STT',
            render: (text, record, index) => {
                return (currentPage - 1) * pageSize + index + 1; // Tính STT liên tục
            },
            key: 'id',
            width: '4%',
        },
        {
            title: t('voucher.code'),
            dataIndex: 'code',
            key: 'code'
        },
        {
            title: t('voucher.description'),
            dataIndex: 'description',
            key: 'description',
            width: 200,
            ellipsis: true,
            render: (text) => (
                <Popover content={<div style={{ maxWidth: 400 }}>{text}</div>} title={t('tour.description')}  trigger="click">
                    <span>{text}</span>
                </Popover>
            ),
        },
        {
            title: t('voucher.type_voucher'),
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: t('voucher.value'),
            dataIndex: 'value',
            key: 'value'
        },
        {
            title: t('voucher.quantity'),
            dataIndex: 'quantity',
            key: 'quantity'
        },
        {
            title: t('voucher.start_day'),
            dataIndex: 'start_time',
            key: 'start_time'
        },
        {
            title: t('voucher.end_day'),
            dataIndex: 'end_time',
            key: 'end_time'
        },
        {
            title: t('voucher.status'),
            dataIndex: "is_active",
            key: "is_active",
            render: (is_active: boolean) => (
                <Tag color={is_active ? "green" : "red"}>
                    {is_active ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            )
        },
        {
            title: t('voucher.actions'),
            key: "action",
            render: (text: string, record: { id: string }) => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107' }}
                    onClick={() => {
                        dispatch(startEditingVoucher(record.id));
                        setIsEditModalVisible(true);
                    }}
                    disabled={!hasPermission('edit voucher')}
                >
                    {t('voucher.Cập Nhật')}
                </Button>
            ),
        },
    ];

    const handleAddVoucher = () => {
        dispatch(showModal('Modal Voucher'));
    };

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
    };

    const handleDeleteClick = async () => {
        setButtonLoading(true);
        setSkeletonLoading(true);
        try {
            for (const id of selectedRowKeys) {
                await dispatch(deleteVoucher(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Khuyến mãi đã được xóa thành công!',
            });
            dispatch(getVoucherList());
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
            <div className="button-index" style={{ padding: '10px 0', display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
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
                        onClick={handleAddVoucher}
                        disabled={!hasPermission('create voucher')}
                    >
                        {t("voucher.Thêm Mới")}
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
                        disabled={!hasPermission('delete voucher')}
                    >
                        {t("voucher.Xóa")}
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

            <EditVoucher visible={isEditModalVisible} onClose={handleEditModalClose} /> {/* Hiển thị modal chỉnh sửa */}
        </div>
    );
};

export default ServiceComponent; // Xuất component
