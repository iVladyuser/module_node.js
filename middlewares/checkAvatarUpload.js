import { HttpError } from "../helpers/index.js";

const checkAvatarUpload = (req, res, next) => {
	if (!req.file) {
		return next(HttpError(400, "Avatar not found"));
	}

	next();
};

export default checkAvatarUpload;
