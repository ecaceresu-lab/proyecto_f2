const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[SERVER] Orders & Products API corriendo exitosamente en el puerto ${PORT}`);
  console.log(`[HEALTH] Healthcheck disponible en http://localhost:${PORT}/api/health`);
});
