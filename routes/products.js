const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Para generar IDs únicos

// Ruta raíz GET /api/products
router.get('/', (req, res) => {
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const productos = JSON.parse(data);
    res.json(productos);
  });
});

// Ruta GET /api/products/:pid
router.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const productos = JSON.parse(data);
    const product = productos.find(prod => prod.id === productId);
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
    } else {
      res.json(product);
    }
  });
});

// Ruta POST /api/products
router.post('/', (req, res) => {
  const newProduct = req.body;
  newProduct.id = uuidv4(); // Generar id con uuidv4()

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    let productos = JSON.parse(data);
    productos.push(newProduct);

    fs.writeFile('productos.json', JSON.stringify(productos, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }
      res.status(201).json(newProduct);
    });
  });
});

// Ruta PUT /api/products/:pid
router.put('/:pid', (req, res) => {
  const productId = req.params.pid;
  const updatedProduct = req.body;

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    let productos = JSON.parse(data);
    const index = productos.findIndex(prod => prod.id === productId);
    if (index === -1) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    productos[index] = { ...productos[index], ...updatedProduct };

    fs.writeFile('productos.json', JSON.stringify(productos, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }
      res.json(productos[index]);
    });
  });
});

// Ruta DELETE /api/products/:pid
router.delete('/:pid', (req, res) => {
  const productId = req.params.pid;

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    let productos = JSON.parse(data);
    const index = productos.findIndex(prod => prod.id === productId);
    if (index === -1) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    productos.splice(index, 1);

    fs.writeFile('productos.json', JSON.stringify(productos, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }
      res.json({ message: 'Producto eliminado correctamente' });
    });
  });
});

module.exports = router;

