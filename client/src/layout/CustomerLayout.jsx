import { useState } from 'react';
import {
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Menu,
  Space,
  Typography,
} from 'antd';
import { Gem, LogOut, Menu as MenuIcon, ShoppingBag, UserRound } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { customerNavItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

const customerTheme = {
  token: {
    colorPrimary: '#12332B',
    colorInfo: '#12332B',
    colorLink: '#12332B',
    colorText: '#1A1D21',
    colorBgLayout: '#F5F6F7',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E6E8EC',
    borderRadius: 12,
    fontFamily: 'Manrope, sans-serif',
  },
  components: {
    Menu: {
      itemColor: '#1A1D21',
      itemSelectedColor: '#B08A4A',
      horizontalItemSelectedColor: '#B08A4A',
      activeBarBorderWidth: 2,
      itemBg: '#F5F6F7',
    },
    Layout: {
      headerBg: '#F5F6F7',
      bodyBg: '#F5F6F7',
      footerBg: '#12332B',
    },
  },
};

const getSelectedNavKey = (pathname) => {
  if (pathname.startsWith('/search') || pathname.startsWith('/category') || pathname.startsWith('/product')) {
    return '/search';
  }

  if (pathname.startsWith('/promotions')) {
    return '/promotions';
  }

  if (pathname.startsWith('/news')) {
    return '/news';
  }

  if (pathname.startsWith('/gold-prices')) {
    return '/gold-prices';
  }

  return '/';
};

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();
  const isTabletUp = useMediaQuery('(min-width: 768px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const selectedKey = getSelectedNavKey(location.pathname);

  return (
    <ConfigProvider theme={customerTheme}>
      <Layout className="portal-customer">
        <Header style={{ borderBottom: '1px solid var(--color-border)', height: 74, lineHeight: '74px' }}>
          <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-4 px-4 md:px-6 desktop:px-8">
            <button
              className="flex items-center gap-2 border-0 bg-transparent p-0 text-left"
              onClick={() => navigate('/')}
              type="button"
            >
              <Gem size={20} color="#B08A4A" />
              <div className="leading-tight">
                <Title className="portal-title" level={4} style={{ margin: 0 }}>
                  Aurelia Jewels
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Luxury Editorial Commerce
                </Text>
              </div>
            </button>

            {isTabletUp ? (
              <div className="flex flex-1 items-center justify-end gap-3">
                <Menu
                  mode="horizontal"
                  selectedKeys={[selectedKey]}
                  items={customerNavItems}
                  onClick={onMenuClick}
                  style={{ minWidth: 520, borderBottom: 'none', justifyContent: 'flex-end' }}
                />
                <Space>
                  <Button icon={<ShoppingBag size={16} />} onClick={() => navigate('/cart')}>
                    Cart
                  </Button>
                  {isAuthenticated ? (
                    <>
                      <Button icon={<UserRound size={16} />} onClick={() => navigate('/profile')}>
                        Profile
                      </Button>
                      <Button icon={<LogOut size={16} />} onClick={handleSignOut}>
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate('/signin')}>Sign in</Button>
                      <Button type="primary" onClick={() => navigate('/signup')}>
                        Sign up
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            ) : (
              <Button icon={<MenuIcon size={18} />} onClick={() => setDrawerOpen(true)} />
            )}
          </div>
        </Header>

        <Drawer
          title="Menu"
          placement="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={300}
        >
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={customerNavItems}
              onClick={onMenuClick}
            />
            <Button block icon={<ShoppingBag size={16} />} onClick={() => onMenuClick({ key: '/cart' })}>
              Cart
            </Button>
            {isAuthenticated ? (
              <>
                <Button block icon={<UserRound size={16} />} onClick={() => onMenuClick({ key: '/profile' })}>
                  Profile
                </Button>
                <Button
                  block
                  icon={<LogOut size={16} />}
                  onClick={async () => {
                    await handleSignOut();
                    setDrawerOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button block onClick={() => onMenuClick({ key: '/signin' })}>
                  Sign in
                </Button>
                <Button block type="primary" onClick={() => onMenuClick({ key: '/signup' })}>
                  Sign up
                </Button>
              </>
            )}
          </Space>
        </Drawer>

        <Content>
          <Outlet />
        </Content>

        <Footer style={{ padding: 32 }}>
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 text-[#F5F6F7] md:flex-row md:items-center md:justify-between">
            <Text style={{ color: '#F5F6F7' }}>
              Aurelia Jewels Commerce Skeleton - Customer Portal
            </Text>
            <Text style={{ color: '#B08A4A' }}>
              Premium experiences with secure checkout flows
            </Text>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default CustomerLayout;
