# 🚀 EK Final UI - Sistema de Gestión de Usuarios

![Angular](https://img.shields.io/badge/Angular-21.0-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Jest](https://img.shields.io/badge/Jest-30.2-green?logo=jest)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)

Plataforma integral de gestión de personal desarrollada con Angular 21, diseñada para administrar usuarios y departamentos con visualización interactiva de datos mediante gráficos de barras.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Testing](#-testing)
- [Docker](#-docker)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Backend](#-api-backend)
- [Autor](#-autor)

---

## ✨ Características

### Funcionalidades Principales

- ✅ **Gestión de Usuarios**: Creación y administración de usuarios con validación completa
- 📊 **Visualización de Datos**: Gráficos interactivos con Chart.js para distribución por departamento
- 🎨 **Diseño Responsivo**: Interfaz adaptable a dispositivos móviles, tablets y desktop
- 🔔 **Sistema de Notificaciones**: Feedback visual para acciones del usuario
- ⚡ **Carga Optimizada**: Lazy loading de componentes para mejor rendimiento
- 🛡️ **Validación de Formularios**: Validación reactiva con mensajes de error específicos

### Características Técnicas

- 🧪 **Cobertura de Tests**: Testing completo con Jest (services y components)
- 🐳 **Dockerizado**: Deployment containerizado con Nginx
- 🎯 **TypeScript Strict Mode**: Tipado fuerte y seguridad en tiempo de compilación
- 📱 **Progressive Web App Ready**: Arquitectura preparada para PWA

---

## 🛠 Tecnologías

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Angular** | 21.0.0 | Framework principal |
| **TypeScript** | 5.9.2 | Lenguaje de programación |
| **RxJS** | 7.8.0 | Programación reactiva |
| **Chart.js** | 4.5.1 | Visualización de datos |
| **ng2-charts** | 8.0.0 | Wrapper de Chart.js para Angular |
| **Tailwind CSS** | 4.1.12 | Framework de utilidades CSS |
| **DaisyUI** | 5.5.8 | Componentes UI |

### Testing

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Jest** | 30.2.0 | Framework de testing |
| **jest-preset-angular** | 16.0.0 | Preset de Jest para Angular |

### DevOps

| Tecnología | Descripción |
|------------|-------------|
| **Docker** | Containerización |
| **Docker Compose** | Orquestación de contenedores |

---

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js**: >= 18.x
- **npm**: >= 10.x
- **Docker**: >= 20.x (para deployment)
- **Docker Compose**: >= 2.x (para deployment)

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ek-final-ui.git
cd ek-final-ui
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Edita `src/environments/environment.development.ts` para desarrollo:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8085/api/v1',
  apiTimeout: 30000,
  enableDebugMode: true,
};
```

Edita `src/environments/environment.ts` para producción:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://tu-dominio.com/api/v1',
  apiTimeout: 30000,
  enableDebugMode: false,
};
```

---

## 💻 Uso

### Desarrollo

Iniciar servidor de desarrollo:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

### Build de producción
```bash
npm run build
```

Los archivos compilados estarán en `dist/ek-final-ui/browser/`

### Watch mode (desarrollo)
```bash
npm run watch
```

---

## 🧪 Testing

### Ejecutar todos los tests
```bash
npm test
```

### Tests en modo watch
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run test:coverage
```

El reporte se generará en `coverage/`

---

## 🐳 Docker

### Build de la imagen
```bash
docker build -t ek-final-ui .
```

### Ejecutar con Docker Compose
```bash
docker-compose up -d
```

La aplicación estará disponible en `http://localhost:4200`

### Detener contenedores
```bash
docker-compose down
```

### Configuración Docker

**Dockerfile** (Multi-stage build):
- **Stage 1**: Build de la aplicación con Node.js 22-alpine
- **Stage 2**: Servidor Nginx para servir archivos estáticos

**docker-compose.yml**:
```yaml
services:
  frontend:
    build: .
    container_name: ek-final-ui
    ports:
      - "4200:80"
    restart: always
```

---

## 📁 Estructura del Proyecto
```
ek-final-ui/
├── public/                    # Archivos estáticos
│   └── images/               # Imágenes
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/     # Servicios (UsuarioService)
│   │   ├── pages/
│   │   │   ├── inicio/       # Página de inicio
│   │   │   ├── nosotros/     # Página sobre el proyecto
│   │   │   └── usuarios/     # Página de gestión de usuarios
│   │   ├── shared/
│   │   │   ├── components/   # Componentes compartidos (Navbar)
│   │   │   └── models/       # Interfaces y tipos
│   │   ├── app.config.ts     # Configuración de la aplicación
│   │   ├── app.routes.ts     # Definición de rutas
│   │   └── app.ts            # Componente raíz
│   ├── environments/          # Configuración de entornos
│   ├── styles.css            # Estilos globales
│   └── main.ts               # Punto de entrada
├── jest.config.js            # Configuración de Jest
├── setup-jest.ts             # Setup de Jest
├── Dockerfile                # Configuración de Docker
├── docker-compose.yml        # Orquestación de Docker
├── nginx.conf                # Configuración de Nginx
├── package.json              # Dependencias del proyecto
└── README.md                 # Este archivo
```

---

## 🔌 API Backend

Esta aplicación frontend se conecta a un backend Spring Boot. Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

### Endpoints utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/users/create` | Crear nuevo usuario |
| `GET` | `/api/v1/users/by-categories` | Obtener usuarios por departamento |

### Modelo de Datos

**Usuario**:
```typescript
{
  id: number;
  name: string;
  email: string;
  departmentId: number;
}
```

**Distribución por Departamento**:
```typescript
{
  departmentId: number;
  departmentName: string;
  userCount: number;
}
```

---

## 👨‍💻 Autor

**Martin Lecaros**  
Desarrollador Full Stack | Eureka 2025
