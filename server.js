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
// Pastikan folder `uploads` dan `extracted` ada
const uploadDir = path.join(__dirname, "uploads");
const extractDir = path.join(__dirname, "extracted");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir);
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
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Gunakan nama asli file
    },
  });
  
  // Filter hanya menerima file ZIP
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

// API Upload & Ekstrak (Nama file tetap, tidak menghapus ZIP asli)
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const zipFilePath = path.join(uploadDir, req.file.originalname);
  const extractFolderPath = path.join(extractDir, req.file.originalname.replace(".zip", ""));

  // Pastikan folder tujuan ada
  if (!fs.existsSync(extractFolderPath)) {
    fs.mkdirSync(extractFolderPath);
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
