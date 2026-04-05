import { useMemo, useState } from "react";
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
} from "antd";
import { LogOut, Menu as MenuIcon, UserCircle2 } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminNavItems } from "@/config/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { extractUserRoles } from "@/utils/roles";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/api/auth";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const adminTheme = {
  token: {
    colorPrimary: "#c48c46", // gold-500
    colorInfo: "#1a1a2e", // brand-dark
    colorWarning: "#c48c46",
    colorText: "#1a1d21",
    colorBgLayout: "#faf7f2", // bg-brand-light
    colorBgContainer: "#ffffff",
    colorBorder: "#e8e4de",
    borderRadius: 12,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Layout: {
      siderBg: "#1a1a2e", // brand-dark
      headerBg: "#ffffff",
      bodyBg: "#faf7f2",
    },
    Menu: {
      darkItemBg: "#1a1a2e",
      darkSubMenuItemBg: "#16213e", // brand-deeper
      darkItemSelectedBg: "rgba(196, 140, 70, 0.15)", // translucent gold
      darkItemSelectedColor: "#c48c46", // text-gold
      darkItemColor: "#a3a8b5", // muted gray-blue
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "rgba(255,255,255,0.05)",
    },
  },
};

const getSelectedNavKey = (pathname) => {
  const sorted = [...adminNavItems].sort((a, b) => b.key.length - a.key.length);
  const match = sorted.find(
    (item) => pathname === item.key || pathname.startsWith(`${item.key}/`),
  );
  return match?.key || "/admin/dashboard";
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const roles = extractUserRoles(user);
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey = getSelectedNavKey(location.pathname);

  const roleTag = useMemo(() => {
    if (!roles || roles.length === 0) {
      return "guest";
    }

    return roles[0];
  }, [roles]);

  const onMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    const token = user?.token;
    try {
      if (token) {
        await logout(token);
      }
    } finally {
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      navigate("/signin");
    }
  };

  const userItems = [
    {
      key: "profile",
      label: "Open customer profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "signout",
      label: "Sign out",
      icon: <LogOut size={16} className="text-red-500" />,
      onClick: handleSignOut,
      danger: true,
    },
  ];

  const menu = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      items={adminNavItems}
      onClick={onMenuClick}
      style={{ height: "100%", borderInlineEnd: 0, padding: "16px 8px" }}
    />
  );

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout className="portal-admin" style={{ minHeight: "100vh" }}>
        {isDesktop && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={280}
            style={{ 
              borderRight: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "4px 0 24px rgba(0,0,0,0.02)"
            }}
          >
            <div className="flex h-[72px] items-center justify-center border-b border-white/5 px-4 mb-2">
              <Title
                level={4}
                className="portal-title"
                style={{ 
                  margin: 0, 
                  color: "#c48c46", 
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  fontWeight: 700,
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                {collapsed ? "A" : "Aurelia Admin"}
              </Title>
            </div>
            {menu}
          </Sider>
        )}

        <Layout>
          <Header
            style={{
              background: "#ffffff",
              borderBottom: "1px solid #f0edf0",
              padding: "0 24px",
              height: "72px",
              lineHeight: "normal",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
              zIndex: 10
            }}
          >
            <div className="flex w-full items-center justify-between gap-3 pt-1">
              <Space size="middle">
                {!isDesktop && (
                  <Button
                    type="text"
                    icon={<MenuIcon size={20} />}
                    onClick={() => setDrawerOpen(true)}
                  />
                )}
                <div className="flex flex-col justify-center">
                  <Title
                    className="portal-title"
                    level={4}
                    style={{ margin: 0, lineHeight: 1.1, fontFamily: '"Playfair Display", serif', color: "#1a1a2e" }}
                  >
                    Oanh Ngoc Jewelry Admin
                  </Title>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    Trung tâm quản trị hệ thống và vận hành cửa hàng
                  </Text>
                </div>
              </Space>

              <Space size="large">
                <Tag
                  color="#c48c46"
                  style={{ textTransform: "uppercase", margin: 0, padding: "2px 8px", borderRadius: "6px", fontWeight: 600, border: "none" }}
                >
                  {roleTag}
                </Tag>
                <Dropdown menu={{ items: userItems }} trigger={["click"]} placement="bottomRight">
                  <Button 
                    type="text" 
                    style={{ height: "auto", padding: "4px 8px", borderRadius: "8px" }}
                    className="hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Space>
                      <Avatar size={34} style={{ backgroundColor: "#1a1a2e", color: "#c48c46" }}>
                        {(user?.name || "A")[0].toUpperCase()}
                      </Avatar>
                      <span className="font-medium text-gray-700 hidden sm:inline-block pl-1">
                        {user?.name || "Operator"}
                      </span>
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content style={{ overflowX: 'hidden' }}>
            <Outlet />
          </Content>
        </Layout>

        <Drawer
          title={<span style={{ fontFamily: '"Playfair Display", serif', color: '#1a1a2e', fontSize: '1.25rem', fontWeight: 700 }}>Aurelia Navigation</span>}
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={300}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={adminNavItems}
            onClick={onMenuClick}
            style={{ borderRight: 'none', padding: '16px 8px' }}
          />
        </Drawer>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
