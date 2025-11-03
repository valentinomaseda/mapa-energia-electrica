# Mapa de Energía Eléctrica

Aplicación web interactiva para visualizar la red energética (centrales eléctricas y plantas transformadoras) en Argentina con geolocalización y análisis de cobertura.

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- **Node.js** (versión 16 o superior) - [Descargar](https://nodejs.org/)
- **npm** (viene con Node.js)
- **Git** - [Descargar](https://git-scm.com/)

Para verificar que tienes todo instalado, ejecuta en tu terminal:

```bash
node --version
npm --version
git --version
```

## 📋 Instrucciones de Instalación y Ejecución

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/valentinomaseda/mapa-energia-electrica.git
cd mapa-energia-electrica/mapa-energia
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

Esto instalará todas las librerías necesarias incluyendo:

- React 19
- React Router DOM (navegación)
- Leaflet (mapas interactivos)
- React Leaflet (integración con React)
- Vite (herramienta de desarrollo)

### 3️⃣ Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación abrirá automáticamente en tu navegador en:

```
http://localhost:5173
```

Si no se abre automáticamente, accede manualmente a esa dirección.

### 4️⃣ Detener el Servidor

Para detener el servidor de desarrollo, presiona:

```
Ctrl + C
```

en la terminal.

## 📦 Compilar para Producción

Si deseas crear una versión optimizada para producción:

```bash
npm run build
```

Esto generará una carpeta `dist/` con los archivos optimizados listos para desplegar.

## 🔧 Comandos Disponibles

| Comando           | Descripción                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Inicia servidor de desarrollo con recarga automática |
| `npm run build`   | Compila la aplicación para producción                |
| `npm run preview` | Previsualiza la compilación de producción localmente |
| `npm run lint`    | Verifica errores de código con ESLint                |

## 🗺️ Características Principales

### 📍 Visualización de Datos Geoespaciales

- **Centrales Eléctricas**: Ubicadas con marcadores en el mapa
- **Plantas Transformadoras**: Posiciones geolocalizadas de plantas de transformación
- **Líneas de Energía AT030**: Visualización de líneas de alta tensión (cuando esté disponible)

### 🔍 Sistema de Búsqueda Avanzado

- **Filtro Dual**: Busca tanto centrales como plantas transformadoras
- **Búsqueda en Tiempo Real**: Los resultados se actualizan mientras escribes
- **Desplegable de Tipo**: Selecciona qué tipo de elemento deseas buscar

### ⚙️ Análisis de Cobertura

- **Umbral de Distancia**: Ajusta dinámicamente la distancia de cobertura (1-200 km)
- **Resaltado de Brechas**: Identifica centrales sin cobertura adecuada
- **Información de Distancia**: Cada central muestra la distancia a la planta más cercana

### 🎨 Interfaz Intuitiva

- **Leyenda Interactiva**: Entiende el significado de cada símbolo
- **Tema Oscuro**: Diseño optimizado para largas sesiones de análisis
- **Controles de Capas**: Muestra/oculta centrales y plantas según necesites

## 🗂️ Estructura del Proyecto

```
mapa-energia/
├── public/
│   ├── central_electrica.geojson      # Datos de centrales (GeoJSON)
│   └── planta_transformadora.geojson  # Datos de plantas (GeoJSON)
├── src/
│   ├── components/
│   │   ├── Background.jsx             # Componente de fondo
│   │   ├── Loader.jsx                 # Pantalla de carga
│   │   ├── Navbar.jsx                 # Barra de navegación
│   │   └── SearchFilter.jsx           # Filtro de búsqueda
│   ├── pages/
│   │   ├── Inicio.jsx                 # Página de inicio
│   │   └── Mapa.jsx                   # Página principal del mapa
│   ├── styles/
│   │   ├── DotGrid.css                # Estilos de fondo punteado
│   │   └── SearchFilter.css           # Estilos del filtro
│   ├── App.jsx                        # Componente principal
│   ├── App.css                        # Estilos globales
│   ├── main.jsx                       # Punto de entrada
│   └── index.css                      # Estilos base
├── package.json                       # Dependencias del proyecto
├── vite.config.js                     # Configuración de Vite
├── eslint.config.js                   # Configuración de ESLint
└── README.md                          # Este archivo
```

## 🎯 Cómo Usar la Aplicación

### Página de Inicio

1. Accede a la página principal
2. Lee la descripción del proyecto
3. Haz clic en "Ir al Mapa" para comenzar

### Página del Mapa

1. **Buscar un elemento**:

   - Elige entre "Central Eléctrica" o "Planta Transformadora" en el desplegable
   - Escribe el nombre en el campo de búsqueda
   - Los resultados se filtran en tiempo real

2. **Ajustar cobertura**:

   - Usa el deslizador "Umbral de distancia" para cambiar el rango en km
   - Activa/desactiva "Resaltar brechas" para ver dónde hay falta de cobertura

3. **Controlar capas**:

   - Usa el control de capas (arriba a la derecha)
   - Marca/desmarca "Centrales Eléctricas" y "Plantas Transformadoras"

4. **Ver información**:
   - Haz clic en cualquier marcador para ver detalles
   - La ventana emergente muestra: nombre, tipo, distancia a planta más cercana

## 🐛 Solución de Problemas

### "npm: command not found"

**Solución**: Node.js no está instalado. Descargalo desde [nodejs.org](https://nodejs.org/)

### El servidor no inicia

```bash
# Intenta limpiar la caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### El mapa no carga datos

- Verifica que los archivos `.geojson` están en la carpeta `public/`
- Asegúrate de que la red es accesible (comprueba la consola del navegador con F12)

### Puerto 5173 ya está en uso

```bash
# Vite usará el siguiente puerto disponible automáticamente
npm run dev
```

## 📚 Tecnologías Utilizadas

- **React 19**: Framework de interfaz de usuario
- **React Router DOM**: Navegación entre páginas
- **Leaflet**: Biblioteca de mapas interactivos
- **React Leaflet**: Integración de Leaflet con React
- **Vite**: Herramienta de construcción rápida
- **GSAP**: Animaciones
- **styled-components**: Estilos CSS-in-JS
- **ESLint**: Linter de código

## 📞 Soporte

Si encuentras problemas:

1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Limpia la caché del navegador (Ctrl+Shift+Del)
3. Intenta en una ventana privada/incógnito
4. Revisa la consola del navegador para ver mensajes de error (F12 → Console)

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 👤 Autor

**Valentino Maseda**

- GitHub: [@valentinomaseda](https://github.com/valentinomaseda)
- Repositorio: [mapa-energia-electrica](https://github.com/valentinomaseda/mapa-energia-electrica)
