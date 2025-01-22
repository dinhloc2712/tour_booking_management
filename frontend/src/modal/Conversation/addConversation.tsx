import { Button, Form, Modal, notification, Checkbox, Input } from "antd";
import FormComponent from "component/Global/Form/FormComponent";
import { useSelector } from "react-redux";
import { hideModal } from "redux/Redux/modal/modalSlice";
import { RootState, useAppDispatch } from "redux/store";
import { Conversation } from "redux/Reducer/ConversationReducer";
import { AddConversation } from "redux/API/POST/CreateConversation";
import { getStaff } from "redux/API/GET/GetStaff";
import { useEffect, useState } from "react";
import { getConversation } from "redux/API/GET/getMessage/GetConversation";
import { useTranslation } from "react-i18next";

interface CustomModalProps {
    idModal: any;
}

const initialState: Conversation = {
    id: '',
    name: '',
    type: 'group',
    user_ids: [],
} 


const AddConversations: React.FC<CustomModalProps> = ({ idModal }) => {
    const dispatch = useAppDispatch();

    const ShowModalConversation = useSelector((state: RootState) => state.modal.modals[idModal]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const userList = useSelector((state: RootState) => state.staff.staffList);

    useEffect(() => {
        dispatch(getStaff());
    }, [dispatch]);

    const { t } = useTranslation('AddConversation');  

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
            type: 'group',
            user_ids: selectedUsers,
        };
        
        setLoading(true);
        try{
            const result = await dispatch(AddConversation(dataToSend)).unwrap();
            if(result){
                form.resetFields();
                handleCancelModalAddConversation();
                notification.success({
                    message: 'Thêm nhóm message thành công'
                });
                await dispatch(getConversation()).unwrap();
            }
        }catch(err) {
            notification.error({
                message: 'Thêm nhóm message thất bại',
                description: err.message || 'có lỗi xảy ra'
            });
        } finally {
            setLoading(false);
        }
    }

    const handleCancelModalAddConversation = () => {
        dispatch(hideModal(idModal));
    }

    return (
        <Modal
            open={ShowModalConversation}
            title={t('Thêm cuộc hội thoại')}
            footer={[
                <Button key="cancel" onClick={handleCancelModalAddConversation}>
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
                <Form.Item
                    label={t('Tên nhóm *')}
                    name="name"
                    rules={[{ required: true, message: t('Tên nhóm không được để trống') }]}
                >
                    <Input placeholder={t('Tên nhóm')} />
                </Form.Item>
                <Form.Item name="type" hidden>
                    <Input /> 
                </Form.Item>
                <div>
                    <label>{t('Danh sách người dùng')}</label><br/>
                    {userList.map((user) => (
                        <div key={user.id} className="round-checkbox">
                            <Checkbox  onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}>
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

export default AddConversations;