// test-professionals-endpoint.js
const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🔍 Probando endpoint /api/role/trainer sin token...\n');
    
    // Intento 1: Sin token (debería fallar con 401)
    try {
      const response1 = await axios.get('http://localhost:3000/api/role/trainer');
      console.log('✅ Sin token - Respuesta:', response1.status);
      console.log('Datos:', response1.data);
    } catch (error) {
      console.log('❌ Sin token - Error esperado:', error.response?.status, error.response?.data);
    }

    console.log('\n🔍 Probando con token de ejemplo...\n');
    
    // Obtener un token válido (asumiendo que tienes un usuario de prueba)
    // Primero login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'esumerinde@gmail.com',
      password: '1234'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // Intento 2: Con token en header
    const response2 = await axios.get('http://localhost:3000/api/role/trainer', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Con token - Status:', response2.status);
    console.log('✅ Trainers encontrados:', response2.data.length);
    console.log('Primer trainer:', response2.data[0]);

    // Intento 3: Nutritionists
    const response3 = await axios.get('http://localhost:3000/api/role/nutritionist', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n✅ Nutritionists - Status:', response3.status);
    console.log('✅ Nutritionists encontrados:', response3.data.length);
    if (response3.data.length > 0) {
      console.log('Primer nutritionist:', response3.data[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testEndpoint();
