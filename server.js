const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Menggunakan express.static untuk menyajikan folder 'public'
app.use('/files', express.static(path.join(__dirname, 'public/files')));

app.get('/', (req, res) => {
    res.send('Silakan unduh file di /files/namafile.ext');
});

app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public/files', req.params.filename);
    res.download(filePath);
});




app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
