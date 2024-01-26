import { HttpError } from "../helpers/index.js";

const checkAvatarUpload = (req, res, next) => {
	if (!req.file) {
		return next(
			HttpError(400, "Cannot read properties of null (reading 'avatar')")
		);
	}

	next();
};

export default checkAvatarUpload;
