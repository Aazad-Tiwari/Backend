import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const videoViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $group: {
        _id : "$owner",
        totalViews : { $sum : "$views" },
        totalLikes : {$sum : {$size : "$likes"}},
        totalSubscribers : {$first : {$size : "$subscribers"}},
        totalVideos : {$sum : 1}
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videoViews, "fetch success"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.find({
    owner : req.user._id
  })

  return res
  .status(200)
  .json(new ApiResponse(200, videos, "videos fetched"))
});

export { getChannelStats, getChannelVideos };
