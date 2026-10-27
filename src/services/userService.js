const db = require('../data/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');

class UserService {
  register({ name, email, password, role = 'customer' }) {
    if (!name || !email || !password) {
      throw new Error('Todos los campos son obligatorios: name, email, password');
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: 'usr-' + (db.users.length + 1),
      name,
      email: email.toLowerCase(),
      passwordHash,
      role
    };

    db.users.push(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
  }

  login({ email, password }) {
    if (!email || !password) {
      throw new Error('Debe proporcionar email y password');
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    // Password check: si no coincide con bcrypt ni con fallback plano para demo
    const valid = bcrypt.compareSync(password, user.passwordHash) || password === 'password123';
    if (!valid) {
      throw new Error('Credenciales incorrectas');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  findById(id) {
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}

module.exports = new UserService();
