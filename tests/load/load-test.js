import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Definición de métricas personalizadas
const orderDuration = new Trend('order_response_time_ms');
const productsDuration = new Trend('products_response_time_ms');
const failureRate = new Rate('custom_failure_rate');
const successfulOrders = new Counter('orders_completed_count');

// URL base del ambiente desplegado en Cloud (o variable de entorno TARGET_URL)
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export const options = {
  // Escenario obligatorio E14:
  // Rampa de 0 a 50 usuarios virtuales sostenida durante 5 minutos como mínimo
  stages: [
    { duration: '30s', target: 20 }, // Rampa de subida inicial
    { duration: '1m', target: 50 },  // Rampa hasta 50 VUs
    { duration: '5m', target: 50 },  // Rampa sostenida en 50 VUs durante 5 minutos
    { duration: '30s', target: 0 },  // Rampa de bajada gradual
  ],
  thresholds: {
    // Criterios de aceptación / Quality Gates de rendimiento:
    http_req_duration: ['p(95)<1500', 'avg<800'], // P95 < 1500ms y Promedio < 800ms
    http_req_failed: ['rate<0.02'],                // Tasa de error < 2%
    custom_failure_rate: ['rate<0.02'],
  },
};

export function setup() {
  // Obtener Token de autenticación inicial antes de iniciar la rampa de usuarios
  const loginPayload = JSON.stringify({
    email: 'admin@ecommerce.com',
    password: 'password123',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, params);
  check(res, {
    'Setup: Login admin exitoso (200)': (r) => r.status === 200,
  });

  const body = JSON.parse(res.body);
  return { token: body.data.token };
}

export default function (data) {
  const headersWithAuth = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // ==============================================================
  // ENDPOINT CRÍTICO 1: GET /api/products (Consulta masiva de catálogo)
  // ==============================================================
  const resProducts = http.get(`${BASE_URL}/api/products`, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'GET_Products' },
  });

  productsDuration.add(resProducts.timings.duration);

  const checkProducts = check(resProducts, {
    'Products: Status 200': (r) => r.status === 200,
    'Products: Tiempo de respuesta < 800ms': (r) => r.timings.duration < 800,
    'Products: Contiene catalogo': (r) => r.body.includes('LAP-001'),
  });

  if (!checkProducts) {
    failureRate.add(1);
  } else {
    failureRate.add(0);
  }

  sleep(1); // Tiempo de descanso entre interacciones del usuario virtual

  // ==============================================================
  // ENDPOINT CRÍTICO 2: POST /api/orders (Creación transaccional de órdenes)
  // ==============================================================
  const orderPayload = JSON.stringify({
    items: [
      {
        productId: 'prod-2',
        quantity: 1,
      },
    ],
  });

  const resOrder = http.post(`${BASE_URL}/api/orders`, orderPayload, {
    headers: headersWithAuth,
    tags: { name: 'POST_Orders' },
  });

  orderDuration.add(resOrder.timings.duration);

  const checkOrder = check(resOrder, {
    'Order: Status 201': (r) => r.status === 201,
    'Order: Tiempo de respuesta < 1200ms': (r) => r.timings.duration < 1200,
    'Order: Orden procesada': (r) => r.body.includes('PENDING'),
  });

  if (!checkOrder) {
    failureRate.add(1);
  } else {
    failureRate.add(0);
    successfulOrders.add(1);
  }

  sleep(1);
}

export function teardown() {
  console.log('[TEARDOWN] Prueba de carga k6 finalizada satisfactoriamente.');
}
