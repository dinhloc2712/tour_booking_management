import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, notification, Popover, Skeleton, Table, Tag, theme } from "antd";
import ButtonShowModal from "component/Global/Button/ButtonModal";
import TableComponent from "component/Global/Table/TableComponent";
import EditService from "modal/Service/EditService";
import EditTour from "modal/Tour/EditTour";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { deleteTour } from "redux/API/DELETE/DeleteTour";
import { getTour } from "redux/API/GET/GetTour";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { startEditingService } from "redux/Reducer/ServiceReducer";
import { startEditingTour } from "redux/Reducer/TourReducer";
import { showModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";


const TourComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.tour.tourList);
    console.log(data);
    const user = useSelector((state: RootState) => state.auth.user);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const Tour = useSelector((state: RootState) => state.tour.tourList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

    useEffect(() => {
        dispatch(getTour());
    }, [dispatch]);

    const filteredServices = Tour.filter(tour =>
        (tour.name && tour.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const { t } = useTranslation('tour');

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
            title: t('tour.name'),
            dataIndex: "name",
            key: "name"
        },
        {
            title: t('tour.name_branch'),
            dataIndex: ['branch', 'name'],
            key: "branch_name"
        },
        {
            title: t('tour.price_min'),
            dataIndex: "price_min",
            key: "price_min"
        },
        {
            title: t('tour.price_max'),
            dataIndex: "price_max",
            key: "price_max"
        },
        {
            title: t('tour.image'),
            dataIndex: "image",
            key: "img",
            render: (image: string) => (
                <img
                    src={image}
                    alt="Tour"
                    style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 4, display: 'flex', margin: '0 auto' }}
                />
            )
        },
        {
            title: t('tour.quantity'),
            dataIndex: "quantity",
            key: "quantity"
        },
        {
            title: t('tour.description'),
            dataIndex: "description",
            key: "description",
            width: 200,
            ellipsis: true,
            render: (text) => (
                <Popover content={<div style={{ maxWidth: 400 }}>{text}</div>} title={t('tour.description')} trigger="click">
                    <span>{text}</span>
                </Popover>
            ),
        },
        {
            title: t('tour.is_active'),
            dataIndex: "is_active",
            key: "is_active",
            render: (is_active: boolean) => (
                <Tag color={is_active ? "green" : "red"}>
                    {is_active ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            )
        },
        {
            title: t('tour.actions'),
            key: "action",
            render: (text: string, record: { id: string }) => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107' }}
                    onClick={() => {
                        dispatch(startEditingTour(record.id));
                        setIsEditModalVisible(true);
                    }}
                    disabled={!hasPermission('edit tour')}

                >
                    {t("tour.Cập Nhật")}
                </Button>
            ),
        },
    ];

    const handleAddTour = () => {
        dispatch(showModal('Modal Tour'));
    };

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
    };

    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission);
    };

    const handleDeleteClick = async () => {
        setButtonLoading(true);
        setSkeletonLoading(true);
        try {
            for (const id of selectedRowKeys) {
                await dispatch(deleteTour(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Tour đã được xóa thành công!',
            });
            dispatch(getTour());
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
                        onClick={handleAddTour}
                        disabled={!hasPermission('create tour')}
                    >
                        {t("tour.Thêm Mới")}
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
                        disabled={!hasPermission('delete tour')}
                    >
                        {t("tour.Xóa")}
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
            <EditTour visible={isEditModalVisible} onClose={handleEditModalClose} />
        </div>
    );
};

export default TourComponent; 
