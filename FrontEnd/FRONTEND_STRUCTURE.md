# 🏋️ LiftyApp - Frontend Structure

## 📁 Estructura del Proyecto

```
FrontEnd/
├── src/
│   ├── layout/              # Layouts y estructura principal
│   │   ├── MainLayout/      # Layout principal con header y nav
│   │   ├── TopHeader/       # Barra superior (sticky)
│   │   └── BottomNav/       # Navegación inferior (mobile)
│   │
│   ├── pages/               # Páginas de la aplicación
│   │   └── Home/            # Página principal (Feed)
│   │
│   ├── components/          # Componentes reutilizables
│   │   └── WorkoutCard/     # Tarjeta de entrenamiento
│   │
│   ├── styles/              # Estilos globales
│   ├── services/            # Servicios API
│   ├── hooks/               # Custom hooks
│   ├── store/               # Estado global (Zustand)
│   └── utils/               # Utilidades
```

## 🎨 Variables CSS (Design System)

Todas las variables están definidas en `src/index.css`:

### Colores

- **Fondo Principal**: `--lifty-bg-main` (#0f0f11)
- **Fondo Cards**: `--lifty-bg-card` (#1a1a1e)
- **Acentos**: `--lifty-accent-main` (#7882b6)

### Componentes Base

- `.lifty-card` - Tarjetas con hover effect
- `.lifty-btn-primary` - Botón principal
- `.lifty-btn-secondary` - Botón secundario

## 🚀 Componentes Creados

### Layout Components

#### MainLayout

Layout principal que incluye TopHeader y BottomNav. Úsalo para envolver páginas:

```jsx
import { MainLayout } from "@/layout";

function MyPage() {
  return <MainLayout>{/* Tu contenido aquí */}</MainLayout>;
}
```

#### TopHeader

Barra superior sticky con:

- Filtro de feed (Siguiendo, Para ti, Tendencias)
- Iconos de mensajes y notificaciones
- Badge de notificaciones no leídas

#### BottomNav

Navegación inferior estilo app nativa con:

- 5 botones: Home, Rutinas, Entrenar (central), Comidas, Perfil
- Botón central elevado con efecto glow
- Indicador de página activa

### Page Components

#### Home

Página principal con feed de entrenamientos:

- Muestra WorkoutCards en scroll infinito
- Estado vacío cuando no hay entrenamientos
- Responsive (grid en desktop)

### Shared Components

#### WorkoutCard

Tarjeta de entrenamiento del feed con:

- **Header**: Avatar, nombre de usuario, tiempo relativo
- **Métricas**: Duración, volumen total
- **Lista de ejercicios**: Hasta 5 visibles, con botón "ver más"
- **Imagen** (opcional): Foto del entreno
- **Footer social**: Likes, comentarios, compartir

## 📦 Dependencias Necesarias

Instala las siguientes dependencias:

```bash
npm install react-router-dom
```

Para íconos (opcional, por ahora usamos emojis):

```bash
npm install lucide-react
```

## 🗄️ Base de Datos

Se crearon 2 archivos SQL:

### LiftyAppDB.sql

Script completo para crear la base de datos con todas las tablas.

### LiftyApp_SeedData.sql

Datos de prueba realistas:

- 3 sedes del gimnasio
- 11 usuarios (admin, trainers, users)
- 23 ejercicios categorizados
- 3 rutinas pre-diseñadas
- Posts de entrenamientos con comentarios
- Métricas de progreso
- Sistema de follows
- Notificaciones
- Suscripciones activas

**Para importar:**

```bash
# 1. Crear la base de datos
mysql -u root -p < LiftyAppDB.sql

# 2. Poblar con datos de prueba
mysql -u root -p < LiftyApp_SeedData.sql
```

## 🎯 Próximos Pasos

1. **Configurar Router** en `App.jsx`
2. **Crear servicio API** para fetch de workouts
3. **Implementar páginas restantes**: Rutinas, Entrenar, Comidas, Perfil
4. **Conectar con backend** (Express API)
5. **Agregar autenticación** (JWT)
6. **Implementar estado global** (Zustand)

## 📱 Mobile First

Todo el diseño está pensado para mobile primero:

- TopHeader y BottomNav fijos
- Área scrolleable de contenido
- Touch-friendly (botones grandes)
- Transiciones suaves

## 🔧 Tips de Desarrollo

- **Hot Reload**: Los cambios se reflejan automáticamente
- **Emojis temporales**: Después reemplaza con `lucide-react`
- **Rutas**: Configura React Router para navegación
- **API**: Conecta con backend en `http://localhost:3000` (ajusta puerto)

---

**Stack**: React + Vite + CSS Modules + MySQL
**Diseño**: Mobile First | Dark Theme | App Nativa Style
