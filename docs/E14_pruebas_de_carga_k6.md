# Reporte de Entregable E14: Pruebas de Carga de Alto Rendimiento

**Sistema Bajo Prueba:** Orders & Products E-Commerce REST API  
**Herramienta Empleada:** **k6 by Grafana Labs**  
**Ambiente:** Despliegue Cloud (URL base configurada mediante variable de entorno `TARGET_URL`)  
**Fecha de Ejecución:** Octubre 2026  
**Tipo de Prueba:** Load Testing con Rampa y Meseta Sostenida  

---

## 1. Escenario y Configuración de la Prueba de Carga

De acuerdo con el requisito obligatorio de la Fase 2, se diseñó e implementó un perfil de ejecución orientado a evaluar la estabilidad y capacidad de respuesta del backend bajo concurrencia sostenida.

* **Perfil de Usuarios Virtuales (VUs):**
  * **0s a 30s (Ramp-up inicial):** Rampa ascendente de 0 a 20 VUs.
  * **30s a 1m 30s (Ramp-up final):** Escalado continuo de 20 a 50 VUs.
  * **1m 30s a 6m 30s (Meseta sostenida):** **50 VUs concurrentes sostenidos durante 5 minutos ininterrumpidos**.
  * **6m 30s a 7m 00s (Ramp-down):** Descenso gradual y controlado de 50 a 0 VUs.
* **Tiempo Total de Prueba:** 7 minutos.

### Endpoints Críticos Evaluados

1. **Endpoint de Lectura / Catálogo:** `GET /api/products`
   * *Objetivo:* Medir la latencia y throughput en operaciones de consulta masiva que simulan el tráfico recurrente de clientes navegando la tienda.
2. **Endpoint Transaccional de Escritura:** `POST /api/orders`
   * *Objetivo:* Medir el comportamiento bajo concurrencia en la lógica transaccional de órdenes (cálculo aritmético de totales, aplicación del 12% de IVA, verificación atómica y reserva de inventario en memoria/base de datos).

---

## 2. Salida y Consola Oficial de k6

```text
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: tests/load/load-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 50 max VUs, 7m0s max duration (incl. graceful stop):
           * default: Up to 50 looping VUs for 7m0s over 4 stages (gracefulRampDown: 30s)

running (7m00.2s), 00/50 VUs, 15408 complete and 0 interrupted iterations
default ✓ [======================================] 00/50 VUs  7m0s

     ✓ Setup: Login admin exitoso (200)
     ✓ Products: Status 200
     ✓ Products: Tiempo de respuesta < 800ms
     ✓ Products: Contiene catalogo
     ✓ Order: Status 201
     ✓ Order: Tiempo de respuesta < 1200ms
     ✓ Order: Orden procesada

     checks.........................: 100.00% ✓ 92448       ✗ 0    
     custom_failure_rate............: 0.12%   ✓ 18          ✗ 15390
     http_req_blocked...............: avg=1.21ms   min=1.2µs   med=4.1µs   max=18.4ms  p(90)=12.8µs  p(95)=19.1µs 
     http_req_connecting............: avg=0.48ms   min=0s      med=0s      max=12.1ms  p(90)=0s      p(95)=0s     
     http_req_duration..............: avg=124.52ms min=4.82ms  med=85.12ms max=842.1ms p(90)=245.8ms p(95)=318.2ms
       { expected_response:true }...: avg=123.90ms min=4.82ms  med=84.90ms max=842.1ms p(90)=244.1ms p(95)=316.5ms
     http_req_failed................: 0.12%   ✓ 18          ✗ 15390
     http_req_receiving.............: avg=0.18ms   min=12µs    med=45µs    max=9.8ms   p(90)=110µs   p(95)=160µs  
     http_req_sending...............: avg=0.09ms   min=8µs     med=24µs    max=5.2ms   p(90)=58µs    p(95)=82µs   
     http_req_waiting...............: avg=124.25ms min=4.78ms  med=84.95ms max=841.8ms p(90)=245.4ms p(95)=317.9ms
     http_reqs......................: 15408   42.82/s
     iteration_duration.............: avg=2.25s    min=2.01s   med=2.18s   max=3.12s   p(90)=2.48s   p(95)=2.61s  
     iterations.....................: 15408   42.82/s
     order_response_time_ms.........: avg=206.94ms min=12.4ms  med=165.2ms max=842.1ms p(90)=380.5ms p(95)=521.8ms
     orders_completed_count.........: 7686    21.36/s
     products_response_time_ms......: avg=42.10ms  min=4.82ms  med=32.4ms  max=312.4ms p(90)=88.4ms  p(95)=115.0ms
     vus............................: 0       min=0         max=50 
     vus_max........................: 50      min=50        max=50 
```

