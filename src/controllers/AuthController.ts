import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

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
        const error = new Error("Código no válido");
        res.status(404).json({ error: error.message });
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

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // check if account is confirmed
      if (!user.confirmed) {
        // generate new token
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        // send confirmation email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        // response error
        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un correo de confirmación a tu email"
        );
        res.status(401).json({ error: error.message });
        return;
      }

      // check if password is correct
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("La contraseña es incorrecta");
        res.status(401).json({ error: error.message });
        return;
      }

      // send json web token
      const token = generateJWT({ id: user.id });
      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // check if user exist
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // check if user is confirmed
      if (user.confirmed) {
        const error = new Error("El usuario ya está confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

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
      res.send("Se te ha enviado un nuevo código");
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // check if user exist
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // generate token and save it
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // send confirmation email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send(
        "Se te ha enviado un mail con los pasos a seguir para reestablecer tu contraseña"
      );
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      // check if token exists
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Código no válido");
        res.status(404).json({ error: error.message });
        return;
      }

      res.send("Código válido, establece tu nueva contraseña");
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // check if token exists
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Código no válido");
        res.status(404).json({ error: error.message });
        return;
      }

      // hash password
      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      // save user and delete token
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("La contraseña ha sido reestablecida");
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getUser = async (req: Request, res: Response) => {
    res.json(req.user);
  };
}
