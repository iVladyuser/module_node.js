import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";

import HttpError from "../helpers/HttpError.js";
import User from "../models/user.js";
import sendEmail from "../helpers/sendEmail.js";
const avatarsDir = path.resolve("public", "avatars");

export const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, "Email in use");
	}

	const hashPassword = await bcrypt.hash(password, 10);
	const avatarURL = gravatar.url(email);

	const { BASE_URL } = process.env;
	const verificationToken = nanoid();

	const verifyEmail = {
		to: email,
		from: "jw.listal@gmail.com",
		subject: "Welcome to phonebook",
		http: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
		text: `To confirm your registration please open the link ${BASE_URL}/api/users/verify/${verificationToken}`,
	};
	await sendEmail(verifyEmail);

	const newUser = await User.create({
		...req.body,
		password: hashPassword,
		avatarURL,
		verificationToken,
	});
	res.status(201).json({
		user: {
			email: newUser.email,
			subscription: newUser.subscription,
		},
	});
};

export const verifyEmail = async (req, res) => {
	const { verificationToken } = req.params;

	const user = await User.findOne({ verificationToken });
	console.log(user);
	if (user === null) {
		throw HttpError(404, "User not found");
	}
	await User.findByIdAndUpdate(user._id, {
		verify: true,
		verificationToken: null,
	});

	res.status(200).json({
		message: "Verification successful",
	});
};

export const resendVerifyEmail = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (user.verify) {
		throw HttpError(400, "Verification has already been passed");
	}
	const { BASE_URL } = process.env;
	const verifyEmail = {
		to: email,
		from: "jw.listal@gmail.com",
		subject: "Welcome to phonebook",
		http: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to verify email</a>`,
		text: `To confirm your registration please open the link ${BASE_URL}/api/auth/verify/${user.verificationToken}`,
	};
	await sendEmail(verifyEmail);

	res.json({
		message: "Verify email send",
	});
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, "Email or password invalid");
	}

	if (!user.verify) {
		throw HttpError(401, "Your account is not verified");
	}

	const passwordCompare = await bcrypt.compare(password, user.password);

	if (!passwordCompare) {
		throw HttpError(401, "Email or password invalid");
	}

	const payload = {
		id: user._id,
	};
	const { SECRET_KEY } = process.env;

	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
	await User.findByIdAndUpdate(user._id, { token });
	res.status(200).json({
		token,
		user: {
			email,
			subscription: user.subscription,
		},
	});
};

export const getCurrent = async (req, res) => {
	const { email, subscription } = req.user;

	res.status(200).json({
		email,
		subscription,
	});
};
export const logout = async (req, res) => {
	const { _id } = req.user;
	await User.findByIdAndUpdate(_id, { token: "" });

	res.status(204).json({
		message: "No Content",
	});
};

export const patchSubscription = async (req, res) => {
	const { _id } = req.user;
	const result = await User.findByIdAndUpdate(_id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, "Not found");
	}
	res.status(200).json(result);
};

export const updateAvatar = async (req, res) => {
	const { _id } = req.user;

	const { path: tempUpload, originalname } = req.file;
	const filename = `${_id}_${originalname}`;

	const resultUpload = path.join(avatarsDir, filename);

	Jimp.read(tempUpload, (err, image) => {
		if (err) throw HttpError(404, err);
		image.resize(250, 250).write(resultUpload);
	});

	await fs.rename(tempUpload, resultUpload);

	const avatarURL = path.join("avatars", filename);
	await User.findByIdAndUpdate(_id, { avatarURL });

	res.status(200).json({ avatarURL });
};
