import { Route, Routes } from 'react-router-dom';
import RequireAuth from '@/components/guards/RequireAuth';
import RequireGuest from '@/components/guards/RequireGuest';
import RequireRole from '@/components/guards/RequireRole';
import { ADMIN_ALLOWED_ROLES } from '@/config/roles';
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import BankAccountsPage from '@/pages/admin/BankAccountsPage';
import CampaignsPage from '@/pages/admin/CampaignsPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import CustomersPage from '@/pages/admin/CustomersPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import NewsAdminPage from '@/pages/admin/NewsAdminPage';
import NewsCategoriesPage from '@/pages/admin/NewsCategoriesPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import PromotionLogsPage from '@/pages/admin/PromotionLogsPage';
import PromotionsAdminPage from '@/pages/admin/PromotionsAdminPage';
import RankPage from '@/pages/admin/RankPage';
import ReviewsModerationPage from '@/pages/admin/ReviewsModerationPage';
import SubcategoriesPage from '@/pages/admin/SubcategoriesPage';
import UsersStaffPage from '@/pages/admin/UsersStaffPage';
import CartPage from '@/pages/customer/CartPage';
import CategoryPage from '@/pages/customer/CategoryPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import ForgotPasswordPage from '@/pages/customer/ForgotPasswordPage';
import GoldPricePage from '@/pages/customer/GoldPricePage';
import HomePage from '@/pages/customer/HomePage';
import NewsDetailPage from '@/pages/customer/NewsDetailPage';
import NewsListPage from '@/pages/customer/NewsListPage';
import OrderHistoryPage from '@/pages/customer/OrderHistoryPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import PromotionsPage from '@/pages/customer/PromotionsPage';
import ResetPasswordPage from '@/pages/customer/ResetPasswordPage';
import SearchPage from '@/pages/customer/SearchPage';
import SignInPage from '@/pages/customer/SignInPage';
import SignUpPage from '@/pages/customer/SignUpPage';
import ForbiddenPage from '@/pages/shared/ForbiddenPage';
import NotFoundPage from '@/pages/shared/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/403" element={<ForbiddenPage />} />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={ADMIN_ALLOWED_ROLES}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="subcategories" element={<SubcategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="users" element={<UsersStaffPage />} />
        <Route path="promotions" element={<PromotionsAdminPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="promotion-logs" element={<PromotionLogsPage />} />
        <Route path="news" element={<NewsAdminPage />} />
        <Route path="news-categories" element={<NewsCategoriesPage />} />
        <Route path="reviews" element={<ReviewsModerationPage />} />
        <Route path="bank-accounts" element={<BankAccountsPage />} />
        <Route path="rank" element={<RankPage />} />
      </Route>

      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/news" element={<NewsListPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="/gold-prices" element={<GoldPricePage />} />

        <Route element={<RequireGuest />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
