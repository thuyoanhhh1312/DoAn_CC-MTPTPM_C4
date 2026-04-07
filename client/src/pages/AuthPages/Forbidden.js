import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthPageLayout";

export default function Forbidden() {
  return (
    <AuthLayout>
      <div className="flex flex-col flex-1 items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            Error 403
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Không có quyền truy cập
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Tài khoản của bạn không có quyền để truy cập trang này.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Về trang chủ
            </Link>
            <Link
              to="/signin"
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
