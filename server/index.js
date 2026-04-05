// server.js hoặc index.js
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import vnpayRouter from "./vnpay/payment.js";

import apiRoutes from "./routes/apiRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import db from "./models/index.js";

const app = express();

const ensureDemoUsers = async () => {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const demoUsers = [
    {
      name: "Admin Operator",
      email: "admin@jewel.local",
      password: "Admin@123",
      role_id: 1,
    },
    {
      name: "Staff Operator",
      email: "staff@jewel.local",
      password: "Staff@123",
      role_id: 3,
    },
    {
      name: "Customer Demo",
      email: "customer@jewel.local",
      password: "Customer@123",
      role_id: 2,
    },
  ];

  for (const demoUser of demoUsers) {
    const existingUser = await db.User.findOne({
      where: { email: demoUser.email },
    });

    if (existingUser) {
      continue;
    }

    const password_hash = await bcrypt.hash(demoUser.password, 12);
    await db.User.create({
      name: demoUser.name,
      email: demoUser.email,
      password_hash,
      role_id: demoUser.role_id,
    });
  }
};

//app.use(express.json());

// Logging middleware để debug
app.use((req, res, next) => {
  console.log(`\n=== Incoming Request ===`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Headers:`, req.headers);
  console.log(`Origin:`, req.get("Origin") || "No Origin");
  console.log(`========================\n`);
  next();
});

const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true, // Allow credentials
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,authtoken",
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Additional CORS headers for Flutter web
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, authtoken",
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
// ⬇️ body parser để SAU CORS và TĂNG LIMIT
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Upload routes
app.use("/api/payment", vnpayRouter);
// API routes
app.use(apiRoutes);
app.use("/api", apiRoutes);

// middleware xử lý lỗi toàn cục
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, async () => {
  try {
    await ensureDemoUsers();
  } catch (error) {
    console.error("Không thể khởi tạo tài khoản demo:", error.message);
  }
  console.log(`Server đang chạy trên http://localhost:${port}`);
  console.log(`Server cũng có thể truy cập qua http://127.0.0.1:${port}`);
});

export default app;
