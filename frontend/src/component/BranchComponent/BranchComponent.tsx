import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, notification, Skeleton, Table, Tag, theme } from "antd";
import TableComponent from "component/Global/Table/TableComponent";
import EditBranch from "modal/Branch/EditBranch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { deleteBranch } from "redux/API/DELETE/DeleteBranch";
import { getBranchList } from "redux/API/GET/GetBranch";
import { startEditingBranch } from "redux/Reducer/BranchReducer";
import { setSearchQuery } from "redux/Reducer/SearchReducer";
import { showModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";

const BranchComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const data = useSelector((state: RootState) => state.branch.branchList);
    const user = useSelector((state: RootState) => state.auth.user); // Lấy thông tin user từ Redux
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const branch = useSelector((state: RootState) => state.branch.branchList);
    const searchQuery = useSelector((state: RootState) => state.SearchReducer.query);

    useEffect(() => {
        if (user) {
            dispatch(getBranchList());
        }
    }, [dispatch, user]);

    const filteredServices = branch.filter(branch =>
        (branch.name && branch.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const { t } = useTranslation(['branch', 'button']);

    // Kiểm tra quyền
    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission);
    };

    const handleAddBranch = () => {
        if (!hasPermission('add branch')) {
            notification.error({
                message: 'Không có quyền',
                description: 'Bạn không có quyền thêm chi nhánh!',
            });
            return;
        }
        dispatch(showModal('Modal Branch')); // Mở modal thêm chi nhánh
    };

    const handleDeleteClick = async () => {
        if (!hasPermission('delete branch')) {
            notification.error({
                message: 'Không có quyền',
                description: 'Bạn không có quyền xóa chi nhánh!',
            });
            return;
        }

        if (selectedRowKeys.length === 0) {
            notification.warning({
                message: 'Chưa chọn dòng',
                description: 'Vui lòng chọn ít nhất một dòng để xóa!',
            });
            return;
        }

        setButtonLoading(true);
        setSkeletonLoading(true);
        try {
            for (const id of selectedRowKeys) {
                await dispatch(deleteBranch(id as string)).unwrap();
            }
            notification.success({
                message: 'Xóa thành công',
                description: 'Chi nhánh đã được xóa thành công!',
            });
            dispatch(getBranchList());
        } catch (error) {
            notification.error({
                message: 'Xóa thất bại',
                description: 'Đã xảy ra lỗi khi xóa chi nhánh!',
            });
        } finally {
            setButtonLoading(false);
            setSkeletonLoading(false);
            setSelectedRowKeys([]); // Reset selected rows
        }
    };

    const columns = [
        {
            title: 'STT',
            render: (text, record, index) => {
                return (currentPage - 1) * pageSize + index + 1;
            },
            key: 'id',
            width: '10%',
        },
        {
            title: t('branch.name'),
            dataIndex: 'name',
            key: 'name',
            width: '35%',
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: t('branch.type'),
            dataIndex: 'type',
            key: 'type',
            width: '35%',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: t('branch.actions'),
            key: 'action',
            width: '20%',
            render: (text: string, record: { id: string }) => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107', color: 'white' }}
                    onClick={() => {
                        dispatch(startEditingBranch(record.id));
                        setIsEditModalVisible(true);
                    }}

                    disabled={!hasPermission('edit branch')}

                >
                    {t('branch.Cập Nhật')}
                </Button>
            ),
        },
    ];

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
                        onClick={handleAddBranch}
                        disabled={!hasPermission('create branch')}
                    >
                        {t("branch.Thêm Mới")}
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
                        disabled={!hasPermission('delete branch') || selectedRowKeys.length === 0}
                    >
                        {t("branch.Xóa")}
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
            <EditBranch visible={isEditModalVisible} onClose={() => setIsEditModalVisible(false)} />
        </div>
    );
};

export default BranchComponent;
