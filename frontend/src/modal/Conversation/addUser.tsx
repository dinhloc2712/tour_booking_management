import { Button, Form, Modal, notification, Checkbox, Input } from "antd"
import { useSelector } from "react-redux";
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";
import { Conversation } from "redux/Reducer/ConversationReducer";
import { getStaff } from "redux/API/GET/GetStaff";
import { useEffect, useState } from "react";
import { getConversation } from "redux/API/GET/getMessage/GetConversation";
import { useTranslation } from "react-i18next";
import { updateConversation } from "redux/API/PUT/Conversation";

interface CustomModalProps {
    idModal: any;
} 

const initialState: Conversation = {
    id: '',
    name: '',
    type: 'group',
    user_ids: [],
} 


const AddUser: React.FC<CustomModalProps> = ({ idModal }) => {
    const dispatch = useAppDispatch();

    const ShowModalUser = useSelector((state: RootState) => state.modal.modals[idModal]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const userList = useSelector((state: RootState) => state.staff.staffList);
    const conversation = useSelector((state: RootState) => state.ConversationReducer.conversation);
    const existingMembers = conversation? conversation.users.map((item) => item.id) : [];
     
    useEffect(() => {
        dispatch(getStaff());
    }, [dispatch]);

    const { t } = useTranslation('AddUser');  

    const handleCheckboxChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, id]);
        } else {
            setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
        }
    };

    const handleFinish = async (values: Conversation) => {
        const dataToSend = {
            ...values,
            add_user_ids: selectedUsers,
        };
        
        setLoading(true);
        try{
            const result = await dispatch(updateConversation({id :conversation?.id, body: dataToSend})).unwrap();
            if(result){
                form.resetFields();
                handleCancelModalAddUser();
                notification.success({
                    message: 'Thêm thành viên thành công'
                });
                await dispatch(getConversation()).unwrap();
            }
        }catch(err) {
            notification.error({
                message: 'Thêm thành viên thất bại',
                description: err.message || 'có lỗi xảy ra'
            });
        } finally {
            setLoading(false);
        }
    }

    const handleCancelModalAddUser = () => {
        dispatch(hideModal(idModal));
    }

    const sortedUserList = [...userList].sort((a, b) => {       
        const aIsExisting = existingMembers.includes(a.id) ? 1 : 0;
        const bIsExisting = existingMembers.includes(b.id) ? 1 : 0;

        const aIsSelected = selectedUsers.includes(a.id) ? 1 : 0;
        const bIsSelected = selectedUsers.includes(b.id) ? 1 : 0;

        // Sắp xếp ưu tiên: thành viên cũ -> thành viên được chọn -> còn lại
        if (aIsExisting !== bIsExisting) {
            return bIsExisting - aIsExisting; // Thành viên cũ lên trước
        }
        if (aIsSelected !== bIsSelected) {
            return bIsSelected - aIsSelected; // Thành viên được chọn lên sau
        }
    
        return 0;
    });

    return (
        <Modal
            open={ShowModalUser}
            title={t('Thêm thành viên')}
            footer={[
                <Button key="cancel" onClick={handleCancelModalAddUser}>
                    {t('Hủy')}
                </Button>,
                <Button key="submit" type="primary" htmlType="submit" form="conversation-form" loading={loading}>
                    {t('Tạo')}
                </Button>
            ]}
        >
            <Form 
                id="conversation-form"
                form={form}
                style={{ marginTop: "20px" }}
                name="basic"
                autoComplete="off"
                onFinish={handleFinish}
                initialValues={initialState}
            >
                <div>
                    <label>{t('Danh sách nhân viên')}</label><br/>
                    {sortedUserList.map((user) => (
                        <div key={user.id} className="round-checkbox">
                            <Checkbox 
                            checked={selectedUsers.includes(user.id) || existingMembers.includes(user.id)}
                            disabled={existingMembers.includes(user.id)} // Disable checkbox nếu là thành viên cũ
                            onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}>
                                {user.fullname} <em>({user.branch.name})</em>
                            </Checkbox>
                            <br />
                        </div>               
                    ))}
                </div>
            </Form>
        </Modal>
    );
};

export default AddUser;