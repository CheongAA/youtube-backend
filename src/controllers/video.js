import { Op } from 'sequelize';
import { 
  User,
  Video,
  VideoLike,
  Commentm,
  View,
  Subscription
 } from '../sequelize';
 import { asyncHandler } from '../middlewares/asyncHandler';

 export const newVideo = asyncHandler(async (req, res, next) => {
   const video = await Video.create({
     ...req.body,
     userId: req.user.id
   });

   res.status(200).json({ success: true, data: video });
 });

 export const getVideo = asyncHandler(async (req, res, next) => {
   const video = await Video.findByPk(req.params.id, {
     include: [
       {
         model: User,
         attributes: ['id', 'username', 'avatar']
       }
     ]
   });

   if (!video) {
     return next({
       message: `No video found for ID - ${req.params.id}`,
       statusCode: 404
     });
   }

   const comments = await video.getComments({
     include: [
       {
         model: User,
         attributes: ['id', 'username', 'avatar']
       }
     ],
     attributes: ['id', 'text', 'createdAt'],
     order: [['createdAt', 'DESC']]
   });

   const isLiked = await VideoLike.findOne({
     where: {
       [Op.and]: [
         { videoId: req.params.id },
         { userId: req.user.id },
         { like: 1 }
       ]
     }
   });

   const isDisliked = await VideoLike.findOne({
     where: {
       [Op.and]: [
         { videoId: req.params.id },
         { userId: req.user.id },
         { like: -1 },
       ]
     }
   });

   const commentsCount = await Comment.count({
     where: {
       videoId: req.params.id
     }
   });

   const likesCount = await VideoLike.count({
     where: {
       [Op.and]: [{ videoId: req.params.id }, { like: 1 }]
     }
   });

   const dislikesCount = await VideoLike.count({
     where: {
       [Op.and]: [{ videoId: req.params.id }, { like: -1 }]
     }
   });

   const views = await View.count({
     where: {
       videoId: req.params.id,
     }
   })

   const isSubscribed = await Subscription.findOne({
     where: {
       subscriber: req.user.id,
       subscribeTo: video.userId
     }
   });

   const isViewed = await View.findOne({
     where: {
       userId: req.user.id,
       videoId: video.id
     }
   });

   const subscribersCount = await Subscription.count({
     where: { subscribeTo: video.userId }
   });

   const isVideoMine = req.user.id === video.userId;

   video.setDataValue("comments", comments);
   video.setDataValue("commentsCount", commentsCount);
   video.setDataValue("isLiked", !!isLiked);
   video.setDataValue("isDisliked", !!isDisliked);
   video.setDataValue("likesCount", likesCount);
   video.setDataValue("dislikesCount", dislikesCount);
   video.setDataValue("views", views);
   video.setDataValue("isVideoMine", isVideoMine);
   video.setDataValue("isSubscribed", !!isSubscribed);
   video.setDataValue("isViewed", !!isViewed);
   video.setDataValue("subscribersCount", subscribersCount);
 
   res.status(200).json({ success: true, data: video });

 })

 export const likeVideo = asyncHandler(async (req, res, next) => {
   const video = await Video.findByPk(req.params.id);

   if (!video) {
     return next({
       message: `No video found for ID - ${req.params.id}`,
       statusCode: 404
     });
   }

   const liked = await VideoLike.findOne({
     where: {
       userId: req.user.id,
       videoId: req.params.id,
       like: 1
     }
   });

   const disliked = await VideoLike.findOne({
     where: {
       userId: req.user.id,
       videoId: req.params.id,
       like: -1
     }
   });

   if (liked) {
     await liked.destroy();
   }else if (disliked) {
     disliked.like = 1;
     await disliked.save();
   } else {
     await VideoLike.create({
       userId: req.user.id,
       videoId: req.params.id,
       like: 1
     });
   }

   res.status(200).json({ success: true, data: {} });
 })

 export const dislikeVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404
    });
  }

  const liked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: 1
    }
  });

  const disliked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: -1
    }
  });

  if (disliked) {
    await disliked.destroy();
  }else if (liked) {
    liked.like = 1;
    await liked.save();
  } else {
    await VideoLike.create({
      userId: req.user.id,
      videoId: req.params.id,
      like: -1
    });
  }

  res.status(200).json({ success: true, data: {} });
})

export const addComment = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404
    });
  }

  const comment = await Comment.create({
    text: req.body.text,
    userId: req.user.id,
    videoId: req.params.id
  });

  const user = {
    id: req.user.id,
    avatar: req.user.avatar,
    username: req.user.username
  };

  comment.setDataValue('User',user);
  res.status(200).json({ success: true, data: comment });
});

export const newView = asyncHandler(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404
    })
  }

  const viewed = await View.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id
    }
  });

  if (viewed) {
    return next({
      message: 'You already viewed this video',
      statusCode: 400
    });
  }

  await View.create({
    userId: req.user.id,
    videoId: req.params.id
  });

  res.status(200).json({ success: true, data: {} });
});

export const searchVideo = asyncHandler(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({
      message: 'Please enter the searchterm',
      statusCode: 400
    });
  }

  const videos = await Video.findAll({
    include: {
      model: User,
      attributes: ['id', 'avatar', 'username']
    },
    where: {
      [Op.or]: {
        title: {
          [Op.substring]: req.query.searchterm,
        },
        description: {
          [Op.substring]: req.query.searchterm
        }
      }
    }
  });

  if (!videos.length){
    return res.status(200).json({ success: true, data: videos });
  }

  videos.forEach(async (video, index) => {
    const views = await View.count({ where: {videoId: video.id} });
    video.setDataValue('views',views);

    if (index === video.length -1 ) {
      return res.statue(200).json({ success: true, data: videos });
    }
  });
});