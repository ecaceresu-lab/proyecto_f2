# Plan de Implementación - Fase 2 (E9 a E14)

## Proyecto: E-Commerce Orders & Products API (Node.js + Express + Jest)

### Estructura de Entregables que se generarán:
1. **Código Fuente del Proyecto**:
   - Backend REST API estructurado modularmente (Controllers, Services, Models, Middlewares).
   - Endpoints clave:
     - `/api/auth/login` y `/api/auth/register` (Autenticación JWT)
     - `/api/products` (CRUD de catálogo, búsqueda y stock)
     - `/api/orders` (Creación de pedidos, cálculo de totales, validación de stock)
     - `/api/health` (Healthcheck para monitoreo y pipeline)
2. **E10: Pruebas Unitarias**:
   - Suite con Jest y Supertest (+30 pruebas unitarias y de integración de servicios).
   - Mocks de base de datos/repositorio para aislar dependencias externas.
   - Generación de reporte de cobertura LCOV para SonarCloud/SonarQube.
3. **E11: Pruebas de API**:
   - Colección Postman (`orders_api_collection.json`) con más de 15 requests automatizadas con aserciones (status code, JSON schema, headers, tiempo de respuesta).
   - Flujo de negocio encadenado: Register -> Login -> Token extraction -> Create Product -> List Products -> Create Order -> Verify Order Status.
   - Integración con Newman para ejecución en consola y CI/CD.
4. **E12: Análisis Estático de Código (SonarCloud / SonarQube)**:
   - Configuración `sonar-project.properties`.
   - Simulación y documentación de estado inicial (Bugs, Code Smells, Vulnerabilidades, Deuda Técnica).
   - Remediación documentada de fallos Blocker / Critical con tabla comparativa Antes vs Después.
   - Configuración de Quality Gate.
5. **E13: Pipeline CI/CD (GitHub Actions)**:
   - Workflow `.github/workflows/ci-cd.yml` secuencial:
     1. Build / Compilación
     2. Pruebas Unitarias con generación de cobertura
     3. Análisis SonarCloud con validación estricta de Quality Gate (bloquea si no aprueba)
     4. Pruebas de API automatizadas con Newman
     5. Despliegue continuo a ambiente Cloud (Render / Railway / Vercel)
6. **E14: Pruebas de Carga**:
   - Script automatizado en **k6** (`load-test.js`).
   - 2 endpoints críticos evaluados (`POST /api/orders` y `GET /api/products`).
   - Rampa de 0 a 50 Virtual Users (VUs) sostenida durante 5 minutos.
   - Generación de métricas: Avg Response Time, P95, Throughput (req/s), Error Rate (%).
   - Plantilla de reporte de resultados.
