// server/controllers/tagController.js
import db from '../models/index.js';

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await db.Tag.findAll({
      order: [['name', 'ASC']],
    });
    res.json(tags);
  } catch (err) {
    next(err);
  }
};
