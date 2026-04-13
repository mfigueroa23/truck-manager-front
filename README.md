# TruckGate — Frontend `v2.0.0`

Dashboard web para el control de acceso de flotas de camiones en tiempo real. Construido con **Angular 21**, **Tailwind CSS v4** y gráficos SVG nativos.

Consume la API REST de [truck-manager-api](../truck-manager-api/README.md).

---

## Cambios en v2.0.0

- **RFID en camión:** el campo RFID se movió del formulario de conductores al de camiones.
- **Panel principal con gráficos:** 4 gráficos integrados (torta, barras por modelo, 2 líneas de tiempo) y tabla de histórico reciente.
- **Nueva sección Histórico:** tabla completa de viajes con búsqueda, filtro por fechas y gráficos de línea detallados.
- **Nueva sección Gráficos:** vista dedicada con los 4 gráficos a tamaño completo (30 días de histórico).

---

## Requisitos

- Node.js >= 20
- npm >= 11

---

## Levantar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Servidor de desarrollo

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

### 3. Build de producción

```bash
npm run build
```

Los artefactos se generan en `dist/`.

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── models/
│   │   ├── camion.model.ts       # Incluye campo rfid
│   │   ├── conductor.model.ts
│   │   ├── empresa.model.ts
│   │   └── registro.model.ts     # RegistroView + HistoricoItem
│   └── services/
│       ├── camion.service.ts
│       ├── conductor.service.ts
│       ├── empresa.service.ts
│       ├── registro.service.ts   # getAll() + getHistorico()
│       └── toast.service.ts
├── features/
│   ├── registro/                 # Panel principal con gráficos e histórico
│   ├── historico/                # Tabla completa + gráficos de línea
│   ├── graficos/                 # Dashboard de gráficos (30 días)
│   ├── camiones/                 # CRUD camiones (incluye RFID)
│   ├── conductores/              # CRUD conductores
│   └── empresas/                 # CRUD empresas
└── shared/
    ├── atoms/
    │   ├── badge/
    │   ├── button/
    │   └── spinner/
    ├── molecules/
    │   ├── confirm-dialog/
    │   ├── modal/
    │   └── toast/
    └── organisms/
        ├── layout/
        └── sidebar/
```

---

## Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/registro` | `RegistroComponent` | Panel principal: estado de flota, gráficos, RFID scanner, histórico reciente |
| `/historico` | `HistoricoComponent` | Tabla completa de viajes con búsqueda/fechas y gráficos de línea |
| `/graficos` | `GraficosComponent` | Dashboard con 4 gráficos a tamaño completo |
| `/camiones` | `CamionesComponent` | CRUD de camiones |
| `/conductores` | `ConductoresComponent` | CRUD de conductores |
| `/empresas` | `EmpresasComponent` | CRUD de empresas |

---

## Secciones principales

### 📋 Registro (panel principal)

- **Stats:** total camiones, en reparto, disponibles, viajes totales.
- **Gráficos:**
  - Torta (donut): distribución disponibles vs. en reparto.
  - Barras horizontales: unidades por marca/modelo.
  - Línea de salidas: frecuencia diaria en los últimos 14 días.
  - Línea de entradas: frecuencia diaria en los últimos 14 días.
- **Lector RFID:** registra salidas y entradas escaneando el RFID del camión.
- **Tabla de estado actual:** flota en tiempo real (se refresca cada 30 s).
- **Histórico reciente:** últimos 15 viajes completados con duración calculada.

### 🕓 Histórico

- Stats: total viajes, hoy, esta semana, duración media.
- Gráficos de línea (salidas y entradas) para los últimos 14 días con etiquetas por punto.
- Tabla completa con búsqueda por patente/conductor/empresa y filtro por rango de fechas.

### 📊 Gráficos

- Torta (donut) con leyenda interactiva y porcentajes.
- Barras horizontales con colores diferenciados por modelo.
- Dos gráficos de línea con histórico de 30 días (salidas y entradas por separado).

### 🚛 Camiones

CRUD completo. El formulario de creación/edición incluye el campo **RFID** del camión (único en la flota).

### 👤 Conductores

CRUD completo. El RFID ya no está asociado al conductor.

---

## Gráficos

Todos los gráficos están implementados con **SVG nativo** usando Angular signals y `computed()`. No se usa ninguna librería de gráficos externa.

| Gráfico | Técnica SVG |
|---|---|
| Torta / Donut | `stroke-dasharray` + `stroke-dashoffset` en `<circle>` |
| Barras horizontales | `<div>` con `width` calculado en `%` (Tailwind) |
| Líneas de tiempo | `<path>` con puntos calculados + área de relleno con `<linearGradient>` |

---

## Configuración de la API

La URL base de la API está definida en cada servicio como constante:

```typescript
// src/app/core/services/registro.service.ts
const BASE = 'https://api-truckmanager.devsonic.cl';
```

Modificar esa constante para apuntar a otro entorno.

---

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 | Framework principal |
| Tailwind CSS | 4 | Estilos |
| TypeScript | 5.9 | Lenguaje |
| RxJS | 7.8 | Manejo de observables HTTP |
| Angular Signals | — | Estado reactivo |
| SVG nativo | — | Gráficos |
