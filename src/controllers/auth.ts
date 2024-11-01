import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import { BadRequestError, UnauthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes"; 

 
// Register function
const register = async (req: Request, res: Response) => {
    const user = await User.create({
        ...req.body,
    }) as IUser;
    const token = user.getToken();
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

// Login function
const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password!");
    }
    const user = await User.findOne({ email }) as IUser;

    if (!user) {
        throw new UnauthenticatedError("Invalid Credentials");
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid Credentials");
    }

    // Generate token
    const token = user.getToken();
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

export { register, login };