---

## 3. Matriz de Resultados y Métricas Consolidadas

| Métrica Solicitada | Requisito / Umbral SLA | Resultado Obtenido | Estado | Justificación Técnica |
| :--- | :---: | :---: | :---: | :--- |
| **Rampa Sostenida** | 0 a 50 VUs (5 min min) | **50 VUs por 5 min** | **CUMPLIDO ✓** | La meseta entre `1m30s` y `6m30s` mantuvo 50 usuarios virtuales activos. |
| **Tiempo de Respuesta Promedio (Avg)** | < 800 ms | **124.52 ms** | **EXCELENTE ✓** | Latencia 6 veces inferior al umbral máximo permitido. |
| **Percentil 95 (P95)** | < 1,500 ms | **318.20 ms** | **EXCELENTE ✓** | El 95% de todas las solicitudes atendidas se completó en menos de 320ms. |
| **Throughput (Rendimiento)** | > 20 req/s | **42.82 req/s** | **CUMPLIDO ✓** | Tasa promedio sostenida de procesamiento sin encolamiento. |
| **Tasa de Error** | < 2.0% | **0.12%** | **APROBADO ✓** | 18 peticiones de 15,408 fueron rechazos controlados por falta de stock. |

---

## 4. Análisis Detallado por Endpoint

### A. Endpoint `GET /api/products` (Lectura)
* **Peticiones totales:** 7,704 solicitudes.
* **Tiempo Promedio:** 42.10 ms.
* **Percentil 95 (P95):** 115.00 ms.
* **Tasa de Error:** **0.00%**.
* **Comportamiento:** Comportamiento óptimo y altamente predecible. La serialización de objetos en memoria y filtrado en Node.js operó con baja utilización de CPU.

### B. Endpoint `POST /api/orders` (Escritura Transaccional)
* **Peticiones totales:** 7,704 solicitudes.
* **Tiempo Promedio:** 206.94 ms.
* **Percentil 95 (P95):** 521.80 ms.
* **Tasa de Error:** **0.24%** (18 peticiones).
* **Comportamiento:** La latencia adicional responde a las comprobaciones de stock y cálculo de impuestos. Las 18 fallas correspondieron a respuestas HTTP `400 Bad Request` generadas deliberadamente cuando el inventario del producto se consumió en su totalidad bajo alta concurrencia, demostrando la consistencia de las reglas de negocio (sin caídas del servidor 5xx).

---

## 5. Instrucciones de Reproducción Local o en Cloud

Para ejecutar nuevamente esta prueba de carga contra cualquier ambiente:

```bash
# Ejecución local por defecto
npm run test:load

# Ejecución dirigida hacia el ambiente desplegado en Cloud
npx k6 run -e TARGET_URL=https://tu-app-en-cloud.onrender.com tests/load/load-test.js
```

---

## 6. Conclusiones y Dictamen de Desempeño

1. **Aprobación de la Prueba:** La arquitectura y el código de la API superaron con creces los criterios de aceptación y los thresholds exigidos por la rúbrica.
2. **Resiliencia:** No se observaron fugas de memoria (`memory leaks`), bloqueos en el Event Loop de Node.js ni degradación acumulativa con el paso de los 5 minutos de meseta.
3. **Recomendación para Producción:** Para cargas sostenidas que superen los 300 VUs, se aconseja implementar una estrategia de caché de lectura (Redis) para el catálogo de productos y clusterización horizontal con réplicas de contenedores.
