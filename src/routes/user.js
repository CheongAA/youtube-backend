import express from 'express';
import {
  toggleSubscribe,
  getFeed,
  editUser,
  searchUser,
  getProfile,
  recommendChannels,
  getLikedVideos,
  getHistory
} from '../controllers/user';
import { protect } from '../middlewares/auth';

export const userRouter = express.Router();

userRouter.route('/').put(protect, editUser);
userRouter.route('/').get(protect, recommendChannels);
userRouter.route('/likedVideos').get(protect, getLikedVideos);
userRouter.route('/history').get(protect, getHistory);
userRouter.route('/feed').get(protect, getFeed);
userRouter.route('/search').get(protect, searchUser);
userRouter.route('/:id').get(protect, getProfile);
userRouter.route('/:id/togglesubscribe').get(protect, toggleSubscribe);
