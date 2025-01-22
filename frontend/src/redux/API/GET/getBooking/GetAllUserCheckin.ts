import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyGet, newFetchData } from "data/FetchApi";


export const getAllUserCheckin = createAsyncThunk(
    'checkinUserAll/getAllUserCheckin',
    async (bookingId: any) => {
        const apibodyGet = bodyGet();

        const response = await fetch(`${newFetchData.checkinUserAll}/${bookingId}`, apibodyGet)
        
        if (response.ok) {
            const result = await response.json()

            // console.log('Dữ liệu trả về từ API:', result)
            if (result.status === "success") {
                console.log('Dữ liệu trả về từ API alll user:', result)
                return result.data;
               
            }else{
                throw new Error(result.message || 'Lỗi Api')
            }
           
        }else{
            throw new Error('Không Thể Lấy Dữ Liệu')

        }

    }
 )