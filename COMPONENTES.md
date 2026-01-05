# Krea AI Generator - Estructura de Componentes

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ApiKeySection.js          # Componente de configuración de API Key
│   ├── ApiKeySection.css         # Estilos del componente ApiKeySection
│   ├── ImageGenerator.js         # Componente de generación de imágenes
│   ├── ImageGenerator.css        # Estilos del componente ImageGenerator
│   ├── VideoGenerator.js         # Componente de generación de videos
│   ├── VideoGenerator.css        # Estilos del componente VideoGenerator
│   ├── Tabs.js                   # Componente de pestañas de navegación
│   └── Tabs.css                  # Estilos del componente Tabs
├── App.js                        # Componente principal de la aplicación
├── App.css                       # Estilos globales de la aplicación
└── index.js                      # Punto de entrada de React

```

## 🧩 Componentes

### 1. **ApiKeySection** (`components/ApiKeySection.js`)
**Responsabilidad:** Gestión de la API Key de Krea AI

**Props:**
- `apiKey`: Estado de la API key actual
- `setApiKey`: Función para actualizar la API key
- `showApiKeyInput`: Estado de visibilidad del formulario
- `setShowApiKeyInput`: Función para mostrar/ocultar el formulario

**Características:**
- Almacenamiento seguro en `localStorage`
- Botones para guardar y limpiar la API key
- Indicador visual del estado de configuración

---

### 2. **Tabs** (`components/Tabs.js`)
**Responsabilidad:** Navegación entre las secciones de generación

**Props:**
- `activeTab`: Pestaña actualmente activa ('image' o 'video')
- `setActiveTab`: Función para cambiar la pestaña activa

**Características:**
- Dos pestañas: "Image Generation" y "Video Generation"
- Indicador visual de la pestaña activa

---

### 3. **ImageGenerator** (`components/ImageGenerator.js`)
**Responsabilidad:** Generación de imágenes con IA

**Props:**
- `apiToken`: Token de API para autenticación
- `setShowApiKeyInput`: Función para mostrar el formulario de API key en caso de error

**Estado Interno:**
- `prompt`: Descripción de la imagen a generar
- `batchSize`: Tamaño del lote
- `numImages`: Número de imágenes
- `resolution`: Resolución (1K, 2K, 4K)
- `loading`: Estado de carga
- `jobId`: ID del trabajo de generación
- `status`: Estado del trabajo
- `imageUrl`: URL de la imagen generada
- `error`: Mensajes de error

**Características:**
- Formulario de configuración de imagen
- Sistema de polling para verificar el estado del trabajo
- Visualización de la imagen generada
- Manejo de errores

---

### 4. **VideoGenerator** (`components/VideoGenerator.js`)
**Responsabilidad:** Generación de videos con IA

**Props:**
- `apiToken`: Token de API para autenticación
- `setShowApiKeyInput`: Función para mostrar el formulario de API key en caso de error

**Estado Interno:**
- `videoPrompt`: Descripción del video a generar
- `videoModel`: Modelo de video seleccionado
- `aspectRatio`: Relación de aspecto (16:9, 9:16, 1:1, 4:3)
- `duration`: Duración en segundos
- `videoResolution`: Resolución (720p, 1080p)
- `videoLoading`: Estado de carga
- `videoJobId`: ID del trabajo de generación
- `videoStatus`: Estado del trabajo
- `videoUrl`: URL del video generado
- `videoError`: Mensajes de error

**Modelos Disponibles:**
- **Seedance 1.0 Pro Fast** (ByteDance)
- **Kling 2.5** (Kling)

**Características:**
- Selector de modelo de video
- Formulario de configuración de video
- Sistema de polling con timeout extendido (videos tardan más)
- Reproductor de video integrado
- Manejo de errores

---

## 🔄 Flujo de Datos

```
App.js
  ├── Gestiona el estado global (apiKey, activeTab)
  │
  ├── ApiKeySection
  │     └── Modifica apiKey en localStorage
  │
  ├── Tabs
  │     └── Cambia activeTab
  │
  ├── ImageGenerator (si activeTab === 'image')
  │     ├── Usa apiToken
  │     └── Puede solicitar mostrar ApiKeySection
  │
  └── VideoGenerator (si activeTab === 'video')
        ├── Usa apiToken
        └── Puede solicitar mostrar ApiKeySection
```

## 🎨 Organización de Estilos

Cada componente tiene su propio archivo CSS para mantener los estilos encapsulados:

- **App.css**: Estilos globales, layout principal, gradientes
- **ApiKeySection.css**: Botones de API key, formularios, animaciones
- **Tabs.css**: Estilos de pestañas, indicadores activos
- **ImageGenerator.css**: Formularios, spinners, contenedor de imagen
- **VideoGenerator.css**: Selector de modelo, formularios, reproductor de video

## 🚀 Beneficios de esta Estructura

1. **Modularidad**: Cada componente es independiente y reutilizable
2. **Mantenibilidad**: Fácil localizar y modificar funcionalidades específicas
3. **Escalabilidad**: Agregar nuevas características es simple
4. **Separación de responsabilidades**: Cada archivo tiene un propósito claro
5. **Testabilidad**: Los componentes se pueden probar de forma aislada
6. **Legibilidad**: El código es más fácil de entender y navegar

## 📝 Cómo Agregar un Nuevo Generador

1. Crear un nuevo componente en `src/components/NuevoGenerador.js`
2. Crear su archivo CSS correspondiente
3. Importarlo en `App.js`
4. Agregar una nueva opción en el componente `Tabs`
5. Renderizarlo condicionalmente según `activeTab`

Ejemplo:
```javascript
// En App.js
import NuevoGenerador from './components/NuevoGenerador';

// En el return
{activeTab === 'nuevo' && (
  <NuevoGenerador 
    apiToken={API_TOKEN}
    setShowApiKeyInput={setShowApiKeyInput}
  />
)}
```

## 🔧 Mantenimiento

- **Actualizar modelos de video**: Editar el objeto `videoModels` en `VideoGenerator.js`
- **Cambiar estilos**: Modificar el archivo CSS específico del componente
- **Agregar validaciones**: Actualizar la lógica en el componente correspondiente
- **Modificar API endpoints**: Cambiar las URLs en los métodos `fetch` de cada generador

---

¡El proyecto ahora está mejor organizado y es más fácil de mantener! 🎉
