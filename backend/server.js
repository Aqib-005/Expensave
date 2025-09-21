import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import authRoutes from "./auth.js";
import "./passport.js";
import transactionRoutes from "./transactions.js";
import budgetRoutes from "./budgets.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "https://aqib-005.github.io",
    credentials: true,
  }),
);

app.set("trust proxy", 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, 
    sameSite: "none" 
  }
}));

app.use(passport.initialize());

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/budgets", budgetRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
