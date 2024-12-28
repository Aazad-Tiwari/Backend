import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (userId, typeId, type, res) => {

  const like = await Like.findOne({ [type]: typeId, likedBy: userId });

  if (!like) {
    const newLike = await Like.create({ [type]: typeId, likedBy: userId });

    if (!newLike) {
      throw new ApiError(500, `Unable to like ${type}`);
    }

    const likeCount = await Like.countDocuments({[type]: typeId})

    return res.status(200).json(new ApiResponse(200, {like : newLike, likeCount}, `${type} Liked`));
  }

  const deletedLike = await Like.findByIdAndDelete(like._id);

  if (!deletedLike) {
    throw new ApiError(500, "unable to unlike");
  }

  const likeCount = await Like.countDocuments({[type]: typeId})

  return res
    .status(200)
    .json(new ApiResponse(200, {deletedLike, likeCount}, `${type} Unliked`));
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  await toggleLike(userId, videoId, "video", res);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  await toggleLike(userId, commentId, "comment", res);
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  await toggleLike(userId, tweetId, "tweet", res);
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const videos = await Like.aggregate([
    {
        $match : {
            likedBy : req.user._id,
            video : {$ne : null}
        }
    },
    {
        $lookup : {
            from : "videos",
            localField : "video",
            foreignField : "_id",
            as : "likedVideos"
        }
    },
    {
        $unwind : "$likedVideos"
    },
    {
        $project : {
            "likedVideos.title" : 1,
            "likedVideos.thumbnail" : 1,
        }
    }
  ])

  return res
  .status(200)
  .json(new ApiResponse(200, videos, "Like Videos fetched Successfully!!"))

});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
