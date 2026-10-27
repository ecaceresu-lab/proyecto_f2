const db = require('../data/db');

class ProductService {
  getAll({ category, minPrice, maxPrice, search } = {}) {
    let list = db.products.filter(p => p.active);

    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice !== undefined && minPrice !== null) {
      list = list.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      list = list.filter(p => p.price <= Number(maxPrice));
    }

    if (search) {
      const term = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }

    return list;
  }

  getById(id) {
    const product = db.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  create({ sku, name, description, price, stock, category }) {
    if (!sku || !name || price === undefined || stock === undefined) {
      throw new Error('Campos obligatorios faltantes: sku, name, price, stock');
    }

    if (Number(price) < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (Number(stock) < 0 || !Number.isInteger(Number(stock))) {
      throw new Error('El stock debe ser un entero no negativo');
    }

    const existing = db.products.find(p => p.sku.toUpperCase() === sku.toUpperCase());
    if (existing) {
      throw new Error(`Ya existe un producto con el SKU ${sku}`);
    }

    const newProduct = {
      id: 'prod-' + (db.products.length + 1),
      sku: sku.toUpperCase(),
      name,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      category: category || 'General',
      active: true
    };

    db.products.push(newProduct);
    return newProduct;
  }

  update(id, data) {
    const product = this.getById(id);

    if (data.price !== undefined) {
      if (Number(data.price) < 0) throw new Error('El precio no puede ser negativo');
      product.price = Number(data.price);
    }

    if (data.stock !== undefined) {
      if (Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) {
        throw new Error('El stock debe ser un entero no negativo');
      }
      product.stock = Number(data.stock);
    }

    if (data.name) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.category) product.category = data.category;
    if (data.active !== undefined) product.active = Boolean(data.active);

    return product;
  }

  delete(id) {
    const product = this.getById(id);
    product.active = false; // Soft delete
    return { success: true, message: `Producto ${id} desactivado correctamente` };
  }
}

module.exports = new ProductService();
