const productRoutes = require('../routes/Product/product.route.js');
const userRoutes = require('./user/user.route.js');
const orderRoutes = require('./order/order.route.js');
const weatherRoutes = require('./weather/weather.route.js');

function routes(app) {
  app.use('/api/product', productRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/order', orderRoutes);
  app.use('/api/weather', weatherRoutes);
}

module.exports = routes;