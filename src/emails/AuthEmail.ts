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
      html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask. Ya casi está todo listo, solo debes confirmar tu cuenta.</p>
	  <p>Visita el siguiente enlace:</p>
	  <a href="">Confirmar cuenta</a>
	  <p>E ingresa el siguiente código: <b>${user.token}</b></p>
	  <p>Este código expira en 10 minutos una vez se ha enviado este correo.</p>
	  `,
    });
    console.log(info.messageId);
  };
}
