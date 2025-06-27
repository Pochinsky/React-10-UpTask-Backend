import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes";

dotenv.config();

connectDB();

const server = express();

// Lecture JSON
server.use(express.json());

// Routes
server.use("/api/projects", projectRoutes);

export default server;
