import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, notification, Skeleton, Table, Tag, theme } from "antd";
import ButtonShowModal from "component/Global/Button/ButtonModal";
import TableComponent from "component/Global/Table/TableComponent";
import EditSource from "modal/Source/SourceService/EditSource";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { deleteSource } from "redux/API/DELETE/DeleteSource";
import { GetSourceService } from "redux/API/GET/GetSourceService";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { startEditingSource } from "redux/Reducer/SourceReducer";
import { showModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

const SourceComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.source.sourceList);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số dòng mỗi trang, có thể thay đổi
    const user = useSelector((state: RootState) => state.auth.user);
    const source = useSelector((state: RootState) => state.source.sourceList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

    useEffect(() => {
        dispatch(GetSourceService());
    }, [dispatch]);

    const filteredServices = source.filter(source =>
        (source.name && source.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission);
    };

    const { t } = useTranslation('source');

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
            title: t('source.name'),
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: t('source.email'),
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: t('source.phone'),
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: t('source.address'),
            dataIndex: 'address',
            key: 'address'
        },
        {
            title: t('source.type'),
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: t('source.status'),
            dataIndex: "is_active",
            key: "is_active",
            render: (is_active: boolean) => (
                <Tag color={is_active ? "green" : "red"}>
                    {is_active ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            )
        },
        {
            title: t('source.actions'),
            key: "action",
            render: (text: string, record: { id: string }) => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107' }}
                    onClick={() => {
                        dispatch(startEditingSource(record.id));
                        setIsEditModalVisible(true);
                    }}
                    disabled={!hasPermission('edit agent')}

                >
                    {t('source.Cập Nhật')}
                </Button>
            ),
        },
    ];

    const handleAddSource = () => {
        dispatch(showModal('Modal Source'));
    };

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
    };

    const handleDeleteClick = async () => {
        setButtonLoading(true);
        setSkeletonLoading(true);
        try {
            for (const id of selectedRowKeys) {
                await dispatch(deleteSource(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Nguồn đã được xóa thành công!',
            });
            dispatch(GetSourceService());
        } catch (error) {
            notification.error({
                message: 'Xóa thất bại',
                description: 'Đã xảy ra lỗi khi xóa nguồn!',
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
                        onClick={handleAddSource}
                        disabled={!hasPermission('create agent')}
                    >
                        {t("source.Thêm Mới")}
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
                        disabled={!hasPermission('delete agent')}
                    >
                        {t("source.Xóa")}
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
            <EditSource visible={isEditModalVisible} onClose={handleEditModalClose} />
        </div>
    );
};

export default SourceComponent; 
