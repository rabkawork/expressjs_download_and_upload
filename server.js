/**
 * @author : Ahadian Akbar
 * @date : 5 Mar 2025
 */

const express = require('express');
const path = require('path');
const multer = require("multer");
const fs = require("fs");
const unzipper = require("unzipper");
const app = express();
const PORT = 3000;

// Menggunakan express.static untuk menyajikan folder 'public'
// app.use('/files', express.static(path.join(__dirname, 'public/files')));


// Konfigurasi Multer untuk menyimpan file ZIP
/* const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Folder untuk menyimpan file
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Rename file dengan timestamp
    },
  });
  
  // Filter hanya menerima file .zip
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed") {
      cb(null, true);
    } else {
      cb(new Error("Only .zip files are allowed!"), false);
    }
  }; */


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Simpan file ZIP di folder uploads
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Tambahkan timestamp
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed") {
      cb(null, true);
    } else {
      cb(new Error("Only .zip files are allowed!"), false);
    }
  };

const upload = multer({ storage, fileFilter });

// Endpoint untuk upload file ZIP
/* app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send(`File uploaded: ${req.file.filename}`);
});
 */



// Fungsi untuk mengekstrak file ZIP (tanpa menghapus file asli)
const extractZip = async (filePath, destPath) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: destPath }))
      .on("close", () => resolve(`Extracted to ${destPath}`))
      .on("error", (err) => reject(err));
  });
};

// API Upload & Ekstrak (TANPA menghapus file ZIP asli)
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const zipFilePath = path.join(__dirname, "uploads", req.file.filename);
  const extractFolderPath = path.join(__dirname, "extracted", path.basename(req.file.filename, ".zip"));

  // Pastikan folder tujuan ada
  if (!fs.existsSync("extracted")) {
    fs.mkdirSync("extracted");
  }

  try {
    await extractZip(zipFilePath, extractFolderPath);
    res.send({
      message: `File uploaded and extracted successfully!`,
      zipLocation: zipFilePath,
      extractedLocation: extractFolderPath,
    });
  } catch (error) {
    res.status(500).send({ error: `Error extracting file: ${error.message}` });
  }
});


app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public/files', req.params.filename);
    res.download(filePath);
});


app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
