const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'gui' directory
app.use(express.static(path.join(__dirname, "gui")));

// Route for the new home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "gui", "index.html"));
});

// Use body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route for the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "gui", "login.html"));
});

// Route for the signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "gui", "signup.html"));
});

// Handle login form submission
app.post("/login", (req, res) => {
  console.log("Login form submitted (UI only):", req.body);
  res.send(`
    <h1>Login Form Submitted!</h1>
    <p>This is a UI-only response. No backend logic processed.</p>
    <button onclick="window.history.back()">Go Back</button>
  `);
});

// Handle signup form submission
app.post("/signup", (req, res) => {
  console.log("Signup form submitted (UI only):", req.body);
  res.send(`
    <h1>Signup Form Submitted!</h1>
    <p>This is a UI-only response. No backend logic processed.</p>
    <button onclick="window.history.back()">Go Back</button>
  `);
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
