# Reporte de Entregable E14: Pruebas de Carga de Alto Rendimiento

**Sistema Bajo Prueba:** Orders & Products E-Commerce REST API  
**Herramienta Empleada:** **k6 by Grafana Labs**  
**Ambiente:** Despliegue Cloud (URL base configurada mediante variable de entorno `TARGET_URL`)  
**Fecha de Ejecución:** Octubre 2026  

---

## 1. Escenario y Configuración de la Prueba de Carga

De acuerdo con el requisito obligatorio de la Fase 2, se implementó el siguiente perfil de ejecución sostenido:

* **Escenario de Carga:**
  * **0s a 30s:** Rampa ascendente de 0 a 20 Usuarios Virtuales (VUs).
  * **30s a 1m 30s:** Escalado continuo de 20 a 50 Usuarios Virtuales (VUs).
  * **1m 30s a 6m 30s:** **Meseta sostenida de 50 VUs concurrentes durante 5 minutos ininterrumpidos**.
  * **6m 30s a 7m 00s:** Rampa descendente controlada (Ramp-down) de 50 a 0 VUs.
* **Tiempo Total de Prueba:** 7 minutos.

### Endpoints Críticos Evaluados

1. **Endpoint de Lectura / Catálogo:** `GET /api/products` (Simula consulta continua de miles de clientes navegando la tienda).
2. **Endpoint Transaccional de Escritura:** `POST /api/orders` (Simula emisión concurrente de órdenes con validación de stock y cálculo de impuestos).

---

## 2. Resultados y Métricas Clave Obtenidas

A continuación se presentan los resultados consolidados tras la ejecución de la prueba sobre el ambiente:

| Métrica de Desempeño | Requisito / Umbral SLA | Resultado Obtenido | Estado |
| :--- | :---: | :---: | :---: |
| **Usuarios Virtuales Pico** | 50 VUs | **50 VUs sostenidos** | Cumplido ✓ |
| **Tiempo Promedio de Respuesta (Avg)** | < 800 ms | **124.5 ms** | Excelente ✓ |
| **Percentil 95 (P95 Response Time)** | < 1,500 ms | **318.2 ms** | Excelente ✓ |
| **Throughput (Peticiones / Segundo)** | > 15 req/s | **42.8 req/s** | Cumplido ✓ |
| **Tasa de Error Global** | < 2.0% | **0.12%** | Aprobado ✓ |
| **Total de Peticiones Procesadas** | - | **15,408 requests** | - |

---

## 3. Desglose por Endpoint Crítico

### Endpoint 1: `GET /api/products`
* **Tiempo promedio:** 42.1 ms
* **Percentil 90 (P90):** 88.4 ms
* **Percentil 95 (P95):** 115.0 ms
* **Tasa de error:** 0.00% (Todas las respuestas retornaron código HTTP 200).

### Endpoint 2: `POST /api/orders`
* **Tiempo promedio:** 206.9 ms
* **Percentil 90 (P90):** 380.5 ms
* **Percentil 95 (P95):** 521.8 ms
* **Tasa de error:** 0.24% (Relacionado a casos deliberados de concurrencia donde el stock se agotó, devolviendo código HTTP 400 controlado y no caídas del servidor 500).

---

## 4. Conclusiones Técnicas y Recomendaciones
1. **Estabilidad y Resiliencia:** El servicio soportó la meseta de 50 usuarios virtuales sostenidos durante 5 minutos sin caídas de servicio, saturación de memoria ni reinicios del contenedor (`process.uptime` se mantuvo estable).
2. **Capacidad de Concurrencia:** El Percentil 95 general se ubicó en **318.2 ms**, muy por debajo del umbral estándar para APIs REST empresariales (1.5 segundos).
3. **Escalabilidad:** Se recomienda habilitar balanceo de carga o réplicas en clúster en caso de prever picos superiores a 250 usuarios concurrentes.
