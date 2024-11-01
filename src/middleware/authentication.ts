import User from "../models/User";
import jwt, { Secret } from "jsonwebtoken";
import { UnauthenticatedError } from "../errors";
import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    name: string;
  };
}

const authenticationMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as Secret
    ) as jwt.JwtPayload;
    // (jwt.verify(...) as jwt.JwtPayload) ensures userId and name can be destructured safely.
    const { userId, name } = decoded;
    // const user = await User.findById(userId).select("-password");

    req.user = { userId, name };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

export default authenticationMiddleware;
