import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'redux/store';
import { getStaticalAll } from 'redux/API/GET/Statistical/GetStatisticalAll';
import { useTranslation } from 'react-i18next';

interface BookingDatasAll {
  date: string;
  total_customers: number;
  checked_in_customers: number;
  not_checked_in_customers: number;
  check_in_ratio: string;
  revenue: string;
  refund_amount: string;
  booking_count: number;
}

const HomeStatisticalComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookingDatasAll, loading, error } = useSelector((state: RootState) => state.statistical);

  useEffect(() => {
    dispatch(getStaticalAll());
  }, [dispatch]);

  const { t } = useTranslation('Home')

  return (
    <div className='header-Home'>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('Home.Tổng số bookings trong ngày')}
              value={bookingDatasAll?.booking_count ?? 0}
              prefix="📊"
              style={{ textAlign: 'center' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('Home.Lượt checkin')}
              value={bookingDatasAll?.check_in_ratio || 0}
              prefix="📅"
              style={{ textAlign: 'center' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('Home.Doanh thu')}
              value={bookingDatasAll?.revenue || 0}
              prefix="💵"
              precision={2}
              style={{ textAlign: 'center' }}
              suffix="VND"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('Home.Tiền Hoàn')}
              value={bookingDatasAll?.refund_amount || 0}
              prefix="💰"
              precision={2}
              style={{ textAlign: 'center' }}
              suffix="VND"
            />
          </Card>
        </Col>
        {/* <Col span={6}>
          <Card>
            <Statistic
              title="Tiền Cọc"
              value={bookingDatasAll?.total_amount_deposit || 0}
              prefix="💰"
              precision={2}
              style={{ textAlign: 'center' }}
              suffix="VND"
            />
          </Card> 
        </Col> */}
      </Row>
    </div>
  );
};

export default HomeStatisticalComponent;
