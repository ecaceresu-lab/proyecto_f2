const orderService = require('../../src/services/orderService');
const productService = require('../../src/services/productService');
const db = require('../../src/data/db');

describe('E10: Pruebas Unitarias - OrderService (con Mocks)', () => {
  beforeEach(() => {
    db.reset();
    jest.restoreAllMocks();
  });

  describe('Creación de Pedidos y Reglas de Negocio', () => {
    test('26. Debe crear una orden con cálculo exacto de subtotal, IVA (12%) y total', () => {
      // Producto 2 cuesta 35.50. Comprando 2 => 71.00 + IVA 8.52 => Total 79.52
      const order = orderService.createOrder({
        userId: 'usr-1',
        items: [{ productId: 'prod-2', quantity: 2 }]
      });

      expect(order).toBeDefined();
      expect(order.id).toBe('ord-1002');
      expect(order.subtotal).toBe(71.0);
      expect(order.tax).toBe(8.52);
      expect(order.total).toBe(79.52);
      expect(order.status).toBe('PENDING');

      // Verificar reducción de stock
      const prod = productService.getById('prod-2');
      expect(prod.stock).toBe(48); // Inicialmente 50 - 2
    });

    test('27. Debe fallar si la orden no especifica usuario', () => {
      expect(() => {
        orderService.createOrder({ items: [{ productId: 'prod-2', quantity: 1 }] });
      }).toThrow('Debe especificar un usuario para la orden');
    });

    test('28. Debe fallar si la lista de items está vacía o no es un arreglo', () => {
      expect(() => {
        orderService.createOrder({ userId: 'usr-1', items: [] });
      }).toThrow('La orden debe contener al menos un producto');
    });

    test('29. Debe rechazar orden si la cantidad solicitada es menor o igual a 0', () => {
      expect(() => {
        orderService.createOrder({
          userId: 'usr-1',
          items: [{ productId: 'prod-2', quantity: 0 }]
        });
      }).toThrow('Cada item debe contener productId y una cantidad mayor a 0');
    });

    test('30. Debe rechazar orden si el stock disponible es insuficiente', () => {
      expect(() => {
        orderService.createOrder({
          userId: 'usr-1',
          items: [{ productId: 'prod-4', quantity: 100 }] // Solo hay 8 en stock
        });
      }).toThrow(/Stock insuficiente/);
    });

    test('31. (Uso de Dobles de Prueba / Spy) Debe aislar dependencia con mock de productService.getById', () => {
      // Stubbing del producto para validar cálculo de orden de forma completamente aislada
      const mockProduct = {
        id: 'prod-fake',
        name: 'Producto Stub',
        price: 100.0,
        stock: 10,
        active: true
      };

      const getByIdSpy = jest.spyOn(productService, 'getById').mockReturnValue(mockProduct);

      const order = orderService.createOrder({
        userId: 'usr-1',
        items: [{ productId: 'prod-fake', quantity: 2 }]
      });

      expect(getByIdSpy).toHaveBeenCalledWith('prod-fake');
      expect(order.subtotal).toBe(200.0);
      expect(order.tax).toBe(24.0); // 12%
      expect(order.total).toBe(224.0);
    });

    test('32. Debe fallar si se intenta ordenar un producto inactivo', () => {
      productService.delete('prod-1'); // Desactivar producto

      expect(() => {
        orderService.createOrder({
          userId: 'usr-1',
          items: [{ productId: 'prod-1', quantity: 1 }]
        });
      }).toThrow(/no está disponible para la venta/);
    });
  });

  describe('Transiciones de Estado de la Orden', () => {
    test('33. Debe actualizar estado de la orden a PAID', () => {
      const updated = orderService.updateStatus('ord-1001', 'PAID');
      expect(updated.status).toBe('PAID');
      expect(updated.updatedAt).toBeDefined();
    });

    test('34. Debe rechazar estado no permitido en la máquina de estados', () => {
      expect(() => {
        orderService.updateStatus('ord-1001', 'ESTADO_INVALIDO');
      }).toThrow(/Estado inválido/);
    });

    test('35. Al cancelar orden, debe devolver el stock reservado de los productos', () => {
      // Crear orden que consume 3 unidades de teclado
      const stockInicial = productService.getById('prod-3').stock; // 25
      const order = orderService.createOrder({
        userId: 'usr-1',
        items: [{ productId: 'prod-3', quantity: 3 }]
      });
      expect(productService.getById('prod-3').stock).toBe(stockInicial - 3);

      // Cancelar la orden
      orderService.updateStatus(order.id, 'CANCELLED');

      // Verificar reposición
      expect(productService.getById('prod-3').stock).toBe(stockInicial);
    });

    test('36. No debe permitir modificar el estado de una orden cancelada', () => {
      orderService.updateStatus('ord-1001', 'CANCELLED');
      expect(() => {
        orderService.updateStatus('ord-1001', 'PAID');
      }).toThrow('No se puede cambiar el estado de una orden cancelada');
    });

    test('37. Debe calcular métricas y resumen de ventas correctamente', () => {
      const summary = orderService.calculateSummary();
      expect(summary.totalOrders).toBe(1);
      expect(summary.totalRevenue).toBe(79.52);
      expect(summary.activeProducts).toBe(4);
    });
  });
});
