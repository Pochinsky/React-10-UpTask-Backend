import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middlewares/validation";

const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener, al menos, 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Las contraseñas no son iguales");
    return true;
  }),
  body("email").isEmail().withMessage("El email no es válido"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token es obligatorio"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/request-code",
  body("email").isEmail().withMessage("El email no es válido"),
  handleInputErrors,
  AuthController.requestConfirmationCode
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("El email no es válido"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token es obligatorio"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Código no válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener, al menos, 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Las contraseñas no son iguales");
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

export default router;
