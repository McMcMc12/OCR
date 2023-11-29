const express = require("express");
const multer = require("multer");
const { createWorker } = require("tesseract.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Set up Multer middleware
const upload = multer({ storage: storage }).single("avatar");

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define routes
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/upload", (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err.message);
        }

        // Perform OCR using Tesseract worker
        const worker = await createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(`./uploads/${req.file.filename}`);
        console.log("OCR Result:", text);

        await worker.terminate(); // Terminate the worker after use

        // You can send the OCR result or any other response as needed
        res.send(`File uploaded successfully! OCR Result: ${text}`);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
