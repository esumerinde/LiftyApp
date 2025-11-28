// config/passport-setup.js
const passport = require("passport");
const { pool } = require("./database");
const { createDefaultMeals } = require("../controllers/auth.controller");

// Helper: separar nombre completo
function splitNameFromProfile(profile) {
  const given = profile.name?.givenName?.trim();
  const family = profile.name?.familyName?.trim();
  if (given || family) return { full_name: `${given || ""} ${family || ""}`.trim() };

  const parts = (profile.displayName || "").trim().split(" ");
  return { full_name: parts.join(" ") };
}

// Verificar que las credenciales de Google estén configuradas
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/auth/google/callback";

// Solo inicializar Google OAuth si las credenciales están presentes y válidas
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID.trim() && GOOGLE_CLIENT_SECRET.trim()) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;
  
  console.log("✅ GoogleStrategy configurado:", {
    clientID: GOOGLE_CLIENT_ID.substring(0, 20) + "...",
    callbackURL: GOOGLE_CALLBACK_URL,
  });

  /* ======================
     Estrategia GOOGLE
     ====================== */
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          Array.isArray(profile.emails) && profile.emails.length
            ? profile.emails[0].value
            : null;

        if (!email) {
          return done(new Error("No email from Google"), null);
        }

        // Buscar usuario por google_id o por email
        const [rows] = await pool
          .promise()
          .query(
            `SELECT * FROM users
             WHERE google_id = ? OR (email IS NOT NULL AND email = ?)
             LIMIT 1`,
            [profile.id, email]
          );

        let dbUser = rows[0];

        if (!dbUser) {
          const { full_name } = splitNameFromProfile(profile);
          const avatar_url = profile.photos && profile.photos.length ? profile.photos[0].value : null;
          
          const [result] = await pool
            .promise()
            .query(
              `INSERT INTO users (full_name, email, google_id, avatar_url, role, status)
               VALUES (?, ?, ?, ?, 'user', 'active')`,
              [full_name, email, profile.id, avatar_url]
            );

          const userId = result.insertId;

          // Crear comidas básicas para el nuevo usuario de Google
          await createDefaultMeals(userId);

          const [created] = await pool
            .promise()
            .query(`SELECT * FROM users WHERE id_user = ? LIMIT 1`, [userId]);

          dbUser = created[0];
        } else if (!dbUser.google_id) {
          await pool
            .promise()
            .query(`UPDATE users SET google_id = ? WHERE id_user = ?`, [
              profile.id,
              dbUser.id_user,
            ]);
          dbUser.google_id = profile.id;
        }

        // Si el usuario no tiene username, generar uno a partir del email
        let username = dbUser.username;
        if (!username && dbUser.email) {
          username = dbUser.email.split("@")[0];
          await pool
            .promise()
            .query(`UPDATE users SET username = ? WHERE id_user = ?`, [
              username,
              dbUser.id_user,
            ]);
        }

        const user = {
          id_user: dbUser.id_user,
          email: dbUser.email,
          username: username || dbUser.email?.split("@")[0],
          role: dbUser.role || "user",
          full_name: dbUser.full_name,
          provider: "google",
        };

        return done(null, user);
      } catch (err) {
        console.error("Error en GoogleStrategy:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user (guardar en sesión)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

} else {
  console.warn("⚠️  Google OAuth NO configurado. Las rutas de Google auth no estarán disponibles.");
  console.warn("    Para habilitarlo, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en tu .env");
}

module.exports = passport;
