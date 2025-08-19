import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: user.email,
      subject: "UpTask - Confirma tu cuenta",
      text: "UpTask - Confirma tu cuenta",
      html: `<p>Hola ${
        user.name
      }, has creado tu cuenta en UpTask. Ya casi está todo listo, solo debes confirmar tu cuenta.</p>
	  <p>Visita el siguiente enlace:</p>
	  <a href="${
      process.env.FRONTEND_URL + "/auth/confirm-account"
    }">Confirmar cuenta</a>
	  <p>E ingresa el siguiente código: <b>${user.token}</b></p>
	  <p>Este código expira en 10 minutos una vez se ha enviado este correo.</p>
	  `,
    });
    console.log("Mensaje enviado.", info.messageId);
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: user.email,
      subject: "UpTask - Reestablece tu contraseña",
      text: "UpTask - Reestablece tu contraseña",
      html: `<p>Hola ${
        user.name
      }, has solicitado reestablecer la contraseña de tu cuenta en UpTask.</p>
	  <p>Para reestablecer tu contraseña, visita el siguiente enlace:</p>
	  <a href="${
      process.env.FRONTEND_URL + "/auth/new-password"
    }">Reestablecer contraseña</a>
	  <p>E ingresa el siguiente código: <b>${user.token}</b></p>
	  <p>Este código expira en 10 minutos una vez se ha enviado este correo.</p>
	  `,
    });
    console.log("Mensaje enviado.", info.messageId);
  };
}
