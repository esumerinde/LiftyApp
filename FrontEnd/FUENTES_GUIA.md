# 🎨 Guía de Fuentes - LiftyApp

## Fuentes Instaladas

Se han agregado 5 fuentes de Google Fonts optimizadas para aplicaciones fitness/gimnasio:

### 1. **Rajdhani** ⭐ (ACTIVA)

- **Estilo**: Moderna, técnica, profesional
- **Uso**: Apps fitness modernas (Hevy, Lyfta)
- **Weights**: 300, 400, 500, 600, 700
- **Recomendación**: **Mejor opción** para LiftyApp

```css
font-family: "Rajdhani", sans-serif;
```

---

### 2. **Bebas Neue**

- **Estilo**: Bold, impactante, mayúsculas
- **Uso**: Títulos, headers, números grandes
- **Weight**: Regular (único)
- **Nota**: Solo mayúsculas, ideal para títulos

```css
font-family: "Bebas Neue", sans-serif;
```

**Ejemplo de uso:**

```css
h1,
h2 {
  font-family: "Bebas Neue", sans-serif;
  text-transform: uppercase;
}
```

---

### 3. **Barlow**

- **Estilo**: Limpia, semi-condensada, legible
- **Uso**: UI completa, muy versátil
- **Weights**: 300, 400, 500, 600, 700
- **Nota**: Excelente legibilidad en pantallas

```css
font-family: "Barlow", sans-serif;
```

---

### 4. **Oswald**

- **Estilo**: Condensada, fuerte, atlética
- **Uso**: Títulos deportivos, métricas
- **Weights**: 300, 400, 500, 600, 700
- **Nota**: Similar a Bebas pero con más weights

```css
font-family: "Oswald", sans-serif;
```

---

### 5. **Kanit**

- **Estilo**: Moderna, redondeada, tech-fitness
- **Uso**: Apps fitness modernas con toque suave
- **Weights**: 300, 400, 500, 600, 700
- **Nota**: Buen balance entre moderna y legible

```css
font-family: "Kanit", sans-serif;
```

---

## 🔄 Cómo Cambiar de Fuente

### Opción 1: Cambiar fuente principal (TODO el sitio)

Edita `FrontEnd/src/index.css`, línea ~33:

```css
/* Cambia 'Rajdhani' por otra fuente: */
font-family: "Rajdhani", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Opciones disponibles: */
/* 'Rajdhani'    - Moderna técnica (ACTUAL) */
/* 'Bebas Neue'  - Bold deportiva (solo títulos) */
/* 'Barlow'      - Limpia versátil */
/* 'Oswald'      - Condensada atlética */
/* 'Kanit'       - Redondeada moderna */
```

### Opción 2: Usar diferentes fuentes por sección

Puedes crear clases específicas:

```css
/* En tu archivo CSS */
.font-bebas {
  font-family: "Bebas Neue", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.font-rajdhani {
  font-family: "Rajdhani", sans-serif;
}

.font-oswald {
  font-family: "Oswald", sans-serif;
}
```

Y usarlas en componentes:

```jsx
<h1 className="font-bebas">LIFTYAPP</h1>
<p className="font-rajdhani">Texto con Rajdhani</p>
```

---

## 🎯 Recomendaciones por Componente

### Headers / Títulos grandes

```css
font-family: "Bebas Neue", sans-serif;
font-weight: 400;
text-transform: uppercase;
letter-spacing: 0.08em;
```

### Métricas / Números

```css
font-family: "Oswald", sans-serif;
font-weight: 600;
```

### Texto general / UI

```css
font-family: "Rajdhani", sans-serif;
font-weight: 500;
```

### Botones

```css
font-family: "Rajdhani", sans-serif;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
```

---

## 💡 Combinaciones Recomendadas

### Opción A: Todo Rajdhani (ACTUAL)

- **Headers**: Rajdhani Bold (700)
- **Body**: Rajdhani Medium (500)
- **Métricas**: Rajdhani SemiBold (600)

### Opción B: Mix Deportivo

- **Headers**: Bebas Neue
- **Body**: Barlow
- **Métricas**: Oswald Bold

### Opción C: Moderna Tech

- **Headers**: Oswald Bold
- **Body**: Kanit
- **Métricas**: Rajdhani Bold

---

## 🔍 Vista Previa Visual

```
RAJDHANI (ACTUAL)
ABC abc 123 - Moderna, técnica, legible
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789

BEBAS NEUE
ABC ABC 123 - BOLD, MAYÚSCULAS, IMPACTANTE
ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789

BARLOW
ABC abc 123 - Limpia, semi-condensada, versátil
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789

OSWALD
ABC abc 123 - Condensada, atlética, fuerte
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789

KANIT
ABC abc 123 - Moderna, redondeada, tech
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
```

---

## 📱 Rendimiento

Todas las fuentes están optimizadas con:

- `display=swap` - Evita FOIT (Flash of Invisible Text)
- Subconjuntos de caracteres necesarios
- Carga async para mejor performance

**Peso total**: ~150KB (5 fuentes completas)

---

## ✅ Actualmente Configurado

- ✅ Fuente principal: **Rajdhani**
- ✅ Todas las fuentes precargadas
- ✅ Fácil cambio desde `index.css`
- ✅ Fallbacks de sistema incluidos
