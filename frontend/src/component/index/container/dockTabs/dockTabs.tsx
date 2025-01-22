import React, { useEffect, useState } from 'react';
import { Tabs, message, notification } from 'antd';
import { GiOpenFolder } from 'react-icons/gi';
import Home from 'layout/home/home';
import EventEmitter from 'eventemitter3';
import EmployeeAccount from 'layout/account/EmployeeAccount/EmployeeAccount';
import UserAccount from 'layout/account/UserAccount/UserAccount';
import Voucher from 'layout/Voucher/Voucher';
import Tour from 'layout/Tour/Tour';
import Service from 'layout/Service/Service';
import Branch from 'layout/Branch/Branch';
import SourceAgent from 'layout/Source/SourceAgent/SourceAgent';
import SourceService from 'layout/Source/SourceService/SourceService';
import { useTranslation } from 'react-i18next';
import Statistical from 'layout/Statistical/Statistical';
import BookingActive from 'layout/BookingActive/BookingActive';
import Conversation from 'layout/Chat/chat';
import Booking from 'layout/booking/booking';

const ee = window.ee || (window.ee = new EventEmitter());

interface ITabItem {
  label: string;
  children: React.ReactNode;
  key: string;
}

const DockTabs: React.FC = () => {
  const { t, i18n } = useTranslation('label');
  const [activeKey, setActiveKey] = useState<string>('Trang Chủ');
  const [items, setItems] = useState<ITabItem[]>([
    { label: t('label.Trang Chủ'), children: <Home />, key: 'Trang Chủ' },
  ]);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const userRole = userData.role || [];
  console.log(userRole);

  useEffect(() => {
    setItems([
      { label: t('label.Trang Chủ'), children: <Home />, key: 'Trang Chủ' },
    ]);
    setActiveKey('Trang Chủ');
  }, [i18n.language]);

  useEffect(() => {
    const addItemHandler = (key: string) => {
      addTab(key);
    };

    ee.on('addItemTabs', addItemHandler);

    return () => {
      ee.off('addItemTabs', addItemHandler);
    };
  }, [items]);

  const addTab = (key: string) => {
    const existingTab = items.find((item) => item.key === key);
    if (existingTab) {
      setActiveKey(existingTab.key);
      return;
    }

    let children: React.ReactNode;
    switch (key) {
      case t('Trang Chủ'):
        children = <Home />;
        break;
      case t('label.Statistical'):
        if (userRole != 'admin' && userRole != 'accountant') {
          notification.error({
            message: t('Bạn không đủ quyền hạn để xem thống kê'), 
            placement: 'topRight',
            duration: 4,
          });
          return;
        }
        children = <Statistical />;
        break;
      case t('label.Employee Account'):
        children = <EmployeeAccount />;
        break;
      case t('label.User Account'):
        children = <UserAccount />;
        break;
      case t('label.Voucher'):
        children = <Voucher />;
        break;
      case t('label.Tour'):
        children = <Tour />;
        break;
      case t('label.Source Service'):
        children = <SourceService />;
        break;
      case t('label.Source Agent'):
        children = <SourceAgent />;
        break;
      case t('label.Service'):
        children = <Service />;
        break;
      case t('label.Chat'):
        children = <Conversation />;
        break;
      case t('label.Branch'):
        children = <Branch />;
        break;
      // case 'Booking Active':
      //   children = <BookingActive />;
      //   break;
      case 'Booking':
        children = <Booking />;
        break;
      default:
        return;
    }

    setItems((prevItems) => [
      ...prevItems,
      { label: key, children, key },
    ]);
    setActiveKey(key);
  };

  const removeTab = (targetKey: string) => {
    const newItems = items.filter((item) => item.key !== targetKey);
    if (targetKey === activeKey) {
      const prevItem = newItems[newItems.length - 1];
      setActiveKey(prevItem ? prevItem.key : '');
    }
    setItems(newItems);
  };

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const onEdit = (targetKey: string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      removeTab(targetKey);
    }
  };

  return (
    <div className="wrapper_tabs">
      <Tabs
        onEdit={onEdit}
        hideAdd
        type="editable-card"
        onChange={onChange}
        activeKey={activeKey}
        items={items.map((item) => ({
          label: (
            <span className="tab-label">
              <GiOpenFolder size={16} className="tab-icon" />
              {item.label}
            </span>
          ),
          children: item.children,
          key: item.key,
        }))}
      />
    </div>
  );
};

export default DockTabs;
