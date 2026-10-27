const db = require('../data/db');
const productService = require('./productService');

class OrderService {
  getAll({ userId, status } = {}) {
    let list = [...db.orders];

    if (userId) {
      list = list.filter(o => o.userId === userId);
    }

    if (status) {
      list = list.filter(o => o.status.toUpperCase() === status.toUpperCase());
    }

    return list;
  }

  getById(id) {
    const order = db.orders.find(o => o.id === id);
    if (!order) {
      throw new Error(`Orden con ID ${id} no encontrada`);
    }
    return order;
  }

  createOrder({ userId, items }) {
    if (!userId) {
      throw new Error('Debe especificar un usuario para la orden');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('La orden debe contener al menos un producto');
    }

    let subtotal = 0;
    const processedItems = [];

    // Validar existencias y calcular subtotales
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error('Cada item debe contener productId y una cantidad mayor a 0');
      }

      const product = productService.getById(item.productId);

      if (!product.active) {
        throw new Error(`El producto "${product.name}" no está disponible para la venta`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto "${product.name}". Solicitado: ${item.quantity}, Disponible: ${product.stock}`);
      }

      const itemSubtotal = Math.round(product.price * item.quantity * 100) / 100;
      subtotal += itemSubtotal;

      processedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Descontar stock
    for (const item of items) {
      const product = productService.getById(item.productId);
      product.stock -= item.quantity;
    }

    const TAX_RATE = 0.12; // 12% IVA
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const newOrder = {
      id: 'ord-' + (1000 + db.orders.length + 1),
      userId,
      items: processedItems,
      subtotal,
      tax,
      total,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    return newOrder;
  }

  updateStatus(id, newStatus) {
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const statusUpper = newStatus.toUpperCase();

    if (!validStatuses.includes(statusUpper)) {
      throw new Error(`Estado inválido. Estados permitidos: ${validStatuses.join(', ')}`);
    }

    const order = this.getById(id);

    if (order.status === 'CANCELLED') {
      throw new Error('No se puede cambiar el estado de una orden cancelada');
    }

    // Si se cancela, reponer stock
    if (statusUpper === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        try {
          const product = productService.getById(item.productId);
          product.stock += item.quantity;
        } catch (e) {
          // Producto eliminado/no encontrado
        }
      }
    }

    order.status = statusUpper;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  calculateSummary() {
    const totalOrders = db.orders.length;
    const revenue = db.orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((acc, curr) => acc + curr.total, 0);

    return {
      totalOrders,
      totalRevenue: Math.round(revenue * 100) / 100,
      activeProducts: db.products.filter(p => p.active).length
    };
  }
}

module.exports = new OrderService();
