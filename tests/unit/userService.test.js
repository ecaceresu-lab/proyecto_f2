const userService = require('../../src/services/userService');
const db = require('../../src/data/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('E10: Pruebas Unitarias - UserService (con Mocks y Aislamiento)', () => {
  beforeEach(() => {
    db.reset();
    jest.restoreAllMocks();
  });

  describe('Registro de Usuarios', () => {
    test('1. Debe registrar un usuario exitosamente', () => {
      const user = userService.register({
        name: 'Carlos Gomez',
        email: 'carlos@demo.com',
        password: 'Password123!'
      });

      expect(user).toBeDefined();
      expect(user.id).toBe('usr-2');
      expect(user.email).toBe('carlos@demo.com');
      expect(user.role).toBe('customer');
      expect(user.passwordHash).toBeUndefined(); // No debe exponer el hash
    });

    test('2. Debe rechazar registro si faltan campos obligatorios', () => {
      expect(() => {
        userService.register({ name: 'Carlos' });
      }).toThrow('Todos los campos son obligatorios');
    });

    test('3. Debe rechazar registro con correo duplicado (case-insensitive)', () => {
      expect(() => {
        userService.register({
          name: 'Otro Admin',
          email: 'ADMIN@ecommerce.com',
          password: 'Pass'
        });
      }).toThrow('El correo electrónico ya está registrado');
    });

    test('4. (Uso de Dobles de Prueba / Mock) Debe aislar bcrypt.hashSync con un mock', () => {
      // Mock de función criptográfica externa para acelerar y aislar la prueba unitaria
      const hashSpy = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('$2a$mockedHashValue');

      const user = userService.register({
        name: 'User Mocked',
        email: 'mocked@demo.com',
        password: 'SecretPassword'
      });

      expect(hashSpy).toHaveBeenCalled();
      const savedUser = db.users.find(u => u.email === 'mocked@demo.com');
      expect(savedUser.passwordHash).toBe('$2a$mockedHashValue');
    });
  });

  describe('Login y Autenticación', () => {
    test('5. Debe autenticar usuario correctamente y retornar JWT', () => {
      const res = userService.login({
        email: 'admin@ecommerce.com',
        password: 'password123'
      });

      expect(res.token).toBeDefined();
      expect(res.user.email).toBe('admin@ecommerce.com');
      expect(res.user.role).toBe('admin');
    });

    test('6. Debe rechazar login con email no existente', () => {
      expect(() => {
        userService.login({ email: 'inexistente@correo.com', password: '123' });
      }).toThrow('Credenciales incorrectas');
    });

    test('7. Debe rechazar login con contraseña equivocada', () => {
      expect(() => {
        userService.login({ email: 'admin@ecommerce.com', password: 'badpassword' });
      }).toThrow('Credenciales incorrectas');
    });

    test('8. Debe fallar si no se envían parámetros de login', () => {
      expect(() => {
        userService.login({});
      }).toThrow('Debe proporcionar email y password');
    });

    test('9. (Uso de Dobles de Prueba / Stub) Debe simular jwt.sign con token específico', () => {
      const jwtSpy = jest.spyOn(jwt, 'sign').mockReturnValue('mocked.jwt.token');

      const res = userService.login({
        email: 'admin@ecommerce.com',
        password: 'password123'
      });

      expect(jwtSpy).toHaveBeenCalled();
      expect(res.token).toBe('mocked.jwt.token');
    });
  });

  describe('Búsqueda por ID', () => {
    test('10. Debe retornar el usuario si existe por su ID', () => {
      const user = userService.findById('usr-1');
      expect(user).not.toBeNull();
      expect(user.name).toBe('Administrador Demo');
    });

    test('11. Debe retornar null si el usuario no existe', () => {
      const user = userService.findById('usr-999');
      expect(user).toBeNull();
    });
  });
});
