import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

export const register = async ({ name, email, password }) => {
  if (!db.User) {
    const error = new Error("User model not configured");
    error.statusCode = 500;
    throw error;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await db.User.create({
    email,
    password_hash: hashed,
    role_id: 2,
    status: "active",
  });
  return { id: user.id, email: user.email };
};

export const login = async ({ email, password }) => {
  if (!db.User) {
    const error = new Error("User model not configured");
    error.statusCode = 500;
    throw error;
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: user.id, role_id: user.role_id };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });

  return { token };
};
