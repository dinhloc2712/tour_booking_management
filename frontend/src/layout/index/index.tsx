import React, { useEffect, useState } from 'react';
import SideBar from 'component/index/sidebar/sideBar';
import Container from 'component/index/container/container';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

import HeaderLogo from 'component/index/header/header';

import { Button, Input, Layout, MenuProps, Space, theme } from 'antd';
import Search from 'antd/es/transfer/search';
import { Link } from 'react-router-dom';
import Nav from 'component/index/Nav/Nav';
import { useAppDispatch } from 'redux/store';
import { setSearchQuery } from 'redux/Reducer/SearchReducer';

const { Header, Sider, Content } = Layout;
// const items: MenuProps['items'] = [
//   {
//     key: '1',
//     label: (
//       <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
//         Nguyễn Văn Khôi
//       </a>
//     ),
//   },
//   {
//     key: '2',
//     label: (
//       <Link to={'/updateAccount'}>Thông tin tài khoản</Link>
//     ),
//   },
//   {
//     key: '3',
//     label: (
//       <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
//         Đăng Xuất
//       </a>
//     ),
//   },
// ];

const Main: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
    console.log(e.target.value);
    
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <div className='main-layout'>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div />
          <HeaderLogo />
          <SideBar />
        </Sider>
        <Layout>
          <Header style={{ background: colorBgContainer }} className='nav'>
            <div>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </div>
            <Nav />
          </Header>
          <Content
            style={{
              margin: '10px 10px',
              minHeight: 280,
              borderRadius: borderRadiusLG,
            }}
          >
            <Container />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Main;