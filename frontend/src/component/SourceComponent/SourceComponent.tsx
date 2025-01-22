import { Button } from "antd"
import ButtonModal from "component/Global/Button/ButtonModal"
import TableComponent from "component/Global/Table/TableComponent"
import { useTranslation } from "react-i18next"
import { useDispatch } from "react-redux"
import { showModal } from "redux/Redux/modal/modalSlice"

interface DataType {
    id: number,
    name: string,
    email: string,
    phone: string,
    address: string,
    type: string,
    status: number
}

const SourceComponent: React.FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation('source')
    const columns = [
        {
            title: "STT",
            dataIndex: "id",
            key: "id"
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
            dataIndex: "status",
            key: "status",
        },
        {
            title: t('source.actions'),
            key: "actions",
            render: () => (
                <Button
                    type="primary"
                    style={{ background: '#ffc107' }}
                >
                    Sửa
                </Button>
            ),
        }
    ]

    const handleShowModal = () => {
        dispatch(showModal('Modal Source'));
    };
    return (
        <>
        <ButtonModal onAddClick={handleShowModal}/>
        <TableComponent column={columns} data={data}/>
        </>
    )
}

export default SourceComponent