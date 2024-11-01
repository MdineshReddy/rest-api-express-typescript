import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "../errors";

// Define a type for the error object
interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, string>;
    errors?: Record<string, { message: string }>;
    value?: string;
}

const ErrorHandlerMiddleware: ErrorRequestHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    let customError = {
        // Set defaults
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, try again later",
    };

    // if (err instanceof CustomAPIError) {
    //   return res.status(err.statusCode).json({ msg: err.message });
    // }

    // Handle specific error cases which might occur while doing db operations
    if (err.code && err.code === 11000) {
        customError.statusCode = StatusCodes.BAD_REQUEST;
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue || {}
        )} field, please choose another value.`;
    }

    if (err.name === "ValidationError" && err.errors) {
        customError.statusCode = StatusCodes.BAD_REQUEST;
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    if (err.name === "CastError" && err.value) {
        customError.statusCode = StatusCodes.NOT_FOUND;
        customError.msg = `No item found with ID: ${err.value}`;
    }

    res.status(customError.statusCode).json({ msg: customError.msg });
};

export default ErrorHandlerMiddleware;
