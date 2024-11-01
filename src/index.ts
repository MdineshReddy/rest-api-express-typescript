import "dotenv/config";
import "express-async-errors";
import express, { Request, Response } from "express";
import connectDB from "./db/connect";
import authRouter from "./routes/auth";
import jobRouter from "./routes/jobs";
import authenticateUser from "./middleware/authentication";
import notFoundMiddleware from "./middleware/not-found";
import errorHandlerMiddleware from "./middleware/error-handler";

import helmet from "helmet";
import cors from "cors";
// import xss from "xss-clean";
import rateLimiter from "express-rate-limit";

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
// app.use(xss());

// Route to test API
app.get("/", (req: Request, res: Response) => {
  res.send("Jobs API");
});

// Define routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobRouter);

// Error-handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

// Start the server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI as string);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
