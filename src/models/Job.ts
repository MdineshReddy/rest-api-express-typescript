import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the Job document
interface IJob extends Document {
  company: string;
  position: string;
  status: "interview" | "declined" | "pending";
  createdBy: mongoose.Types.ObjectId;
}

// Define the schema
const JobSchema: Schema<IJob> = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide company name"],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide position"],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId, // mongoose.Types.ObjectId in javascript
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  {
    timestamps: true,
  }
);

// Define and export the model
const Job: Model<IJob> = mongoose.model<IJob>("Job", JobSchema);
export default Job;
