import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const skip = (page - 1) * limit;

  const matchQuery = {};
  if (query) {
    matchQuery.title = { $regex: query, $options: "i" }; // Search by title if query is provided
  }
  if (userId) {
    matchQuery.owner = { $regex: userId, $options: "i" }; // Search by owner if username is provided
  }

  const sortObject = {};
  if (sortBy && sortType) {
    sortObject[sortBy] = sortType === "asc" ? 1 : -1
  }

  const videos = await Video.aggregate([
    {
      $match: matchQuery,
    },
    {
        $lookup : {
            from : "users",
            localField : "owner",
            foreignField : "_id",
            as : "owner",
            pipeline : [
                {
                    $project : {
                        fullName : 1,
                        title : 1,
                        avatar : 1
                    }
                }
            ]
        },
    },
    // {
    //     $addFields : {
    //         owner : {
    //             $fields : "$owner"
    //         }
    //     }
    // },
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
  .json(new ApiResponse(200, videos, "videos fetched successfully"))

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400, "title and description is required")
    }

    let videoFileLocalPath;
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0].path
    }

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "video and thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    // const newVideo = await Video.create({

    // })

    console.log(videoFile.duration, thumbnail);
    

    return res
    .status(200)

});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
