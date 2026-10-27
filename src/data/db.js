class Database {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [
      {
        id: 'usr-1',
        name: 'Administrador Demo',
        email: 'admin@ecommerce.com',
        // password: "password123"
        passwordHash: '$2a$10$wT0X8U3s1e7X7eU7p7C9ue1jF1dG.QZ8lWzJvX9G6gC2qFwY0.n1K',
        role: 'admin'
      }
    ];

    this.products = [
      {
        id: 'prod-1',
        sku: 'LAP-001',
        name: 'Laptop Gamer Pro 16GB',
        description: 'Laptop de alto rendimiento para desarrollo y gaming',
        price: 1250.0,
        stock: 15,
        category: 'Computación',
        active: true
      },
      {
        id: 'prod-2',
        sku: 'MOU-002',
        name: 'Mouse Óptico Ergonómico',
        description: 'Mouse inalámbrico con sensor óptico de alta precisión',
        price: 35.5,
        stock: 50,
        category: 'Accesorios',
        active: true
      },
      {
        id: 'prod-3',
        sku: 'KEY-003',
        name: 'Teclado Mecánico RGB',
        description: 'Teclado switch blue con iluminación customizable',
        price: 89.99,
        stock: 25,
        category: 'Accesorios',
        active: true
      },
      {
        id: 'prod-4',
        sku: 'MON-004',
        name: 'Monitor UltraWide 34"',
        description: 'Monitor IPS 144Hz resolución 3440x1440',
        price: 499.0,
        stock: 8,
        category: 'Monitores',
        active: true
      }
    ];

    this.orders = [
      {
        id: 'ord-1001',
        userId: 'usr-1',
        items: [
          {
            productId: 'prod-2',
            productName: 'Mouse Óptico Ergonómico',
            unitPrice: 35.5,
            quantity: 2,
            subtotal: 71.0
          }
        ],
        subtotal: 71.0,
        tax: 8.52,
        total: 79.52,
        status: 'PAID',
        createdAt: new Date('2026-10-01T10:00:00Z').toISOString()
      }
    ];
  }
}

const db = new Database();

module.exports = db;
