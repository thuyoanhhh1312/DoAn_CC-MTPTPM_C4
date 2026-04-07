import {
  Award,
  BadgePercent,
  FolderOpen,
  Gem,
  GitBranch,
  History,
  House,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Search,
  Shapes,
  ShoppingCart,
  UserCog,
  Users,
} from "lucide-react";

const iconProps = { size: 16 };

export const customerNavItems = [
  { key: "/", label: "Home", icon: <House {...iconProps} /> },
  { key: "/search", label: "Search", icon: <Search {...iconProps} /> },
  {
    key: "/promotions",
    label: "Promotions",
    icon: <BadgePercent {...iconProps} />,
  },
  { key: "/news", label: "News", icon: <Newspaper {...iconProps} /> },
];

export const adminNavItems = [
  {
    key: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard {...iconProps} />,
    rolesAllowed: ["admin"],
  },
  {
    key: "/admin/products",
    label: "Products",
    icon: <Gem {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/categories",
    label: "Categories",
    icon: <Shapes {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/subcategories",
    label: "Subcategories",
    icon: <GitBranch {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/orders",
    label: "Orders",
    icon: <ShoppingCart {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/customers",
    label: "Customers",
    icon: <Users {...iconProps} />,
    rolesAllowed: ["admin"],
  },
  {
    key: "/admin/users",
    label: "Users / Staff",
    icon: <UserCog {...iconProps} />,
    rolesAllowed: ["admin"],
  },
  {
    key: "/admin/promotions",
    label: "Promotions",
    icon: <BadgePercent {...iconProps} />,
    rolesAllowed: ["admin"],
  },
  {
    key: "/admin/campaigns",
    label: "Campaigns",
    icon: <Megaphone {...iconProps} />,
    rolesAllowed: ["admin"],
  },
  {
    key: "/admin/promotion-logs",
    label: "Promotion Logs",
    icon: <History {...iconProps} />,
    rolesAllowed: ["admin"],
  },
  {
    key: "/admin/news",
    label: "News",
    icon: <Newspaper {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/news-categories",
    label: "News Categories",
    icon: <FolderOpen {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/reviews",
    label: "Reviews Moderation",
    icon: <MessageSquareWarning {...iconProps} />,
    rolesAllowed: ["admin", "staff"],
  },
  {
    key: "/admin/rank",
    label: "Rank",
    icon: <Award {...iconProps} />,
    rolesAllowed: ["admin"],
  },
];
