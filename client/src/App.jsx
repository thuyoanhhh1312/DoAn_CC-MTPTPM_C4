import React from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import SubCategory from "./pages/admin/SubCategory/index";
import AddSubCategory from "./pages/admin/SubCategory/add";
import EditSubCategory from "./pages/admin/SubCategory/edit";
import SignInPage from "./pages/customer/SignInPage";
import { useAuth } from "@/contexts/AuthContext";
import { extractUserRoles } from "@/utils/roles";

const AdminStaffGuard = ({ children }) => {
  const { isInitializing, isAuthenticated, user } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const roles = extractUserRoles(user);
  const isAllowed = roles.includes("admin") || roles.includes("staff");

  if (!isAllowed) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />

        <Route element={<AdminLayout />}>
          <Route
            path="/admin/subcategories"
            element={
              <AdminStaffGuard>
                <SubCategory />
              </AdminStaffGuard>
            }
          />
          <Route
            path="/admin/subcategories/add"
            element={
              <AdminStaffGuard>
                <AddSubCategory />
              </AdminStaffGuard>
            }
          />
          <Route
            path="/admin/subcategories/edit/:id"
            element={
              <AdminStaffGuard>
                <EditSubCategory />
              </AdminStaffGuard>
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/admin/subcategories" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
