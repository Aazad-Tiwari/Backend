import { Schema, model } from "mongoose";

const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Tweet = model("Tweet", tweetSchema);
