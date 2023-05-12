const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      file.originalname = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      );
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.originalname.split(".")[0] +
          uniqueSuffix +
          "." +
          file.originalname.split(".")[1]
      );
    },
  });

  const upload = multer({ storage: storage });

  module.exports = upload;