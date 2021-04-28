import { Sequelize, DataTypes } from 'sequelize';
import UserModel from './models/User';
import VideoModel from './models/Video';
import VideoLikeModel from './models/VideoLike';
import CommentModel from './models/Comment';
import SubscriptionModel from './models/Subscription';
import ViewModel from './models/View';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
});
(async () => await sequelize.sync({ alter: true }))();

const User = UserModel(sequelize, DataTypes);
const Video = VideoModel(sequelize, DataTypes);
const VideoLike = VideoLikeModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);
const View = ViewModel(sequelize, DataTypes);

Video.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Video, { through: VideoLike, foreignKey: 'userId' });
Video.belongsToMany(User, { through: VideoLike, foreignKey: 'videoId' });

User.hasMany(Comment, {
  foreignKey: 'userId'
});
Comment.belongsTo(User, { foreignKey: 'userId' });

Video.hasMany(Comment, {
  foreignKey: 'videoId'
})

User.hasMany(Subscription, {
  foreignKey: 'subscribeTo'
})

User.belongsToMany(Video, { through: View, foreignKey: 'userId' });
Video.belongsToMany(User, { through: View, foreignKey: 'videoId' });


export default [
  User,
  Video,
  VideoLike,
  Comment,
  Subscription,
  View
]