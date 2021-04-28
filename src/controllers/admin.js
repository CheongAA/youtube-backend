import { User, Video } from '../sequelize';
import { asyncHandler } from '../middlewares/asyncHandler';

export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.findAll({
    attributes: ['id', 'firstname', 'lastname', 'username', 'email']
  });

  res.status(200).json({ success: true, data: users });
});

export const removeUser = asyncHandler(async (req, res, next) => {
  await User.destory({
    where: { username: req.params.username }
  });

  res.status(200).json({ success: true, data: {} });
})

export const removeVideo = asyncHandler(async (req, res, next) => {
  await Video.destory({
    where: { id: req.params.id }
  });

  res.status(200).json({ success: true, data: {} });
})

export const getVideos = asyncHandler(async (req, res, next) => {
  const videos = await Video.findAll({
    attributes: ['id', 'title', 'description', 'url', 'thumbnail', 'userId'],
  });

  res.status(200).json({ success: true, data: videos });
})