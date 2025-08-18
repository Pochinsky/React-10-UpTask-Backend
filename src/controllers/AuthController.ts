import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";

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

      // generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // send confirmation email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // save user and token
      await Promise.allSettled([user.save(), token.save()]);
      res.send(
        "Cuenta creada, se ha enviado un correo de confirmación a tu email"
      );
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      // check if token exists
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        res.status(401).json({ error: error.message });
        return;
      }

      // change user confirmation
      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      // save user and delete token
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };
}
