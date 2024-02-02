import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { MAILTRAP_USER, MAILTRAP_PASSWORD } = process.env;

const transport = nodemailer.createTransport({
	host: "sandbox.smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: MAILTRAP_USER,
		pass: MAILTRAP_PASSWORD,
	},
});

function sendEmail(message) {
	return transport.sendMail(message);
}

export default sendEmail;
