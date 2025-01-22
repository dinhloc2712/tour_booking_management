import * as XLSX from 'xlsx';

/**
 * Hàm xuất dữ liệu ra file Excel với tự động điều chỉnh độ rộng cột
 * @param data - Dữ liệu cần xuất (mảng các đối tượng)
 * @param filename - Tên file Excel (không cần đuôi .xlsx)
 */
export const exportToExcel = (data: any[], filename: string) => {
  // Chuyển đổi dữ liệu JSON thành sheet Excel
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Tính toán độ rộng cột tự động
  const columnWidths = Object.keys(worksheet).reduce((acc: any, key: string) => {
    const cell = worksheet[key];
    // Kiểm tra giá trị ô có tồn tại và là một chuỗi hợp lệ
    const cellValue = cell ? String(cell.v) : ''; // Chuyển giá trị ô thành chuỗi hoặc dùng chuỗi rỗng nếu không có giá trị
    const colIndex = key.charAt(0); // Lấy ký tự cột (A, B, C,...)
    const colWidth = cellValue.length; // Tính độ rộng cột dựa trên độ dài của nội dung ô
    acc[colIndex] = acc[colIndex] ? Math.max(acc[colIndex], colWidth) : colWidth; // Tính toán chiều rộng tối đa cho mỗi cột
    return acc;
  }, {});

  // Thiết lập chiều rộng cột cho worksheet
  worksheet['!cols'] = Object.keys(columnWidths).map(col => ({ wch: columnWidths[col] }));

  // Tạo workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Xuất file Excel
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
