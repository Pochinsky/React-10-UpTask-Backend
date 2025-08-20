import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  // check if bearer token exists
  if (!bearer) {
    const error = new Error("No autorizado");
    res.status(401).json({ error: error.message });
    return;
  }

  // get token
  const token = bearer.split(" ")[1];

  // verify json web token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // check if user exists and save user in request
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findById(decoded.id).select("_id email name");
      if (user) {
        req.user = user;
      } else {
        res.status(500).json({ error: "Token no válido" });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Token no válido" });
  }

  next();
};
