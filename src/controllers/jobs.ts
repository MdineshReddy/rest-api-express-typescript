import { Request, Response } from "express";
import Job from "../models/Job";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors";

// Define custom user property on Request interface
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
    };
}

// Get all jobs for the user
const getAllJobs = async (req: Request, res: Response) => {
    const jobs = await Job.find({ createdBy: (req as AuthenticatedRequest).user.userId }).sort("createdAt");
    res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

// Get a specific job by ID
const getJob = async (req: Request, res: Response) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req as AuthenticatedRequest;

    const job = await Job.findOne({ _id: jobId, createdBy: userId });

    if (!job) {
        throw new NotFoundError(`No Job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json(job);
};

// Create a new job
const createJob = async (req: Request, res: Response) => {
    req.body.createdBy = (req as AuthenticatedRequest).user.userId;
    const job = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json(job);
};

// Delete a job
const deleteJob = async (req: Request, res: Response) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req as AuthenticatedRequest;

    const job = await Job.findOneAndDelete({ _id: jobId, createdBy: userId });

    if (!job) {
        throw new NotFoundError(`No Job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).send("Job Deleted");
};

// Update a job
const updateJob = async (req: Request, res: Response) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId },
    } = req as AuthenticatedRequest;

    if (company === "" || position === "") {
        throw new BadRequestError("Company or Position Fields Cannot be empty");
    }

    const job = await Job.findOneAndUpdate(
        { _id: jobId, createdBy: userId },
        req.body,
        { runValidators: true, new: true }
    );

    if (!job) {
        throw new NotFoundError(`No Job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json(job);
};

export { getAllJobs, getJob, createJob, deleteJob, updateJob };
