# 🏋️ WorkoutPage - Componente de Entrenamiento

## 📋 Descripción

`WorkoutPage` es el componente principal para iniciar y registrar entrenamientos en tiempo real. Replica el flujo completo de apps de fitness como **Hevy** o **Strong**, con un sistema de 3 vistas manejadas por estados.

---

## 🎯 Arquitectura (Estados de Vista)

El componente maneja 3 vistas principales mediante `currentView`:

### 1. **'library'** - Librería de Rutinas

- Muestra las rutinas guardadas del usuario
- Estado vacío si no hay rutinas
- Botón principal: "Comenzar Entrenamiento Vacío"

### 2. **'active'** - Entrenamiento en Curso

- Header con timer de descanso y botón "Finalizar"
- Barra de métricas (Duración, Volumen, Sets)
- Lista de ejercicios con tabla de sets
- Footer con botones "Añadir Ejercicios" y "Más"

### 3. **'add_exercise'** - Modal de Selección

- Filtros de grupos musculares (Pecho, Espalda, etc.)
- Grilla de ejercicios con imágenes
- Multi-selección con checkmarks
- Footer flotante: "Añadir X Ejercicios"

---

## 🧩 Componentes Internos

### `RoutineLibrary`

- Tabs: "Librería" | "Entrenar Ahora"
- Cards de rutinas con imagen, título y cantidad
- Estado vacío con icono de mancuerna

### `ActiveWorkout`

- **Cronómetro**: Duración total del entrenamiento
- **Timer de descanso**: Contador regresivo (por defecto 2:30)
- **Métricas en tiempo real**: Calculadas automáticamente
- **Lista de ejercicios**: Renderiza `WorkoutExerciseCard`

### `WorkoutExerciseCard`

- **Header**: Imagen del ejercicio + nombre + timer de descanso
- **Input de notas**: Para comentarios del usuario
- **Tabla de Sets**: 5 columnas (Set | Previo | Kg | Reps | ✓)
  - **Col 1 (Set)**: Botón con tipo de set (W, F, T, etc.)
  - **Col 2 (Previo)**: Rendimiento anterior (ej: "6kg x 12")
  - **Col 3 (Kg)**: Input numérico para peso
  - **Col 4 (Reps)**: Input numérico para repeticiones
  - **Col 5 (✓)**: Botón check que se pinta dorado al marcar
- **Botón**: "+ Añadir Set"

### `AddExerciseModal`

- **Header**: Botón X | Título | Botón Búsqueda
- **Filtro horizontal**: Chips scrollables de músculos
- **Grilla 3x**: Cards con imagen + nombre overlay
- **Multi-selección**: Borde acento + check en esquina
- **Footer flotante**: Solo visible si hay selección

### `SetTypeModal`

- **Bottom sheet**: Desliza desde abajo
- **Drag handle**: Indicador visual
- **Lista de tipos**: Con badge colorido + descripción
- **Botón eliminar**: Solo si queda más de 1 set

---

## 🎨 Estilos y Paleta

### Variables CSS Utilizadas

```css
--lifty-bg-main: Fondo principal
--lifty-bg-card: Cards y modales
--lifty-bg-input: Inputs y hover
--lifty-accent-main: Color acento principal (#7882b6)
--lifty-accent-ultra-light: Botones claros
--lifty-text-primary: Texto blanco
--lifty-text-secondary: Texto secundario
--lifty-gold: Dorado (#ffd700) - para sets completados
--lifty-red: Rojo (#ff3b30) - para "Failure"
```

### Colores de Badges de Set

