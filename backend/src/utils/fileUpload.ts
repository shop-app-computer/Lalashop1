import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const safeName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    cb(null, `${file.fieldname}-${Date.now()}-${safeName}${path.extname(file.originalname)}`);
  },
});

function checkImageOnly(file: Express.Multer.File, cb: any) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error("Images only (jpg, jpeg, png, webp)"));
}

function checkDocAndImage(file: Express.Multer.File, cb: any) {
  const allowedExt = /jpg|jpeg|png|webp|pdf/;
  const allowedMime = /jpe?g|png|webp|pdf/;
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error("Only JPG, PNG, WEBP or PDF are allowed"));
}

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => checkImageOnly(file, cb),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadDocs = multer({
  storage,
  fileFilter: (req, file, cb) => checkDocAndImage(file, cb),
  limits: { fileSize: 10 * 1024 * 1024 },
});
