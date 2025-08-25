import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import pool from "./db.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let result = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [profile.id],
        );

        let user;
        if (result.rows.length === 0) {
          const insertResult = await pool.query(
            `INSERT INTO users (google_id, name, email)
             VALUES ($1, $2, $3)
             RETURNING "userID", name, email`,
            [profile.id, profile.displayName, profile.emails[0].value],
          );
          user = insertResult.rows[0];
        } else {
          user = result.rows[0];
        }

        const token = jwt.sign({ userID: user.userID }, JWT_SECRET, {
          expiresIn: "1h",
        });
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
          'INSERT INTO sessions ("userID", token, expires_at) VALUES ($1, $2, $3)',
          [user.userID, token, expiresAt],
        );

        user.jwt = token;
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = null;

        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        } else {
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${accessToken}`,
              "User-Agent": "Expensave-App",
            },
          });
          const emails = await response.json();
          const primary = emails.find((e) => e.primary && e.verified);
          if (primary) email = primary.email;
        }

        if (!email) {
          return done(new Error("Unable to retrieve email from GitHub"), null);
        }

        let result = await pool.query(
          "SELECT * FROM users WHERE github_id = $1",
          [profile.id],
        );

        let user;
        if (result.rows.length === 0) {
          const insertResult = await pool.query(
            `INSERT INTO users (github_id, name, email)
             VALUES ($1, $2, $3)
             RETURNING "userID", name, email`,
            [profile.id, profile.displayName || profile.username, email],
          );
          user = insertResult.rows[0];
        } else {
          user = result.rows[0];
        }

        const token = jwt.sign({ userID: user.userID }, JWT_SECRET, {
          expiresIn: "1h",
        });
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
          'INSERT INTO sessions ("userID", token, expires_at) VALUES ($1, $2, $3)',
          [user.userID, token, expiresAt],
        );

        user.jwt = token;
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
export default passport;
