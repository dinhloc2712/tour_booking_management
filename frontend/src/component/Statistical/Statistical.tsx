// import React from 'react';
// import { Tabs } from 'antd';
// import type { TabsProps } from 'antd';
// import PieChart from './StatisticalTour';
// import StatisticalComponent from './StatisticalBooking';
// import StatisticalBill from './StatisticalBill';
// import { AppstoreOutlined, ArrowRightOutlined, BookOutlined, CalendarOutlined, CarOutlined, CompassOutlined, FileTextOutlined, SolutionOutlined } from '@ant-design/icons';
// import { FaPlane } from 'react-icons/fa';
// import StatisticalSaleAgent from './StatisticalSaleAgent';
// import StatisticsService from './StatisticalService';


// const onChange = (key: string) => {};

// const items: TabsProps['items'] = [
//   {
//     key: '1',
//     label: (
//       <span className="custom-tab-label">
//         <CalendarOutlined style={{ marginRight: '5px' }} /> {/* Thêm biểu tượng vào label */}
//         Booking
//       </span>
//     ),
//     children: <div className="tab-content"><StatisticalComponent /></div>,
//   },
//   {
//     key: '2',
//     label: <span className="custom-tab-label"><FileTextOutlined style={{ marginRight: '5px' }} /> Doanh Thu</span>,
//     children: <div className="tab-content"><StatisticalBill /></div>,
//   },
//   {
//     key: '3',
//     label: <span className="custom-tab-label"><CompassOutlined style={{ marginRight: '5px' }} />Tour</span>,
//     children: <div className="tab-content"><PieChart /></div>,
//   },
//   {
//     key: '4',
//     label: <span className="custom-tab-label"><SolutionOutlined style={{ marginRight: '5px' }} />Đại Lý</span>,
//     children: <div className="tab-content"><StatisticalSaleAgent /></div>,
//   },
//   {
//     key: '5',
//     label: <span className="custom-tab-label"><AppstoreOutlined style={{ marginRight: '5px' }} />Dịch Vụ</span>,
//     children: <div className="tab-content"><StatisticsService /></div>,
//   },
// ];

// // Component chính
// const App: React.FC = () => (
//   <div className='StatisticalTab'>
//     <Tabs defaultActiveKey="1" items={items} onChange={onChange} className="custom-tabs" />
//   </div>
// );

// export default App;


import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import PieChart from './StatisticalTour';
import StatisticalComponent from './StatisticalBooking';
import StatisticalBill from './StatisticalBill';
import { AppstoreOutlined, CalendarOutlined, FileTextOutlined, SolutionOutlined, CompassOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StatisticalSaleAgent from './StatisticalSaleAgent';
import StatisticsService from './StatisticalService';

const App: React.FC = () => {
  const { t } = useTranslation('Statistical');

  const onChange = (key: string) => {
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="custom-tab-label">
          <CalendarOutlined style={{ marginRight: '5px' }} />
          {t('Statistical.Booking')}
        </span>
      ),
      children: <div className="tab-content"><StatisticalComponent /></div>,
    },
    {
      key: '2',
      label: (
        <span className="custom-tab-label">
          <FileTextOutlined style={{ marginRight: '5px' }} />
          {t('Statistical.Revenue')}
        </span>
      ),
      children: <div className="tab-content"><StatisticalBill /></div>,
    },
    {
      key: '3',
      label: (
        <span className="custom-tab-label">
          <CompassOutlined style={{ marginRight: '5px' }} />
          {t('Statistical.Tour')}
        </span>
      ),
      children: <div className="tab-content"><PieChart /></div>,
    },
    {
      key: '4',
      label: (
        <span className="custom-tab-label">
          <SolutionOutlined style={{ marginRight: '5px' }} />
          {t('Statistical.agent')}
        </span>
      ),
      children: <div className="tab-content"><StatisticalSaleAgent /></div>,
    },
    {
      key: '5',
      label: (
        <span className="custom-tab-label">
          <AppstoreOutlined style={{ marginRight: '5px' }} />
          {t('Statistical.service')}
        </span>
      ),
      children: <div className="tab-content"><StatisticsService /></div>,
    },
  ];

  return (
    <div className="StatisticalTab">
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} className="custom-tabs" />
    </div>
  );
};

export default App;
