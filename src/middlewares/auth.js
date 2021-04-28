import jwt from 'jsonwebtoken';
import { User } from '../sequelize';

export const protect = async (req, res, next) => {
  if (!req.haders.authorization) {
    return next({
      message: 'You need to be logged in to visit this route',
      statusCode: 401,
    });
  }

  const token = req.headers.authorization.replace('Bearer', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      attributes: [
        'id',
        'firstname',
        'lastname',
        'username',
        'email',
        'avatar',
        'cover',
        'channelDescription'
      ],
      where: {
        id: decoded.id,
      }
    });

    req.user = user;
    next();
  } catch (err) {
    next({
      message: 'You need to be logged in to visit this route',
      statusCode: 401
    });
  }
};

export const admin = async (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  }

  return next({
    message: 'Authorization denied, only admins can visit this route',
    statusCode: 401
  });
};