import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session"; // 🔹 missing import

import authRoutes from "./auth.js";
import "./passport.js";
import transactionRoutes from "./transactions.js";
import budgetRoutes from "./budgets.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Middleware order matters
app.use(
  cors({
    origin: "http://localhost:5173",
    //origin: "https://expensavefront.onrender.com",
    credentials: true, // allow cookies
  }),
);

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1); // required on Render

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // only send over HTTPS
      sameSite: "none", // cross-site allowed
      httpOnly: true, // not accessible from JS
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session()); // 🔹 needed for persistent login sessions

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/budgets", budgetRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
