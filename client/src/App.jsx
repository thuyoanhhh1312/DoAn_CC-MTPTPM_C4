import React, { useEffect } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import CustomerLayout from "./layout/CustomerLayout";
import SubCategory from "./pages/admin/SubCategory/index";
import AddSubCategory from "./pages/admin/SubCategory/add";
import EditSubCategory from "./pages/admin/SubCategory/edit";
import ProductList from "./pages/admin/Product/index";
import AddProduct from "./pages/admin/Product/add";
import EditProduct from "./pages/admin/Product/edit";
import Search from "./pages/Search";
import Home from "./pages/Home.js";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";

import Dashboard from "./pages/admin/Dashboard";
import RankManagement from "./pages/admin/Rank";

import ProfilePage from "./pages/ProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Forbidden from "./pages/AuthPages/Forbidden";
import { useDispatch, useSelector } from "react-redux";
import AdminRoute from "./components/routers/AdminRoute";
import AdminOrStaffRoute from "./components/routers/AdminOrStaffRoute";
import UserRoute from "./components/routers/UserRoute";
import RequireAuth from "./components/guards/RequireAuth";
import RequireGuest from "./components/guards/RequireGuest";
import Campaign from "./pages/admin/Campaign/index";
import AddCampaign from "./pages/admin/Campaign/add";
import EditCampaign from "./pages/admin/Campaign/edit";
import Checkout from "./pages/checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderFailed from "./pages/OrderFailed";

import AdminNews from "./pages/admin/News/index";
import AddNews from "./pages/admin/News/add";
import EditNews from "./pages/admin/News/edit";

import NewsCategory from "./pages/admin/NewsCategory/index";
import AddNewsCategory from "./pages/admin/NewsCategory/add";
import EditNewsCategory from "./pages/admin/NewsCategory/edit";
import PromotionLogsPage from "./pages/admin/PromotionLogsPage";
import PromotionLogSendPage from "./pages/admin/PromotionLogSendPage";
import PromotionsPage from "./pages/PromotionsPage";
import PromotionsAdminPage from "./pages/admin/PromotionsAdminPage";
import ReviewsModerationPage from "./pages/admin/ReviewsModerationPage";
import CustomersPage from "./pages/admin/CustomersPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import OrdersPage from "./pages/admin/OrdersPage";
import UsersStaffPage from "./pages/admin/UsersStaffPage";

import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";

function AdminEntryRedirect() {
  const user = useSelector((state) => state.user);
  const roleId =
    user?.role_id ??
    JSON.parse(localStorage.getItem("user") || "null")?.role_id;

  if (roleId === 3) {
    return <Navigate to="/admin/subcategories" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
}

function RootEntryRedirect() {
  const user = useSelector((state) => state.user);
  const roleId =
    user?.role_id ??
    JSON.parse(localStorage.getItem("user") || "null")?.role_id;

  if (roleId === 1 || roleId === 3) {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      try {
        const parsedUser = JSON.parse(userFromStorage);
        dispatch({
          type: "LOGGED_IN_USER",
          payload: parsedUser,
        });
      } catch (err) {
        console.error("Lỗi parse user:", err);
      }
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        <Route path="/403" element={<Forbidden />} />

        <Route element={<CustomerLayout />}>
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
          </Route>
        </Route>

        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={
              <AdminOrStaffRoute>
                <AdminEntryRedirect />
              </AdminOrStaffRoute>
            }
          />
          {/*Dashboard*/}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rank"
            element={
              <AdminRoute>
                <RankManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/subcategories"
            element={
              <AdminOrStaffRoute>
                <SubCategory />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminOrStaffRoute>
                <CategoriesPage />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/subcategories/add"
            element={
              <AdminOrStaffRoute>
                <AddSubCategory />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/subcategories/edit/:id"
            element={
              <AdminOrStaffRoute>
                <EditSubCategory />
              </AdminOrStaffRoute>
            }
          />
          {/* Products */}
          <Route
            path="/admin/products"
            element={
              <AdminOrStaffRoute>
                <ProductList />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <AdminOrStaffRoute>
                <AddProduct />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminOrStaffRoute>
                <EditProduct />
              </AdminOrStaffRoute>
            }
          />
          {/* News */}
          <Route
            path="/admin/news"
            element={
              <AdminOrStaffRoute>
                <AdminNews />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/news/add"
            element={
              <AdminOrStaffRoute>
                <AddNews />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/news/edit/:id"
            element={
              <AdminOrStaffRoute>
                <EditNews />
              </AdminOrStaffRoute>
            }
          />
          {/* News Categories */}
          <Route
            path="/admin/news-categories"
            element={
              <AdminOrStaffRoute>
                <NewsCategory />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/news-categories/add"
            element={
              <AdminOrStaffRoute>
                <AddNewsCategory />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/news-categories/edit/:id"
            element={
              <AdminOrStaffRoute>
                <EditNewsCategory />
              </AdminOrStaffRoute>
            }
          />

          {/* Campaigns */}
          <Route
            path="/admin/campaigns"
            element={
              <AdminRoute>
                <Campaign />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/campaigns/add"
            element={
              <AdminRoute>
                <AddCampaign />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/campaigns/edit/:id"
            element={
              <AdminRoute>
                <EditCampaign />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/promotion-logs"
            element={
              <AdminRoute>
                <PromotionLogsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/promotion-logs/send"
            element={
              <AdminRoute>
                <PromotionLogSendPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <AdminRoute>
                <PromotionsAdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminOrStaffRoute>
                <ReviewsModerationPage />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminOrStaffRoute>
                <OrdersPage />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UsersStaffPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/user"
            element={<Navigate to="/admin/users" replace />}
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <CustomersPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="/" element={<RootEntryRedirect />} />
        <Route path="/search" element={<Search />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-failed" element={<OrderFailed />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route
          path="/order-success"
          element={
            <UserRoute>
              <OrderSuccess />
            </UserRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <UserRoute>
              <Checkout />
            </UserRoute>
          }
        />
        <Route path="/:slug" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
