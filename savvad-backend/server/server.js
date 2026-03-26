const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.json");

// 🔥 Load users
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

// 🔥 Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 🔥 OTP store (memory)
const otpStore = {};

// =============================
// ✅ SEND OTP
// =============================
app.post("/api/auth/send-otp", (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.json({ success: false, message: "Phone required" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  otpStore[phoneNumber] = otp;

  console.log(`📱 OTP for ${phoneNumber}: ${otp}`); // 👈 terminal

  res.json({
    success: true,
    message: "OTP generated (check terminal)",
  });
});

// =============================
// ✅ VERIFY OTP + SAVE USER
// =============================
app.post("/api/auth/verify-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.json({ success: false, message: "Missing data" });
  }

  if (otpStore[phoneNumber] !== otp) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  delete otpStore[phoneNumber];

  let users = loadUsers();

  let user = users.find((u) => u.phone === phoneNumber);

  if (!user) {
    user = {
      id: Date.now(),
      phone: phoneNumber,
    };
    users.push(user);
    saveUsers(users);
  }

  res.json({
    success: true,
    message: "Login success",
    user,
  });
});

// =============================
app.get("/api/health", (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});