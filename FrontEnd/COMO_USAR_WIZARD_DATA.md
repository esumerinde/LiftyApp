# Cómo usar los datos del Wizard QR en el Registro

## Datos guardados en localStorage

Cuando el usuario completa el formulario QR, todos los datos se guardan en `localStorage` con la clave `'wizardData'`.

## Estructura de los datos:

```javascript
{
  name: "Juan",              // String - Nombre del usuario
  gender: "male",            // "male" | "female" - Género
  weight: "75.5",            // String - Peso en kg
  height: "175",             // String - Altura en cm
  lifestyle: "moderate",     // "sedentary" | "light" | "moderate" | "active" | "very_active"
  diet: "omnivore",         // "omnivore" | "vegan" | "vegetarian" | "keto" | "low_carb"
  goal: "gain_muscle",      // "lose_weight" | "gain_muscle" | "get_toned" | "maintain"
  meals: "4"                // String - Número de comidas al día
}
```

## Cómo recuperar los datos en la página de Registro:

### Ejemplo en React:

```jsx
import { useState, useEffect } from "react";

function RegistroPage() {
  const [wizardData, setWizardData] = useState(null);
  const [formData, setFormData] = useState({
    // Campos que FALTAN del wizard
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  useEffect(() => {
    // Recuperar datos del wizard
    const savedData = localStorage.getItem("wizardData");
    if (savedData) {
      setWizardData(JSON.parse(savedData));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Combinar datos del wizard con datos del registro
    const completeUserData = {
      // Datos del registro (users) - REQUERIDOS
      email: formData.email,
      password: formData.password,
      username: formData.username || `user_${Date.now()}`,
      full_name: wizardData?.name || "Usuario",

      // Datos del wizard (user_profiles) - OPCIONALES
      gender: wizardData?.gender || null,
      weight: wizardData?.weight ? parseFloat(wizardData.weight) : null,
      height: wizardData?.height ? parseFloat(wizardData.height) : null,
      lifestyle: wizardData?.lifestyle || null,
      diet: wizardData?.diet || null,
      goal: wizardData?.goal || null,
      meals: wizardData?.meals ? parseInt(wizardData.meals) : null,
    };

    // Enviar al backend
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completeUserData),
    });

    const data = await response.json();

    if (data.success) {
      // ⚠️ IMPORTANTE: Limpiar localStorage después de registro exitoso
      localStorage.removeItem("wizardData");

      // Guardar token y redirigir
      localStorage.setItem("token", data.token);
      // Redirigir al home o dashboard
      window.location.href = "/home";
    } else {
      alert(data.message || "Error en el registro");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mostrar nombre del wizard si existe */}
      {wizardData && <p>¡Hola {wizardData.name}! Completa tu registro:</p>}

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="text"
        placeholder="Usuario (opcional)"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
        required
      />

      <button type="submit">Crear cuenta</button>
    </form>
  );
}
```

## Verificar si hay datos del wizard:

```javascript
// En cualquier componente
const wizardData = localStorage.getItem("wizardData");
if (wizardData) {
  const data = JSON.parse(wizardData);
  console.log("Usuario desde QR:", data.name);
}
```

## Limpiar datos después del registro:

```javascript
// Después de crear la cuenta exitosamente
localStorage.removeItem("wizardData");
```

## Mapeo a la base de datos:

### Tabla `users`:

- `full_name` ← `wizardData.name`
- `email` ← Del formulario de registro
- `password` ← Del formulario de registro
- `username` ← Del formulario de registro (opcional)

### Tabla `user_profiles`:

- `gender` ← `wizardData.gender`
- `current_weight_kg` ← `parseFloat(wizardData.weight)`
- `height_cm` ← `parseFloat(wizardData.height)`
- `lifestyle` ← `wizardData.lifestyle`
- `diet_preference` ← `wizardData.diet`
- `main_goal` ← `wizardData.goal`
- `meal_frequency` ← `parseInt(wizardData.meals)`
