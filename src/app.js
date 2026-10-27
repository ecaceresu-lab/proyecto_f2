const express = require('express');
const cors = require('cors');

const userService = require('./services/userService');
const productService = require('./services/productService');
const orderService = require('./services/orderService');
const { authenticateToken, requireRole } = require('./middlewares/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ----------------------------------------------------
// Health Check (Monitoreo para Pipelines y Cloud)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Orders & Products E-Commerce API',
    version: '1.0.0'
  });
});

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const user = userService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const result = userService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = userService.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  res.status(200).json({ success: true, data: user });
});

// ----------------------------------------------------
// PRODUCT ENDPOINTS
// ----------------------------------------------------
app.get('/api/products', (req, res) => {
  try {
    const products = productService.getAll(req.query);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = productService.getById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.post('/api/products', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const created = productService.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const updated = productService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const result = productService.delete(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ORDER ENDPOINTS
// ----------------------------------------------------
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    // Si es admin puede ver todas, si es cliente solo las suyas
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    } else if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = orderService.getAll(filter);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/metrics/summary', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const summary = orderService.calculateSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:id', authenticateToken, (req, res) => {
  try {
    const order = orderService.getById(req.params.id);
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'No autorizado para ver esta orden' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const order = orderService.createOrder({
      userId: req.user.id,
      items: req.body.items
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const updated = orderService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Manejo de 404 general
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

module.exports = app;
