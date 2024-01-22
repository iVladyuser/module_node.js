import multer from "multer";
import path from "path";

export const tempDir = path.resolve("temp");

const storage = multer.diskStorage({
	destination: tempDir,
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({
	storage: storage,
});

export default upload;
