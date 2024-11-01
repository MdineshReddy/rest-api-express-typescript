import { Router } from "express";
import {
  getAllJobs,
  getJob,
  createJob,
  deleteJob,
  updateJob,
} from "../controllers/jobs";

const router = Router();

router.route("/").get(getAllJobs).post(createJob);
router.route("/:id").patch(updateJob).get(getJob).delete(deleteJob);

export default router;
