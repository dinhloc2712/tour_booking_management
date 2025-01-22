import React, { useEffect, useState } from "react";
import { Row, Col, Card, DatePicker, Select, Table, Button, Modal, Input } from "antd";
import "chart.js/auto";
import { RootState, useAppDispatch } from "redux/store";
import { useSelector } from "react-redux";
import { getStatiscalService } from "redux/API/GET/Statistical/GetStatisticalService";
import TableComponent from "component/Global/Table/TableComponent";
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { RangePicker } = DatePicker;

const StatisticsService: React.FC = () => {
    const dispatch = useAppDispatch();
    const ServiceAll = useSelector((state: RootState) => state.StatisticalServiceReducer.StatisticalService);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { t } = useTranslation(["Servicer", 'Statistical'])


    useEffect(() => {
        dispatch(getStatiscalService());
    }, [dispatch]);

    const chartData = {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5"],
        datasets: [
            {
                label: "Dịch vụ A",
                data: [30, 50, 70, 90, 100],
                borderColor: "#1890ff",
                backgroundColor: "rgba(24, 144, 255, 0.2)",
            },
            {
                label: "Dịch vụ B",
                data: [50, 40, 80, 60, 70],
                borderColor: "#52c41a",
                backgroundColor: "rgba(82, 196, 26, 0.2)",
            },
        ],
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
        },
        {
            title: "Tên dịch vụ",
            dataIndex: "serviceName",
            key: "serviceName",
        },
        {
            title: "Số lượng sử dụng",
            dataIndex: "usageCount",
            key: "usageCount",
        },
        {
            title: "Doanh thu (VND)",
            dataIndex: "revenue",
            key: "revenue",
        },
    ];

    const data = [
        {
            key: "1",
            index: 1,
            serviceName: "Dịch vụ A",
            usageCount: 150,
            revenue: "15,000,000",
        },
        {
            key: "2",
            index: 2,
            serviceName: "Dịch vụ B",
            usageCount: 120,
            revenue: "12,000,000",
        },
    ];


    const columnsAll = [
        {
            title: t("Servicer.serial_number"),
            render: (text, record, index) => {
                return (currentPage - 1) * pageSize + index + 1;
            },
            key: "id",
            width: 100,
        },
        {
            title: t("Servicer.revenue"),
            dataIndex: "revenue",
            key: "revenue",
            width: 100,
            render: (text: string) => {
                const formattedAmount = new Intl.NumberFormat("vi-VN", {
                    style: "decimal",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(Number(text));
                return `${formattedAmount} VND`;
            },
        },
        {
            title: t("Servicer.paid_amount"),
            dataIndex: "paid_amount",
            key: "paid_amount",
            width: 150,
            render: (text: string) => {
                const formattedAmount = new Intl.NumberFormat("vi-VN", {
                    style: "decimal",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(Number(text));
                return `${formattedAmount} VND`;
            },
        },
        {
            title: t("Servicer.status_debt"),
            dataIndex: "status_debt",
            key: "status_debt",
        },
        {
            title: t("Servicer.agent_details"),
            children: [
                {
                    title: t("Servicer.agent_name"),
                    render: (text, record) => record.sale_agent.name,
                    key: "name",
                },
                {
                    title: t("Servicer.agent_type"),
                    render: (text, record) => record.sale_agent.type,
                    key: "type",
                },
                {
                    title: t("Servicer.agent_phone"),
                    render: (text, record) => record.sale_agent.phone,
                    key: "phone",
                },
            ],
        },
        {
            title: t("Servicer.service_details"),
            children: [
                {
                    title: t("Servicer.service_name"),
                    render: (text, record) => (
                        <div
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 150, // Đặt giới hạn chiều rộng phù hợp
                            }}
                            title={record.debt_details.map((detail) => detail.name_service).join(", ")} // Tooltip hiển thị toàn bộ nội dung
                        >
                            {record.debt_details.map((detail) => detail.name_service).join(", ")}
                        </div>
                    ),
                    key: "name_service",
                },
                {
                    title: t("Servicer.service_price"),
                    width: 150,
                    render: (text, record) => {
                        return record.debt_details
                            .map((detail) => {
                                const formattedPrice = new Intl.NumberFormat("vi-VN", {
                                    style: "decimal",
                                    minimumFractionDigits: 0,
                                }).format(Math.floor(Number(detail.price)));
                                return `${formattedPrice} VND`;
                            })
                            .join(", ");
                    },
                    key: "price",
                },
                {
                    title: t("Servicer.service_quantity"),
                    render: (text, record) =>
                        record.debt_details.map((detail) => detail.quantity).join(", "),
                    key: "quantity",
                },
                {
                    title: t("Servicer.service_unit"),
                    render: (text, record) =>
                        record.debt_details.map((detail) => detail.unit || "N/A").join(", "),
                    key: "unit",
                },
            ],
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
    };

    const handleExportToExcel = (data: any[], fileName: string) => {
        const formatCurrency = (value: number) =>
            new Intl.NumberFormat("vi-VN", {
                style: "decimal",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);

        const exportData = data.map((record, index) => ({
            "STT": index + 1,
            "Doanh Thu (VND)": formatCurrency(record.revenue || 0),
            "Số Tiền Thanh Toán (VND)": formatCurrency(record.paid_amount || 0),
            "Trạng Thái Nợ": record.status_debt || '',
            "Tên Đại Lý": record.sale_agent?.name || '',
            "Loại Đại Lý": record.sale_agent?.type || '',
            "Số Điện Thoại": record.sale_agent?.phone || '',
            "Tên Dịch Vụ": record.debt_details.map(detail => detail.name_service).join(', ') || '',
            "Giá Dịch Vụ (VND)": record.debt_details.map(detail => {
                return formatCurrency(Math.floor(Number(detail.price)));
            }).join(', ') || '',
            "Số Lượng": record.debt_details.map(detail => detail.quantity).join(', ') || '',
            "Đơn Vị": record.debt_details.map(detail => detail.unit || 'N/A').join(', ') || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

        worksheet["!cols"] = [
            { wch: 5 },
            { wch: 20 },
            { wch: 25 },
            { wch: 25 },
            { wch: 20 },
            { wch: 25 },
            { wch: 25 },
            { wch: 30 },
            { wch: 25 },
            { wch: 20 },
            { wch: 25 },
        ];

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `${fileName}.xlsx`);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileName, setFileName] = useState("Du_Lieu_Doanh_Thu");

    const handleOk = () => {
        setIsModalOpen(false);
        if (fileName) {
            handleExportToExcel(ServiceAll, fileName);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
                <Col span={8}>
                    <RangePicker />
                </Col>
                <Col span={8}>
                    <Select placeholder="Chọn loại dịch vụ" style={{ width: "100%" }}>
                        <Option value="serviceA">Dịch vụ A</Option>
                        <Option value="serviceB">Dịch vụ B</Option>
                    </Select>
                </Col>
            </Row> */}

            {/* Biểu đồ */}
            {/* <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <h3>Biểu đồ sử dụng dịch vụ</h3>
                        <Line data={chartData} />
                    </Card>
                </Col>
            </Row> */}

            {/* Bảng thống kê */}
            {/* <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                <Col span={24}>
                    <Card>
                        <h3>Chi tiết thống kê</h3>
                        <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
                    </Card>
                </Col>
            </Row> */}


            <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                <Col span={24}>
                    <Card>
                        <h3>Dịch Vụ Tất Cả</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                            <Button type="primary" onClick={() => setIsModalOpen(true)} >
                                {t('Statistical.Xuất Excel')}
                            </Button>
                            <Modal
                                title={t('Statistical.Xuất File Excel')}
                                open={isModalOpen}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                okText={t('Statistical.Xuất')}
                                cancelText={t('Statistical.Hủy')}
                            >
                                <p>{t('Statistical.Nhập tên file')}</p>
                                <Input
                                    placeholder={t('Statistical.Nhập tên file')}
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                />
                            </Modal>

                        </div>
                        {/* <TableComponent
                            column={columnsAll}
                            data={ServiceAll}
                            loading={loading}
                            selectedRowKeys={selectedRowKeys}
                            onSelectChange={onSelectChange}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onTableChange={handleTableChange}
                        /> */}

                        <Table
                            columns={columnsAll}
                            dataSource={ServiceAll}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatisticsService;
