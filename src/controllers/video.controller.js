import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const skip = (page - 1) * limit;

  let matchQuery = {
    isPublished: { $ne: false },
  };
  if (query && typeof query === "string" && query.trim() !== "") {
    matchQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  const sortObject = {};
  if (sortBy && sortType) {
    sortObject[sortBy] = sortType === "asc" ? 1 : -1;
  }

  const videos = await Video.aggregate([
    {
      $match: matchQuery
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              title: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: sortObject,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "title and description is required");
  }

  let videoFileLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoFileLocalPath = req.files.videoFile[0].path;
  }

  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video and thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const newVideo = await Video.create({
    thumbnail: thumbnail.url,
    videoFile: videoFile.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user._id,
  });

  if (!newVideo) {
    throw new ApiError(500, "Internal Error while publishing the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(404, "Video Not Found");
  }
  const video = await Video.findById(videoId);

  return res.status(200).json(new ApiResponse(200, video, "video fetched"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;
  console.log(title, description, thumbnailLocalPath);
  //TODO: update video details like title, description, thumbnail
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      409,
      "Access denied: You do not have permission to modify this video"
    );
  }

  if (thumbnailLocalPath) {
    video.thumbnail = (await uploadOnCloudinary(thumbnailLocalPath)).url;
  }

  if (title) video.title = title;
  if (description) video.description = description;

  const updatedVideo = await video.save({ valdateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      409,
      "Access denied: You do not have permission to delete this video"
    );
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video successfully deleted!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      409,
      "Access denied: You do not have permission to modify this video"
    );
  }

  video.isPublished = !video.isPublished;
  const toggleStatus = await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, toggleStatus, "Publish Status Toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
