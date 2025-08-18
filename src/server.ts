import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import { corsConfig } from "./config/cors";

dotenv.config();

connectDB();

const server = express();

server.use(cors(corsConfig));

server.use(morgan("dev"));

server.use(express.json());

server.use("/api/auth", authRoutes);
server.use("/api/projects", projectRoutes);

export default server;
