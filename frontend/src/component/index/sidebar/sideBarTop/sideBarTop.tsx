import { Menu, notification } from 'antd'
import {
  AiOutlineBarChart,
  AiOutlineHome,
  AiOutlineMessage,
} from 'react-icons/ai'
import { AiOutlineUser } from 'react-icons/ai'
import { MdOutlineDiscount } from 'react-icons/md'
import { MdOutlineTour } from 'react-icons/md'
import { FaServicestack } from 'react-icons/fa'
import { GrResources } from 'react-icons/gr'
import { IoIosGitBranch } from 'react-icons/io'
import { TbBrandBooking } from 'react-icons/tb'
import EventEmitter from 'eventemitter3'
import React from 'react'
import { useTranslation } from 'react-i18next'

var ee = window.ee || (window.ee = new EventEmitter())

const SideBarTop: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { t } = useTranslation('label')

  const items = [
    {
      key: t('Trang Chủ'),
      icon: <AiOutlineHome size={22} />,
      label: t('label.Trang Chủ'),
    },
    {
      key: 'Booking',
      icon: <TbBrandBooking size={22} />,
      label: 'Booking',
    },
    {
      key: t('label.Statistical'),
      icon: <AiOutlineBarChart size={22} />,
      label: t('label.Statistical'),
    },
    {
      key: 'User',
      label: t('label.User'),
      icon: <AiOutlineUser size={22} />,
      children: [
        {
          key: t('label.Employee Account'),
          label: t('label.Employee Account'),
        },
        { key: t('label.User Account'), label: t('label.User Account') },
      ],
    },
    {
      key: t('label.Voucher'),
      icon: <MdOutlineDiscount size={22} />,
      label: t('label.Voucher'),
    },
    {
      key: t('label.Tour'),
      icon: <MdOutlineTour size={22} />,
      label: t('label.Tour'),
    },
    {
      key: t('label.Source'),
      label: t('label.Source'),
      icon: <GrResources size={22} />,
      children: [
        { key: t('label.Source Service'), label: t('label.Source Service') },
        { key: t('label.Source Agent'), label: t('label.Source Agent') },
      ],
    },
    {
      key: t('label.Service'),
      icon: <FaServicestack size={22} />,
      label: t('label.Service'),
    },
    {
      key: t('label.Chat'),
      icon: <AiOutlineMessage size={22} />,
      label: t('label.Chat'),
    },
    {
      key: t('label.Branch'),
      icon: <IoIosGitBranch size={22} />,
      label: t('label.Branch'),
    },
  ]
  const onClick = async ({ key }) => {
    ee.emit('addItemTabs', key)
  }

  return (
    <div className="sidebar-top">
      <Menu
        items={items}
        onClick={onClick}
        triggerSubMenuAction="hover"
      />
    </div>
  )
}

export default SideBarTop