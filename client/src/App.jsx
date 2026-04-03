import React, { useEffect } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import CustomerLayout from "./layout/CustomerLayout";
import SubCategory from "./pages/admin/SubCategory/index";
import AddSubCategory from "./pages/admin/SubCategory/add";
import EditSubCategory from "./pages/admin/SubCategory/edit";

import Home from "./pages/Home";

import ProfilePage from "./pages/ProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import { useDispatch } from "react-redux";
import AdminOrStaffRoute from "./components/routers/AdminOrStaffRoute";
import RequireAuth from "./components/guards/RequireAuth";
import RequireGuest from "./components/guards/RequireGuest";
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
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
