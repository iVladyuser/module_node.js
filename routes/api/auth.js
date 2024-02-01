import express from "express";
import {
	logInSchema,
	patchSubscriptionSchema,
	registerSchema,
	verifyEmailSchema,
} from "../../models/user.js";
import { ctrlWrapper, validateBody } from "../../decorators/index.js";
import {
	login,
	register,
	verifyEmail,
	resendVerifyEmail,
	getCurrent,
	logout,
	patchSubscription,
	updateAvatar,
} from "../../controllers/authController.js";
import {
	isEmptyBody,
	authenticate,
	upload,
	checkAvatarUpload,
} from "../../middlewares/index.js";

const router = express.Router();

router.post(
	"/register",
	isEmptyBody,
	validateBody(registerSchema),
	ctrlWrapper(register)
);

router.get("/verify/:verificationToken", ctrlWrapper(verifyEmail));

router.post(
	"/verify",
	validateBody(verifyEmailSchema),
	ctrlWrapper(resendVerifyEmail)
);

router.post(
	"/login",
	isEmptyBody,
	validateBody(logInSchema),
	ctrlWrapper(login)
);

router.get("/current", authenticate, ctrlWrapper(getCurrent));

router.post("/logout", authenticate, ctrlWrapper(logout));

router.patch(
	"/",
	authenticate,
	validateBody(patchSubscriptionSchema),
	ctrlWrapper(patchSubscription)
);

router.patch(
	"/avatars",
	authenticate,
	upload.single("avatar"),
	checkAvatarUpload,
	ctrlWrapper(updateAvatar)
);

export default router;
