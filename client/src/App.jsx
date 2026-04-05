import React, { useEffect } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import CustomerLayout from "./layout/CustomerLayout";
import SubCategory from "./pages/admin/SubCategory/index";
import AddSubCategory from "./pages/admin/SubCategory/add";
import EditSubCategory from "./pages/admin/SubCategory/edit";
import Search from "./pages/Search";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";

import Dashboard from "./pages/admin/Dashboard";

import ProfilePage from "./pages/ProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import { useDispatch } from "react-redux";
import AdminRoute from "./components/routers/AdminRoute";
import AdminOrStaffRoute from "./components/routers/AdminOrStaffRoute";
import RequireAuth from "./components/guards/RequireAuth";
import RequireGuest from "./components/guards/RequireGuest";
import Campaign from "./pages/admin/Campaign/index";
import AddCampaign from "./pages/admin/Campaign/add";
import EditCampaign from "./pages/admin/Campaign/edit";

import AdminNews from "./pages/admin/News/index";
import AddNews from "./pages/admin/News/add";
import EditNews from "./pages/admin/News/edit";

import NewsCategory from "./pages/admin/NewsCategory/index";
import AddNewsCategory from "./pages/admin/NewsCategory/add";
import EditNewsCategory from "./pages/admin/NewsCategory/edit";

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
              <AdminRoute>
                <Navigate to="/admin/dashboard" replace />
              </AdminRoute>
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
            path="/admin/subcategories"
            element={
              <AdminOrStaffRoute>
                <SubCategory />
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
              <AdminOrStaffRoute>
                <Campaign />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/campaigns/add"
            element={
              <AdminOrStaffRoute>
                <AddCampaign />
              </AdminOrStaffRoute>
            }
          />
          <Route
            path="/admin/campaigns/edit/:id"
            element={
              <AdminOrStaffRoute>
                <EditCampaign />
              </AdminOrStaffRoute>
            }
          />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/:slug" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
