import {
  Award,
  BadgePercent,
  Coins,
  FolderOpen,
  Gem,
  GitBranch,
  History,
  House,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Search,
  Shapes,
  ShoppingCart,
  UserCog,
  Users,
} from 'lucide-react';

const iconProps = { size: 16 };

export const customerNavItems = [
  { key: '/', label: 'Home', icon: <House {...iconProps} /> },
  { key: '/search', label: 'Search', icon: <Search {...iconProps} /> },
  { key: '/promotions', label: 'Promotions', icon: <BadgePercent {...iconProps} /> },
  { key: '/news', label: 'News', icon: <Newspaper {...iconProps} /> },
  { key: '/gold-prices', label: 'Gold Prices', icon: <Coins {...iconProps} /> },
];

export const adminNavItems = [
  { key: '/admin', label: 'Dashboard', icon: <LayoutDashboard {...iconProps} /> },
  { key: '/admin/products', label: 'Products', icon: <Gem {...iconProps} /> },
  { key: '/admin/categories', label: 'Categories', icon: <Shapes {...iconProps} /> },
  { key: '/admin/subcategories', label: 'Subcategories', icon: <GitBranch {...iconProps} /> },
  { key: '/admin/orders', label: 'Orders', icon: <ShoppingCart {...iconProps} /> },
  { key: '/admin/customers', label: 'Customers', icon: <Users {...iconProps} /> },
  { key: '/admin/users', label: 'Users / Staff', icon: <UserCog {...iconProps} /> },
  { key: '/admin/promotions', label: 'Promotions', icon: <BadgePercent {...iconProps} /> },
  { key: '/admin/campaigns', label: 'Campaigns', icon: <Megaphone {...iconProps} /> },
  { key: '/admin/promotion-logs', label: 'Promotion Logs', icon: <History {...iconProps} /> },
  { key: '/admin/news', label: 'News', icon: <Newspaper {...iconProps} /> },
  { key: '/admin/news-categories', label: 'News Categories', icon: <FolderOpen {...iconProps} /> },
  { key: '/admin/reviews', label: 'Reviews Moderation', icon: <MessageSquareWarning {...iconProps} /> },
  { key: '/admin/bank-accounts', label: 'Bank Accounts', icon: <Landmark {...iconProps} /> },
  { key: '/admin/rank', label: 'Rank', icon: <Award {...iconProps} /> },
];
