import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    phone: {
      type: String,
      required: true,
    },
    upi: {
      type: String,
      required: true,
    },
    payoutRate: {
      type:String,
      required: true
    },
    redirectUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);

export {Submission}