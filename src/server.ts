import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes";
import { corsConfig } from "./config/cors";

dotenv.config();

connectDB();

const server = express();

server.use(cors(corsConfig));

// Lecture JSON
server.use(express.json());

// Routes
server.use("/api/projects", projectRoutes);

export default server;
