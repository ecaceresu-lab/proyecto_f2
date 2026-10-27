const productService = require('../../src/services/productService');
const db = require('../../src/data/db');

describe('E10: Pruebas Unitarias - ProductService', () => {
  beforeEach(() => {
    db.reset();
  });

  describe('Consulta de Catálogo y Filtros', () => {
    test('12. Debe retornar todos los productos activos por defecto', () => {
      const products = productService.getAll();
      expect(products.length).toBe(4);
    });

    test('13. Debe filtrar productos por categoría', () => {
      const accessories = productService.getAll({ category: 'Accesorios' });
      expect(accessories.length).toBe(2);
      expect(accessories.every(p => p.category === 'Accesorios')).toBe(true);
    });

    test('14. Debe filtrar productos por rango de precio mínimo y máximo', () => {
      const filtered = productService.getAll({ minPrice: 50, maxPrice: 200 });
      expect(filtered.length).toBe(1);
      expect(filtered[0].sku).toBe('KEY-003');
    });

    test('15. Debe buscar productos por coincidencia de texto en nombre o descripción', () => {
      const results = productService.getAll({ search: 'Gamer' });
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Laptop Gamer');
    });

    test('16. Debe retornar producto por ID si existe', () => {
      const prod = productService.getById('prod-1');
      expect(prod).toBeDefined();
      expect(prod.sku).toBe('LAP-001');
    });

    test('17. Debe lanzar error si se solicita ID no existente', () => {
      expect(() => {
        productService.getById('prod-inexistente');
      }).toThrow('Producto con ID prod-inexistente no encontrado');
    });
  });

  describe('Creación de Productos', () => {
    test('18. Debe crear un producto correctamente', () => {
      const created = productService.create({
        sku: 'HEAD-005',
        name: 'Auriculares Inalámbricos',
        description: 'Cancelación activa de ruido',
        price: 110.0,
        stock: 20,
        category: 'Audio'
      });

      expect(created.id).toBe('prod-5');
      expect(created.sku).toBe('HEAD-005');
      expect(created.stock).toBe(20);
      expect(db.products.length).toBe(5);
    });

    test('19. Debe fallar si faltan campos requeridos en la creación', () => {
      expect(() => {
        productService.create({ name: 'Sin SKU' });
      }).toThrow('Campos obligatorios faltantes');
    });

    test('20. Debe rechazar creación con SKU duplicado', () => {
      expect(() => {
        productService.create({
          sku: 'lap-001',
          name: 'Laptop Duplicada',
          price: 100,
          stock: 5
        });
      }).toThrow('Ya existe un producto con el SKU lap-001');
    });

    test('21. Debe rechazar precio negativo', () => {
      expect(() => {
        productService.create({
          sku: 'NEG-001',
          name: 'Precio Negativo',
          price: -10,
          stock: 5
        });
      }).toThrow('El precio no puede ser negativo');
    });

    test('22. Debe rechazar stock negativo o decimal', () => {
      expect(() => {
        productService.create({
          sku: 'STK-001',
          name: 'Stock Inválido',
          price: 10,
          stock: 3.5
        });
      }).toThrow('El stock debe ser un entero no negativo');
    });
  });

  describe('Actualización y Eliminación de Productos', () => {
    test('23. Debe actualizar precio y stock correctamente', () => {
      const updated = productService.update('prod-2', { price: 39.99, stock: 45 });
      expect(updated.price).toBe(39.99);
      expect(updated.stock).toBe(45);
    });

    test('24. Debe rechazar actualización con precio negativo', () => {
      expect(() => {
        productService.update('prod-2', { price: -5 });
      }).toThrow('El precio no puede ser negativo');
    });

    test('25. Debe realizar soft-delete (marcar como inactivo)', () => {
      const result = productService.delete('prod-1');
      expect(result.success).toBe(true);

      const activeList = productService.getAll();
      expect(activeList.find(p => p.id === 'prod-1')).toBeUndefined();
    });
  });
});
