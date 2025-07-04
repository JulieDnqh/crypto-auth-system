const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'gui' directory
app.use(express.static(path.join(__dirname, "gui")));

// Use body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route for the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "gui", "index.html"));
});

// Handle form submission
app.post("/submit-form", (req, res) => {
  console.log("Received form submission:", req.body);
  res.send(`
    <h1>Submission Received!</h1>
    <p>Data: ${JSON.stringify(req.body)}</p>
    <button onclick="window.history.back()">Go Back</button>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
