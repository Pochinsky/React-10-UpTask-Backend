import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { hashPassword } from "../utils/auth";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // prevent duplicated
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El correo utilizado ya está registrado");
        res.status(409).json({ error: error.message });
        return;
      }

      // create user
      const user = new User(req.body);

      // hash password
      user.password = await hashPassword(password);

      // save user
      await user.save();
      res.send(
        "Cuenta creada, se ha enviado un correo de confirmación a tu email"
      );
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };
}
