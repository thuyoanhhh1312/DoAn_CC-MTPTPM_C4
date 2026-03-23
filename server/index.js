import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import apiRoutes from "./routes/apiRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { verifyDbConnection } from "./config/db.js";

dotenv.config();

const app = express();

// Basic request logging (keep light in production)
app.use((req, res, next) => {
  console.log(`\n=== Incoming Request ===`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Origin:`, req.get("Origin") || "No Origin");
  console.log(`========================\n`);
  next();
});

const corsOptions = {
  origin: true,
  credentials: true,
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
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, authtoken"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", apiRoutes);

// Global error handler
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);

  await verifyDbConnection();

  console.log("✅ Server ready");
});

export default app;
