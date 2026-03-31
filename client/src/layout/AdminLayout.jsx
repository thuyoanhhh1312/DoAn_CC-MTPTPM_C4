import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tag,
  Typography,
} from 'antd';
import { LogOut, Menu as MenuIcon, UserCircle2 } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminNavItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const adminTheme = {
  token: {
    colorPrimary: '#12332B',
    colorInfo: '#12332B',
    colorWarning: '#B08A4A',
    colorText: '#1A1D21',
    colorBgLayout: '#F5F6F7',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E6E8EC',
    borderRadius: 12,
    fontFamily: 'IBM Plex Sans, sans-serif',
  },
  components: {
    Layout: {
      siderBg: '#12332B',
      headerBg: '#FFFFFF',
      bodyBg: '#F5F6F7',
    },
    Menu: {
      darkItemBg: '#12332B',
      darkSubMenuItemBg: '#0F2B24',
      darkItemSelectedBg: '#B08A4A',
      darkItemSelectedColor: '#1A1D21',
      darkItemColor: '#F5F6F7',
      darkItemHoverColor: '#FFFFFF',
    },
  },
};

const getSelectedNavKey = (pathname) => {
  const sorted = [...adminNavItems].sort((a, b) => b.key.length - a.key.length);
  const match = sorted.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`));
  return match?.key || '/admin';
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, signOut } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1200px)');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey = getSelectedNavKey(location.pathname);

  const roleTag = useMemo(() => {
    if (!roles || roles.length === 0) {
      return 'guest';
    }

    return roles[0];
  }, [roles]);

  const onMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const userItems = [
    {
      key: 'profile',
      label: 'Open customer profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'signout',
      label: 'Sign out',
      icon: <LogOut size={14} />,
      onClick: async () => {
        await signOut();
        navigate('/signin');
      },
    },
  ];

  const menu = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      items={adminNavItems}
      onClick={onMenuClick}
      style={{ height: '100%', borderInlineEnd: 0 }}
    />
  );

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout className="portal-admin" style={{ minHeight: '100vh' }}>
        {isDesktop && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={260}
            style={{ borderRight: '1px solid rgba(230, 232, 236, 0.16)' }}
          >
            <div className="flex h-16 items-center justify-center border-b border-white/10 px-3">
              <Title
                level={5}
                className="portal-title"
                style={{ margin: 0, color: '#F5F6F7', textAlign: 'center' }}
              >
                {collapsed ? 'AJS' : 'Aurelia Admin'}
              </Title>
            </div>
            {menu}
          </Sider>
        )}

        <Layout>
          <Header style={{ borderBottom: '1px solid var(--color-border)', padding: '0 16px' }}>
            <div className="flex h-full items-center justify-between gap-3">
              <Space>
                {!isDesktop && (
                  <Button icon={<MenuIcon size={18} />} onClick={() => setDrawerOpen(true)} />
                )}
                <div>
                  <Title className="portal-title" level={4} style={{ margin: 0, lineHeight: 1.2 }}>
                    Clean Ops Console
                  </Title>
                  <Text type="secondary">Operational control for catalog, orders, and campaigns</Text>
                </div>
              </Space>

              <Space>
                <Tag color="#B08A4A" style={{ textTransform: 'uppercase', margin: 0 }}>
                  {roleTag}
                </Tag>
                <Dropdown menu={{ items: userItems }} trigger={['click']}>
                  <Button icon={<UserCircle2 size={16} />}>
                    <Space>
                      <Avatar size={24}>{(user?.name || 'A')[0].toUpperCase()}</Avatar>
                      <span>{user?.name || 'Operator'}</span>
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content>
            <Outlet />
          </Content>
        </Layout>

        <Drawer
          title="Admin Navigation"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={300}
        >
          <Menu mode="inline" selectedKeys={[selectedKey]} items={adminNavItems} onClick={onMenuClick} />
        </Drawer>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
