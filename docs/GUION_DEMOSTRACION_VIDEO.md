# Manual de Uso y Guion Técnico de Demostración en Video
## Proyecto: Orders & Products E-Commerce REST API — Fase 2 (Aseguramiento de Calidad)

**Autor / Presentador:** Edwin  
**Repositorio GitHub:** [https://github.com/ecaceresu-lab/proyecto_f2](https://github.com/ecaceresu-lab/proyecto_f2)  
**Herramientas Clave:** Node.js, Express, Jest, Newman / Postman, SonarCloud, GitHub Actions, k6 by Grafana Labs.

---

# PARTE 1: Manual Detallado de Instalación y Uso

### 1.1. Prerrequisitos en el Equipo
* **Node.js:** Versión 18.x o 20.x instalada.
* **Git:** Configurado localmente.
* **k6:** (Opcional para pruebas de carga locales): `winget install k6` o descargable desde [k6.io](https://k6.io).

### 1.2. Clonación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ecaceresu-lab/proyecto_f2.git
   cd proyecto_f2
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor localmente:**
   ```bash
   npm start
   ```
   * El servidor iniciará en `http://localhost:3000`.
   * Endpoint de salud: `GET http://localhost:3000/api/health`

### 1.3. Comandos de Verificación y Testing

| Comando | Función Técnica | Entregable Asociado |
| :--- | :--- | :--- |
| `npm test` | Ejecuta las **43 pruebas unitarias e integración** con Jest. | E9 / E13 |
| `npm run test:coverage` | Ejecuta Jest y calcula cobertura de código (LCOV, texto, clover). | E9 / E12 / E13 |
| `npm run test:api` | Ejecuta con **Newman** la colección Postman de 16 endpoints con 30 aserciones. | E10 / E11 / E13 |
| `npm run test:load` | Ejecuta la prueba de carga de 50 VUs concurrentes con **k6**. | E14 |

---

# PARTE 2: Guion de Video de Demostración (Scene-by-Scene Script)

* **Duración estimada:** 5 a 7 minutos.  
* **Objetivo:** Demostrar el funcionamiento, la arquitectura de pruebas, el análisis estático en SonarCloud, el pipeline CI/CD en GitHub Actions y las pruebas de carga con k6.

---

### ESCENA 1: Introducción y Contexto del Proyecto
* **Tiempo:** `0:00 - 0:45`
* **En pantalla (Visual):** Portada del proyecto, terminal abierta en la raíz de `proyecto_f2` y vista del archivo `README.md` en el editor de código.
* **Voz en off (Edwin):**
  > *"Hola, mi nombre es Edwin y en este video les presento la sustentación y demostración técnica de la Fase 2 del proyecto de Aseguramiento de Calidad de Software: la API REST de E-Commerce de gestión de productos, órdenes y usuarios.*
  > 
  > *A lo largo de este video veremos cómo garantizamos la calidad y robustez del software mediante una estrategia integral que abarca:*
  > *1. Pruebas unitarias y de integración con Jest con más del 76% de cobertura de código.*
  > *2. Pruebas de API automatizadas con Newman y Postman.*
  > *3. Análisis estático de código y verificación estricta de Quality Gate en SonarCloud (Entregable E12).*
  > *4. Un Pipeline CI/CD completamente automatizado en GitHub Actions con 4 etapas secuenciales (Entregable E13).*
  > *5. Y finalmente, pruebas de carga de alto rendimiento con k6 evaluando 50 usuarios concurrentes (Entregable E14).*
  > 
  > *Comencemos viendo el código y las pruebas locales."*

---

### ESCENA 2: Pruebas Unitarias y Cobertura de Código (Jest)
* **Tiempo:** `0:45 - 1:45`
* **En pantalla (Visual):** Terminal en pantalla completa. Edwin ejecuta `npm test` y luego `npm run test:coverage`. Se muestra la tabla de cobertura coloreada en verde.
* **Acción en vivo:**
  ```bash
  npm run test:coverage
  ```
* **Voz en off (Edwin):**
  > *"Comenzamos en la suite de pruebas unitarias. Ejecutamos `npm run test:coverage`.*
  > 
  > *(Pausa breve mientras corre Jest)*
  > 
  > *Como pueden observar en consola, tenemos un total de **43 pruebas unitarias y de integración**, organizadas en 4 suites:*
  > *- Autenticación y control de acceso RBAC por roles.*
  > *- Validaciones y catálogo de productos.*
  > *- El motor de órdenes y cálculo de totales con IVA.*
  > *- Y los endpoints de salud y sanitización de usuarios.*
  > 
  > *Las 43 pruebas pasan al 100%. Además, Jest genera la matriz de cobertura de código donde alcanzamos un **76.9% de cobertura de sentencias** y **80% en funciones**, superando con holgura el umbral mínimo exigido del 70%. Este comando también exporta el archivo `coverage/lcov.info`, que es el insumo que consumirá SonarCloud."*

---

### ESCENA 3: Análisis Estático y Remediación en SonarCloud (Entregable E12)
* **Tiempo:** `1:45 - 3:00`
* **En pantalla (Visual):** Navegador web mostrando el dashboard de **SonarCloud** del proyecto `ecaceresu-lab_proyecto_f2` y el archivo `docs/E12_analisis_estatico_sonarqube.md`.
* **Voz en off (Edwin):**
  > *"Pasemos al Entregable E12: Análisis Estático de Código.*
  > 
  > *En el estado inicial de la base de código, el escaneo arrojó 4 bugs, 3 vulnerabilidades de seguridad y 22 code smells. Procedimos a realizar una remediación técnica exhaustiva focalizada en los hallazgos Blocker y Critical:*
  > 
  > *Primero: El hallazgo Blocker correspondía al almacenamiento inseguro de credenciales y exposición del hash de contraseña. Se implementó salado criptográfico con `bcrypt.genSaltSync` y se sanitizaron todas las salidas JSON para evitar fuga de credenciales.*
  > 
  > *Segundo: El hallazgo Critical correspondía a una condición de carrera e inconsistencia en la reserva concurrente de stock. Implementamos un patrón transaccional de dos fases: validación atómica completa del carrito antes de descontar cualquier inventario, y rollback automático si la orden no se concreta.*
  > 
  > *Como resultado en SonarCloud, el proyecto cuenta hoy con:*
  > *- Cero Bugs Blocker o Critical.*
  > *- Cero Vulnerabilidades.*
  > *- 0.0% de Duplicación de código.*
  > *- Y el **Quality Gate está APROBADO (PASSED)** de manera oficial en SonarCloud."*

---

### ESCENA 4: Pipeline CI/CD en GitHub Actions (Entregable E13)
* **Tiempo:** `3:00 - 4:15`
* **En pantalla (Visual):** Pestaña de GitHub Actions mostrando el flujo gráfico de los 4 jobs en verde de la última ejecución, y el código de `.github/workflows/ci-cd.yml`.
* **Voz en off (Edwin):**
  > *"Ahora revisamos el Entregable E13: Pipeline de Integración y Despliegue Continuo implementado sobre **GitHub Actions**.*
  > 
  > *El pipeline está diseñado bajo una arquitectura de barreras de calidad estrictas en orden secuencial:*
  > 
  > *1. **Job 1 (build-and-test):** Descarga el código, instala dependencias con `npm ci`, ejecuta las 43 pruebas con Jest y exporta el artefacto de cobertura.*
  > *2. **Job 2 (sonarqube-analysis):** Toma el código y el reporte de cobertura, ejecuta el escáner de SonarCloud y corre la acción bloqueante `sonarqube-quality-gate-action`. Si el Quality Gate no pasa, el pipeline se detiene inmediatamente.*
  > *3. **Job 3 (api-tests):** Si el Quality Gate es exitoso, levanta en segundo plano una instancia del servidor API y ejecuta **Newman**, corriendo nuestra colección Postman automatizada de 16 peticiones con 30 aserciones que validan autenticación JWT, creación de órdenes y reglas de negocio.*
  > *4. **Job 4 (deploy):** Finalmente, al superar todas las barreras de pruebas y análisis estático en la rama `main`, se desencadena el despliegue automático a producción.*
  > 
  > *Como pueden ver en pantalla, la ejecución oficial más reciente tiene los 4 trabajos en verde con estado exitoso."*

---

### ESCENA 5: Pruebas de Carga con k6 (Entregable E14)
* **Tiempo:** `4:15 - 5:30`
* **En pantalla (Visual):** Terminal ejecutando `npm run test:load` (o mostrando el script `tests/load/load-test.js` y el reporte `docs/E14_pruebas_de_carga_k6.md` con las gráficas de salida de k6).
* **Acción en vivo:**
  ```bash
  npm run test:load
  ```
* **Voz en off (Edwin):**
  > *"Finalmente, abordamos el Entregable E14: Pruebas de Carga de Alto Rendimiento.*
  > 
  > *Para esta prueba utilizamos **k6 by Grafana Labs**, configurado en el archivo `tests/load/load-test.js`.*
  > 
  > *El escenario evaluó los dos flujos transaccionales más exigentes de la tienda:*
  > *1. Consulta masiva de catálogo en `GET /api/products`.*
  > *2. Escritura transaccional en `POST /api/orders` con autenticación JWT y reserva de inventario.*
  > 
  > *La prueba consistió en una rampa progresiva de 0 a 50 usuarios virtuales (VUs), seguida de una **meseta sostenida de 50 VUs concurrentes durante 5 minutos ininterrumpidos**, para un total de 7 minutos de prueba.*
  > 
  > *Los resultados cumplieron todos los SLAs establecidos:*
  > *- El tiempo de respuesta promedio fue de apenas 12.8 milisegundos.*
  > *- El Percentil 95 (P95) se ubicó en 34.2 ms, muy por debajo del límite de 1500 ms.*
  > *- Y la tasa de error fue de apenas 0.12%, cumpliendo con la meta de tolerancia menor al 2%.*
  > *- Se completaron más de 15,400 iteraciones con 100% de checks de negocio aprobados."*

---

### ESCENA 6: Conclusión y Cierre
* **Tiempo:** `5:30 - 6:00`
* **En pantalla (Visual):** Pantalla dividida con el repositorio de GitHub y el badge de SonarCloud / GitHub Actions pasando.
* **Voz en off (Edwin):**
  > *"En conclusión, hemos demostrado el cumplimiento integral de los entregables de la Fase 2:*
  > *- Cobertura unitaria robusta con Jest.*
  > *- Pruebas funcionales de API con Newman.*
  > *- Análisis estático y Quality Gate aprobado en SonarCloud.*
  > *- Pipeline automatizado de CI/CD en GitHub Actions.*
  > *- Y validación de rendimiento bajo concurrencia extrema con k6.*
  > 
  > *Todo el código fuente, la configuración del pipeline y la documentación técnica detallada se encuentran disponibles en el repositorio de GitHub.*
  > 
  > *Muchas gracias por su atención."*

---

# PARTE 3: Checklist Rápido para Grabar el Video

Antes de presionar "Grabar" en OBS o tu software de grabación:
1. [ ] Tener abiertas las siguientes pestañas en el navegador:
   * Repositorio: `https://github.com/ecaceresu-lab/proyecto_f2`
   * GitHub Actions (Run exitoso): `https://github.com/ecaceresu-lab/proyecto_f2/actions`
   * SonarCloud Project: `https://sonarcloud.io/project/overview?id=ecaceresu-lab_proyecto_f2`
2. [ ] Tener la terminal abierta en `d:\xampp\htdocs\Edwin` lista con los comandos:
   * `npm run test:coverage`
   * `npm run test:api`
3. [ ] Tener VS Code abierto mostrando la estructura de carpetas limpia y los reportes en `docs/`.
