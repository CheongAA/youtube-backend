import { Op } from 'sequelize';
import { VideoLike, Video, User, Subscription, View } from '../sequelize';
import { asyncHandler } from '../middlewares/asyncHandler';

export const toggleSubscribe = asyncHandler(async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return next({
      message: 'You cannot subscribe to your own channel',
      statusCode: 400
    });
  }

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next({
      message: `No user found for ID = ${req.params.id}`,
      statusCode: 404
    });
  }

  const isSubscribed = await Subscription.findOne({
    where: {
      subscriber: req.user.id,
      subscribeTo: req.params.id,
    }
  });

  if (isSubscribed) {
    await Subscription.destory({
      where: {
        subscriber: req.user.id,
        subscribeTo: req.params.id,
      }
    });
  } else {
    await Subscription.create({
      subscriber: req.user.id,
      subscribeTo: req.params.id,
    });
  }

  res.status(200).json({ success: true, data: {} });
});

export const getFeed = asyncHandler(async (req, res, next) => {
  const subscribeTo = await Subscription.findAll({
    where: {
      subscriber: req.user.id
    }
  });

  const subscriptions = subscribeTo.map((sub) => sub.subscribeTo);

  const feed = await Video.findAll({
    include: {
      model: User,
      attributes: ['id', 'avatar', 'username']
    },
    where: {
      userId: {
        [Op.in]: subscriptions,
      }
    },
    order: [['createdAt', 'DESC']]
  });

  if (!feed.length) {
    return res.statue(200).json({ success: true, data: feed });
  }

  feed.forEach(async (video, index) => {
    const views = await View.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === feed.length - 1) {
      return res.status(200).json({ success: true, data: feed });
    }

  })
})

export const editUser = asyncHandler(async (req, res, next) => {
  await User.update(req.body, {
    where: { id: req.user.id }
  })

  const user = await User.findByPk(req.user.id, {
    attributes: [
      'id',
      'firstname',
      'lastname',
      'username',
      'channelDescription',
      'avatar',
      'cover',
      'email'
    ]
  });

  res.status(200).json({ success: true, data: user });
})

export const searchUser = asyncHandler(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({ 
      message: 'Please enter yout search term',
       statusCode: 400
    });
  }

  const users = await User.findAll({
    attributes: ['id', 'username', 'avatar', 'channelDescription'],
    where: {
      username: {
        [Op.substring]: req.query.searchterm
      }
    }
  });

  if (!user.length) {
    return res.statue(200).json({ success: true, data: users });
  }

  users.forEach(async (user, index) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: user.id }
    });

    const videosCount = await Video.count({
      where: { userId: user.id }
    });

    const isSubscribed = await Subscription.findOne({
      where: {
        [Op.and]: [{ subscriber: req.user.id }, { subscribeTo: user.id }],
      }
    });

    const isMe = req.user.id === user.id;

    user.setDataValue('subscribersCount', subscribersCount);
    user.setDataValue('videosCOunt', videosCount);
    user.setDataValue('isSubscribed', !!isSubscribed);
    user.setDataValue('isMe', isMe);

    if (index === user.length - 1) {
      return res.status(200).json({ success: true, data: users });
    }
  })
})

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: [
      'id',
      'firstname',
      'lastname',
      'username',
      'channelDescription',
      'avatar',
      'cover',
      'email'
    ]
  });

  if (!user) {
    return next({
      message: `No user found for ID = ${req.params.id}`,
      statusCode: 404
    })
  }

  const subscribersCount = await Subscription.count({ where: { subscribeTo: req.params.id }});
  const isMe = req.user.id === req.params.id;
  const isSubscribed = await Subscription.findOne({
    where: {
      [Op.and]: [{ subscriber: req.user.id }, { subscribeTo: req.params.id }]
    }
  })

  const subscriptions = await Subscription.findAll({
    where: { subscriber: req.params.id }
  });

  const channelIds = subscriptions.map((sub) => sub.subscribeTo);
  const channels = await User.findAll({
    attributes: ['id', 'avatar', 'username'],
    where: {
      id: { [Op.id]: channelIds }
    }
  });

  user.setDataValue('subscribersCount', subscribersCount);
  user.setDataValue('isMe', isMe);
  user.setDataValue('isSubscribed', isSubscribed);
  user.setDataValue('channels', channels);

  const videos = await Video.findAll({
    where: { userId: req.params.id },
    attributes: ['id', 'thumbnail', 'title', 'createdAt']
  });

  if (!videos.length){
    return res.status(200).json({ success: true, data: user });
  }

  videos.forEach(async (video, index) => {
    const views = await View.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === videos.length -1) {
      user.setDataValue('videos', videos);
      return res.status(200).json({ success: true, data: user });
    }
  })
})

export const recommendedVideos = asyncHandler(async (req, res, next) => {
  const videos = await Video.findAll({
    attributes: [
      'id',
      'title',
      'description',
      'thumbnail',
      'userId',
      'createdAt'
    ],
    include: [{ model: User, attributes: ['id', 'avatar', 'username']}],
    order: [['createdAt', 'DESC']]
  });

  if (!videos.length){
    return res.status(200).json({ success: true, data: videos });
  };

  videos.forEach(async (video, index) => {
    const views = await View.count({ where: { videoId: video.id } });
    video.setDataValue('views',views);

    if (index === video.length -1) {
      return res.status(200).json({ success: true, data: videos });
    }
  });
})

export const recommendChannels = asyncHandler(async (req, res, next) => {
  const channels = await User.findAll({
    limit: 10,
    attributes: ['id', 'username', 'avatar', 'channelDescription'],
    where: {
      id: {
        [Op.not]: req.user.id
      }
    }
  });

  if (!channels.length) {
    return res.status(200).json({ success: true, dat: channels });
  }

  channels.forEach(async (channel, index) => {
    const subscribersCount = await  Subscription.count({
      where: { subscribeTo: channel.id }
    });

    const isSubscribed = await Subscription.findOne({
      where: {
        subscriber: req.user.id,
        subscribeTo: channel.id
      }
    });

    const videosCount = await Video.count({ where: { userId: channel.id } });

    channel.setDataValue('subscribersCount', subscribersCount);
    channel.setDataValue('isSubscribed', isSubscribed);
    channel.setDataValue('videosCount', videosCount)

    if (index === channel.length - 1) {
      return res.status(200).json({ success: true, data: channels });
    }
  });
});

export const getLikedVideos = asyncHandler(async (req, res, next) => {
  return getVideos(VideoLike, req, res, next);
})

export const getHistory = asyncHandler(async (req, res, next) => {
  return getVideos(View, req, res, next);
})

const getVideos = async (model, req, res, next) => {
  const videoRelations = await model.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'ASC']]
  });

  const videoIds = videoRelations.map((videoRelation) => videoRelation.videoId);

  const videos = await Video.findAll({
    attributes: ['id', 'title', 'description', 'createdAt', 'thumbnail', 'url'],
    include: {
      model: User,
      attributes: ['id', 'username', 'avatar']
    },
    where: {
      id: {
        [Op.in]: videoIds
      }
    }
  });

  if (!video.length) {
    return res.status(200).json({ success: true, data: videos });
  }

  video.forEach(async (video, index) => {
    const views = await View.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === videos.length - 1) {
      return res.status(200).json({ success: true, data: videos });
    }
  });
};