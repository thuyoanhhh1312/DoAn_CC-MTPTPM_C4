// server.js hoặc index.js
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import apiRoutes from "./routes/apiRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import db from "./models/index.js";

const app = express();

const ensureAdminUser = async () => {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    // Ensure Admin role exists
    const adminRole = await db.Role.findOne({ where: { name: "Admin" } });
    if (!adminRole) {
      await db.Role.create({
        id: 1,
        name: "Admin",
        description: "Administrator",
      });
    }

    // Check if admin user exists
    const existingAdmin = await db.User.findOne({
      where: { email: "admin@oanh.local" },
    });

    if (!existingAdmin) {
      const password_hash = await bcrypt.hash("Admin@123", 12);
      await db.User.create({
        name: "Admin User",
        email: "admin@oanh.local",
        password_hash,
        role_id: 1,
      });
      console.log("✅ Admin user created: admin@oanh.local");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
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

// Local upload static serving for CKEditor blog images
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// API routes
app.use(apiRoutes);
app.use("/api", apiRoutes);

// middleware xử lý lỗi toàn cục
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, async () => {
  try {
    // Create admin user
    await ensureAdminUser();
  } catch (error) {
    console.error("❌ Initialization error:", error.message);
  }
  console.log(`Server đang chạy trên http://localhost:${port}`);
  console.log(`Server cũng có thể truy cập qua http://127.0.0.1:${port}`);
});

export default app;
