const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const productsRouter = require('./routes/products');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurar Handlebars
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: false // Deshabilitar el uso de layout por defecto
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para procesar JSON
app.use(express.json());

// Ruta para renderizar la vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const products = JSON.parse(data);
    res.render('realTimeProducts', { products });
  });
});

// Ruta para renderizar la vista home con listado de productos
app.get('/', (req, res) => {
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const products = JSON.parse(data);
    res.render('home', { products });
  });
});

// Configuración de WebSocket
io.on('connection', (socket) => {
  console.log('Cliente Conectado');

  // Emitir lista de productos al cliente al conectar
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const products = JSON.parse(data);
    socket.emit('productList', products);
  });

  // Manejar eventos de WebSocket para agregar y eliminar productos
  socket.on('newProduct', (newProduct) => {
    fs.readFile('productos.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const products = JSON.parse(data);
      const newProductId = uuidv4();
      const productToAdd = {
        id: newProductId,
        name: newProduct.name,
        description: newProduct.description, 
        price: newProduct.price
      };
      products.push(productToAdd);
      fs.writeFile('productos.json', JSON.stringify(products, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        io.emit('productList', products); // Emitir la lista actualizada de productos
      });
    });
  });

  socket.on('deleteProduct', (productId) => {
    fs.readFile('productos.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      let products = JSON.parse(data);
      products = products.filter(product => product.id !== productId);
      fs.writeFile('productos.json', JSON.stringify(products, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        io.emit('productList', products);
      });
    });
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error interno del servidor');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});







