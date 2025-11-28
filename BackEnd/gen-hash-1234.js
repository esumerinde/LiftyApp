const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "1234";
  const hash = await bcrypt.hash(password, 10);

  console.log('\n🔐 HASH GENERADO PARA CONTRASEÑA "1234":\n');
  console.log(hash);
  console.log("\n📋 Copiá este hash y usalo en @common_password\n");

  // Verificar que funciona
  const valid = await bcrypt.compare(password, hash);
  console.log("✅ Verificación:", valid ? "OK" : "ERROR");
}

generateHash();
