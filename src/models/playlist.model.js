import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      default: "Untitled",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Playlist = model("Playlist", playlistSchema);
