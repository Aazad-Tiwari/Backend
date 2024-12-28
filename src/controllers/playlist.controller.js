import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const playlist = await Playlist.create({
        name : name || undefined,
        description : description || undefined,
        owner : req.user._id
    })

    if (!playlist) {
        throw new ApiError(500, "Internal Error while creating playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist , "Playlist Successfully Created!!" ))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const userPlaylists = await Playlist.find({owner : userId}).select("-videos")

    if (!userPlaylists) {
        throw new ApiError(404, "No Playlists Found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userPlaylists , "Playlists Fetched Successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos owner", "title thumbnail fullName username")
    
    if (!playlist) {
        throw new ApiError(404, "No Playlist Found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist , "Playlist Fetched Successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "No Playlist Found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add video to this playlist")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist")
    }

    playlist.videos.push(videoId)
    const updatedPlaylist = await playlist.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist , "Video Added to Playlist Successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "No Playlist Found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to remove video from this playlist")
    }

    playlist.videos = playlist.videos.filter(video => video.toString() !== videoId)

    const updatedPlaylist = await playlist.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist , "Video Removed from Playlist Successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "No Playlist Found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200, {} , "Playlist Deleted Successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    if (!name && !description) {
        throw new ApiError(400, "Please provide name or description to update")
    }
    
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "No Playlist Found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    playlist.name = name || playlist.name
    playlist.description = description || playlist.description

    const updatedPlaylist = await playlist.save({validateBeforeSave : false})

    const updatePlaylist = {name : updatedPlaylist.name, description : updatedPlaylist.description, id : updatedPlaylist._id}

    return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist , "Playlist Updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}