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
    name: name || email.split("@")[0],
    email,
    password_hash: hashed,
    role_id: 2,
    status: "active",
  });
  return { id: user.id, email: user.email };
};

const buildUserResponse = async (user) => {
  if (!user) return null;

  const roleData = await user.getRole();
  const roles = roleData ? [roleData.name] : [];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
  };
};

export const login = async ({ email, password }) => {
  if (!db.User) {
    const error = new Error("User model not configured");
    error.statusCode = 500;
    throw error;
  }

  const user = await db.User.findOne({ 
    where: { email },
    include: [{ model: db.Role, as: 'Role' }]
  });
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
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });

  const userResponse = await buildUserResponse(user);

  return { 
    accessToken,
    user: userResponse
  };
};

export const refresh = async (userId, roleId) => {
  if (!db.User) {
    const error = new Error("User model not configured");
    error.statusCode = 500;
    throw error;
  }

  const user = await db.User.findByPk(userId, {
    include: [{ model: db.Role, as: 'Role' }]
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: user.id, role_id: user.role_id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });

  return { 
    accessToken,
    user: await buildUserResponse(user)
  };
};

export const getMe = async (userId) => {
  if (!db.User) {
    const error = new Error("User model not configured");
    error.statusCode = 500;
    throw error;
  }

  const user = await db.User.findByPk(userId, {
    include: [{ model: db.Role, as: 'Role' }]
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  return { user: await buildUserResponse(user) };
};

export const signout = async (userId) => {
  // Invalidate refresh token if stored in database
  if (!db.User) {
    const error = new Error("User model not configured");
    error.statusCode = 500;
    throw error;
  }

  await db.User.update(
    { refresh_token: null },
    { where: { id: userId } }
  );

  return { message: "Signed out successfully" };
};
