const express = require('express');
const path = require('path');
const multer = require("multer");

const app = express();
const PORT = 3000;

// Menggunakan express.static untuk menyajikan folder 'public'
// app.use('/files', express.static(path.join(__dirname, 'public/files')));


// Konfigurasi Multer untuk menyimpan file ZIP
const storage = multer.diskStorage({
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
  };


const upload = multer({ storage, fileFilter });

// Endpoint untuk upload file ZIP
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send(`File uploaded: ${req.file.filename}`);
});



app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public/files', req.params.filename);
    res.download(filePath);
});


app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
