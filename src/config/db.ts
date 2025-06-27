import moongose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

export const connectDB = async () => {
  try {
    const uri = process.env.DATABASE_URI;
    const { connection } = await moongose.connect(uri);
    const url = `${connection.host}:${connection.port}`;
    console.log(colors.magenta.bold(`MongoDB connected in: ${url}`));
  } catch (error) {
    console.log(colors.red.bold("Error trying to connect to DB"));
    exit(1);
  }
};
