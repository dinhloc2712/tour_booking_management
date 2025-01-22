import React, { useState, useEffect } from "react";
import { Table, Input } from "antd";

// Định nghĩa kiểu dữ liệu cho props của component
interface TableColumn {
    column: any; // Cột của bảng
    data: any; // Dữ liệu để hiển thị trong bảng
    loading: boolean; // Trạng thái loading của bảng
    selectedRowKeys: React.Key[]; // Các key của hàng được chọn
    onSelectChange: (selectedRowKeys: React.Key[]) => void; // Hàm xử lý khi thay đổi lựa chọn hàng
    currentPage: number; // Trang hiện tại
    pageSize: number; // Số dòng mỗi trang
    onTableChange: (pagination: any) => void; // Hàm xử lý khi phân trang thay đổi
}

const TableComponent: React.FC<TableColumn> = ({
    column,
    data,
    loading,
    selectedRowKeys,
    onSelectChange,
    onTableChange,
}) => {
    // const [searchQuery, setSearchQuery] = useState(""); 
    const [filteredData, setFilteredData] = useState(data); 

    // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const query = e.target.value;
    //     setSearchQuery(query);
    // };

    // useEffect(() => {
    //     if (searchQuery) {
    //         const filtered = data.filter((item: any) =>
    //             Object.values(item).some((val: any) =>
    //                 String(val).toLowerCase().includes(searchQuery.toLowerCase())
    //             )
    //         );
    //         setFilteredData(filtered);
    //     } else {
    //         setFilteredData(data); 
    //     }
    // }, [searchQuery, data]); 

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        columnWidth: "50px",
    };

    return (
        <div className="table-wrapper">
            {/* <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ marginBottom: 16, width: '100%' }}
            /> */}
            <Table
                size="middle"
                columns={column}
                dataSource={filteredData} 
                rowKey="id"
                rowSelection={rowSelection}
                loading={loading}
                scroll={{ y: 138.4 * 5 }}
                onChange={(pagination) => {
                    onTableChange(pagination);
                }}
                style={{ overflow: 'hidden' }}
                rowClassName={() => 'fixed-row-height'}
            />
        </div>
    );
};

export default TableComponent;
