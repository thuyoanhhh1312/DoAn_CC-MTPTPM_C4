import * as authService from "../services/authService.js";

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { id, role_id } = req.user;
    const result = await authService.refresh(id, role_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const { id } = req.user;
    const result = await authService.getMe(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    const { id } = req.user;
    const result = await authService.signout(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
