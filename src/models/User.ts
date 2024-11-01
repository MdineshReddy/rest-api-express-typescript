import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

// Define an interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  getToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

// Define the schema
const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
});

// Mongoose Middleware / Hooks
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance Methods
UserSchema.methods.getToken = function (): string {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET as Secret,
    { expiresIn: "30d" }
  );
};

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Define and export the model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
