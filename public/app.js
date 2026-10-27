let authToken = '';
let cart = [];
let productsCache = [];

async function init() {
  try {
    // 1. Obtener token de demo para interacciones en vivo
    const authRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ecommerce.com', password: 'password123' })
    });
    const authData = await authRes.json();
    if (authData.success) {
      authToken = authData.data.token;
    }

    // 2. Cargar productos y metricas
    await cargarProductos();
    await cargarMetricas();
  } catch (err) {
    console.error('Error inicializando dashboard:', err);
  }
}

async function cargarProductos() {
  try {
    const res = await fetch('/api/products');
    const result = await res.json();
    if (result.success) {
      productsCache = result.data;
      renderProductos(result.data);
      document.getElementById('product-count').textContent = `${result.data.length} productos en stock`;
    }
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
}

function renderProductos(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = products.map(p => `
    <div class="product-item">
      <div>
        <span class="product-sku">${p.sku}</span>
        <h3>${p.name}</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${p.description}</p>
      </div>
      <div>
        <div class="product-price">Q${p.price.toFixed(2)}</div>
        <div class="product-stock">Stock disponible: <strong>${p.stock}</strong></div>
        <button class="btn-buy" onclick="agregarAlCarrito('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''}>
          ${p.stock > 0 ? '+ Agregar al Pedido' : 'Agotado'}
        </button>
      </div>
    </div>
  `).join('');
}

function agregarAlCarrito(productId) {
  const product = productsCache.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity++;
    } else {
      alert(`No hay más stock disponible para ${product.name}`);
      return;
    }
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCarrito();
}

function renderCarrito() {
  const container = document.getElementById('cart-container');
  const btn = document.getElementById('btn-checkout');

  if (cart.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 35px;">El carrito está vacío. Haz clic en "Agregar" en algún producto.</p>';
    btn.disabled = true;
    document.getElementById('cart-subtotal').textContent = 'Q0.00';
    document.getElementById('cart-tax').textContent = 'Q0.00';
    document.getElementById('cart-total').textContent = 'Q0.00';
    return;
  }

  btn.disabled = false;
  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="cart-item-row">
        <div>
          <strong>${item.name}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Q${item.price.toFixed(2)} x ${item.quantity}</div>
        </div>
        <div>
          <span>Q${itemTotal.toFixed(2)}</span>
          <button style="background: none; border: none; color: #ef4444; margin-left: 8px; cursor: pointer;" onclick="eliminarDelCarrito('${item.productId}')">✕</button>
        </div>
      </div>
    `;
  }).join('');

  const tax = Math.round(subtotal * 0.12 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  document.getElementById('cart-subtotal').textContent = `Q${subtotal.toFixed(2)}`;
  document.getElementById('cart-tax').textContent = `Q${tax.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `Q${total.toFixed(2)}`;
}

function eliminarDelCarrito(productId) {
  cart = cart.filter(item => item.productId !== productId);
  renderCarrito();
}

async function procesarOrden() {
  const btn = document.getElementById('btn-checkout');
  btn.disabled = true;
  btn.textContent = 'Procesando en API...';

  try {
    const payload = {
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(`🎉 ¡Orden ${data.data.id} creada con éxito!\nTotal facturado: Q${data.data.total}`);
      cart = [];
      renderCarrito();
      await cargarProductos();
      await cargarMetricas();
    } else {
      alert(`Error al generar orden: ${data.error}`);
    }
  } catch (err) {
    alert('Error al comunicarse con la API: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generar Pedido (POST /api/orders)';
  }
}

async function cargarMetricas() {
  try {
    const res = await fetch('/api/orders/metrics/summary', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById('metric-orders').textContent = result.data.totalOrders;
      document.getElementById('metric-revenue').textContent = `Q${result.data.totalRevenue.toFixed(2)}`;
    }
  } catch (err) {
    console.error('Error cargando metricas:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
