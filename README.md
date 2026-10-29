# Proyecto Fase 2: Automatización, Integración Continua y Calidad Interna

API REST para la gestión de productos, órdenes de compra y autenticación de usuarios (*Orders & Products E-Commerce API*), desarrollada en Node.js, Express y Jest para dar cumplimiento a los entregables **E9, E10, E11, E12, E13 y E14**.

---

## 🚀 Estructura del Repositorio

```text
Edwin/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # [E13] Pipeline GitHub Actions secuencial
├── docs/
│   ├── E12_analisis_estatico_sonarqube.md # [E12] Reporte SonarQube, remediación y Quality Gate
│   ├── E13_pipeline_ci_cd.md              # [E13] Documentación técnica del pipeline CI/CD
│   └── E14_pruebas_de_carga_k6.md         # [E14] Reporte formal de pruebas de carga k6
├── src/
│   ├── app.js                       # Configuración de Express, middlewares y rutas
│   ├── server.js                    # Inicialización del servidor HTTP
│   ├── data/db.js                   # Base de datos en memoria para testing aislado
│   ├── middlewares/auth.js          # Middleware JWT y control de acceso basado en roles
│   └── services/                    # Lógica de negocio (Users, Products, Orders)
├── tests/
│   ├── unit/                        # [E10] 43 Pruebas unitarias/integración con Jest
│   ├── api/                         # [E11] Colección Postman (16 requests / 30 asserts)
│   └── load/                        # [E14] Script k6 (0 a 50 VUs por 5 minutos)
├── package.json                     # Scripts y dependencias
└── sonar-project.properties         # [E12] Configuración oficial de SonarCloud / SonarQube
```

---

## 📋 Comandos Disponibles

### 1. Iniciar el Servidor API
```bash
npm start
```
*Healthcheck disponible en:* `http://localhost:3000/api/health`

### 2. [E10] Ejecutar Pruebas Unitarias y Cobertura LCOV
```bash
npm run test:coverage
```
* Resultado: **43 pruebas unitarias aprobadas**, 0 fallas, **76.9% de cobertura de código**.
* Incluye uso de **Mocks/Stubs** en dependencias críticas (`bcryptjs`, `jsonwebtoken` y `productService.getById`).

### 3. [E11] Ejecutar Pruebas de API con Newman
```bash
npm run test:api
```
* Resultado: **16 solicitudes HTTP y 30 aserciones automatizadas** sobre status code, esquemas JSON y datos de negocio con flujo encadenado.

### 4. [E12] Análisis Estático y Quality Gate (SonarQube / SonarCloud)
* Archivo de configuración: [sonar-project.properties](file:///d:/xampp/htdocs/Edwin/sonar-project.properties).
* Reporte detallado de estado inicial, remediación de hallazgos **Blocker y Critical** y comparativa antes/después en: [E12_analisis_estatico_sonarqube.md](file:///d:/xampp/htdocs/Edwin/docs/E12_analisis_estatico_sonarqube.md).

### 5. [E13] Pipeline CI/CD (GitHub Actions)
* Definición: [.github/workflows/ci-cd.yml](file:///d:/xampp/htdocs/Edwin/.github/workflows/ci-cd.yml).
* Flujo de ejecución secuencial:
  1. `build-and-test` (Compilación, unit tests con Jest y extracción de cobertura).
  2. `sonarqube-analysis` (Escaneo SonarCloud y verificación estricta de Quality Gate que bloquea si falla).
  3. `api-tests` (Levantamiento de servidor en background y ejecución de Newman).
  4. `deploy` (Despliegue a ambiente Cloud al integrarse en la rama `main`).

### 6. [E14] Pruebas de Carga con k6
```bash
k6 run tests/load/load-test.js
```
* Script: [load-test.js](file:///d:/xampp/htdocs/Edwin/tests/load/load-test.js).
* Escenario: Rampa hasta **50 VUs sostenida durante 5 minutos** evaluando `GET /api/products` y `POST /api/orders`.
* Métricas reportadas (Avg response time, P95, Throughput y tasa de error) documentadas en: [E14_pruebas_de_carga_k6.md](file:///d:/xampp/htdocs/Edwin/docs/E14_pruebas_de_carga_k6.md).

---

## 🌿 [E9] Estrategia de Ramas
El repositorio está inicializado con las 3 ramas solicitadas:
* `main`: Producción (protegida con pipeline).
* `qa`: Ambiente de pruebas y control de calidad.
* `dev`: Desarrollo activo.
