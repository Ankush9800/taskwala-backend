import mongoose, { Schema } from "mongoose";

const campaignSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    payoutRate: {
      type: Number,
      required: true,
    },
    campId:{
      type : String,
      required: true
    },
    trackingUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    stepsToFollow: {
      type: String,
    },
    campaignImage: {
      type: String,
    },
    imgPubid:{
      type: String
    },
    provider:{
      type : String,

    },
    campaignStatus: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ createdAt: -1 })

export const Campaign = mongoose.model("Campaign", campaignSchema);