| Tipo    | Color             | Descripción             |
| ------- | ----------------- | ----------------------- |
| **W**   | Violeta (#5856d6) | Warm Up (Calentamiento) |
| **F**   | Rojo (#ff3b30)    | Failure (Fallo)         |
| **T**   | Dorado (#ffd700)  | Top Set (Pesado)        |
| **B**   | Gris (#8e8e93)    | Back-off Set (Ligero)   |
| **L/R** | Verde (#34c759)   | Left/Right (Unilateral) |
| **D**   | Naranja (#ff9500) | Drop Set (Descendente)  |
| **N**   | Celeste (#5ac8fa) | Negative (Excéntrico)   |

---

## 📦 Datos Mock

### `userRoutines`

```js
[
  { id: 1, name: "Gimnasio & Boxeo", workouts: 8, image: "..." },
  { id: 2, name: "Push Pull Legs", workouts: 6, image: "..." },
  { id: 3, name: "Favoritos", workouts: 12, image: null, icon: BookMarked },
];
```

### `allExercises`

```js
[
  { id: 1, name: "Hammer Curl", muscle_group: "arms", image_url: "..." },
  { id: 2, name: "Straight Back Seated Row", muscle_group: "back", ... },
  // ... más ejercicios
]
```

### `muscleGroups`

```js
[
  { id: "all", name: "Todos" },
  { id: "chest", name: "Pecho" },
  { id: "back", name: "Espalda" },
  { id: "legs", name: "Piernas" },
  { id: "arms", name: "Brazos" },
  { id: "shoulders", name: "Hombros" },
];
```

---

## 🔧 Funciones Principales

### Navegación entre vistas

```js
startEmptyWorkout() → cambia a 'active'
openAddExerciseModal() → cambia a 'add_exercise'
closeAddExerciseModal() → vuelve a 'active'
finishWorkout() → vuelve a 'library'
```

### Gestión de Sets

```js
handleSetUpdate(exerciseId, setId, field, value); // Actualiza kg, reps, type, done
handleAddSet(exerciseId); // Pre-llena con datos del set anterior
handleRemoveSet(exerciseId, setId); // Solo si queda > 1 set
```

### Selección de Ejercicios

```js
toggleExerciseSelection(exercise); // Añade/quita de selectedExercises[]
addSelectedToWorkout(); // Crea ejercicios con 1 set de calentamiento
```

### Cronómetros

```js
// Duración total del entrenamiento
useEffect(() => {
  setInterval(() => setDuration((prev) => prev + 1), 1000);
}, []);

// Timer de descanso (contador regresivo)
startRestTimer(); // Inicia 2:30 por defecto
```

---

## 🚀 Uso

```jsx
import WorkoutPage from "./pages/WorkoutPage/WorkoutPage";

// En App.jsx
<Route path="/workout" element={<WorkoutPage />} />

// En BottomNav (ya configurado)
{ id: "workout", label: "Entrenar", path: "/workout", icon: Dumbbell, isMain: true }
```

---

## ✅ Características Implementadas

- ✅ Sistema de 3 vistas (library, active, add_exercise)
- ✅ Cronómetro de duración en tiempo real
- ✅ Timer de descanso con contador regresivo
- ✅ Cálculo automático de métricas (volumen, sets)
- ✅ Tabla de sets con 5 columnas interactivas
- ✅ Multi-selección de ejercicios con checkmarks
- ✅ Modal de tipo de set (bottom sheet)
- ✅ Pre-llenado inteligente de sets
- ✅ Estado vacío en librería
- ✅ Animaciones y transiciones suaves
- ✅ Responsive design (mobile-first)
- ✅ Todo en **español**

---

## 🎯 Próximas Mejoras

- [ ] Conectar con backend (API de rutinas y ejercicios)
- [ ] Persistir entrenamientos en base de datos
- [ ] Búsqueda de ejercicios por nombre
- [ ] Templates de rutinas profesionales
- [ ] Gráficos de progreso
- [ ] Notificaciones de descanso
- [ ] Timer de ejercicio (cronómetro por ejercicio)
- [ ] Comparar con entrenamientos anteriores
- [ ] Modo offline con LocalStorage
- [ ] Export/Share de entrenamientos

---

## 📁 Estructura de Archivos

```
WorkoutPage/
├── WorkoutPage.jsx      # Componente principal + subcomponentes
├── WorkoutPage.css      # Estilos completos (600+ líneas)
└── README.md           # Esta documentación
```

---

## 🛠️ Stack Tecnológico

- **React 18** (useState, useEffect)
- **Lucide Icons** (Dumbbell, Play, Clock, etc.)
- **CSS Puro** (sin dependencias externas)
- **Custom Properties** (--lifty-\*)
- **Keyframe Animations** (fadeIn, slideUp)
- **Mobile-First Design**

---

## 📝 Notas Importantes

1. **Estado Vacío**: Para probar el estado vacío, cambiar:

   ```js
   const routines = []; // En vez de userRoutines
   ```

2. **Formato de Tiempo**: El cronómetro muestra formato `HH:MM:SS` si supera 1 hora, sino `MM:SS`.

3. **Validación de Sets**: El botón "Eliminar Set" solo funciona si quedan más de 1 set en el ejercicio.

4. **Volumen**: Solo se calcula para sets marcados como "done" y que NO sean tipo "W" (Warm Up).

5. **Padding Bottom**: El componente tiene `padding-bottom: 80px` para evitar solapamiento con el BottomNav.

---

## 👨‍💻 Autor

Desarrollado siguiendo las especificaciones de **LiftyApp** con paleta de colores oscura y diseño mobile-first.
