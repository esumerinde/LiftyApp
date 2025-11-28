// utils/test-connection.js
// Script para probar la conexión a la base de datos

require("dotenv").config();
const { pool } = require("../config/database");

console.log("🔍 Probando conexión a la base de datos...\n");

console.log("Configuración:");
console.log("- Host:", process.env.DB_HOST || "localhost");
console.log("- Usuario:", process.env.DB_USER || "root");
console.log("- Base de datos:", process.env.DB_NAME || "LiftyApp");
console.log("");

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conectando a la base de datos:");
    console.error(err.message);
    process.exit(1);
  }

  console.log("✅ Conexión exitosa a la base de datos!");
  
  // Probar una query simple
  connection.query("SELECT COUNT(*) as count FROM users", (error, results) => {
    if (error) {
      console.error("❌ Error ejecutando query:");
      console.error(error.message);
      connection.release();
      process.exit(1);
    }

    console.log(`✅ Query ejecutada correctamente`);
    console.log(`📊 Usuarios en la base de datos: ${results[0].count}`);
    
    connection.release();
    pool.end();
    
    console.log("\n🎉 ¡Todo funciona correctamente!");
    console.log("Puedes iniciar el servidor con: npm run dev");
  });
});
