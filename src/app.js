const express = require("express");
const fs = require("fs");
const { Server } = require("socket.io");
const {router:productsRouter} = require("./routes/products.router.js")
const {router:cartsRouter} = require("./routes/carts.router.js");
const {router:vistasRouter} = require("./routes/vistasRouter.js")
const { engine } = require("express-handlebars");
const ProductManager = require("./dao/ProductManager");
const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("./src/public"))

app.engine("handlebars", engine()) // inicializamos el motor
app.set("view engine", "handlebars") // seteamos nuestro motor
app.set("views", "./src/views") // setear la carpeta de vistas

//creo el middle para pasar Io a las rutas.
app.use((req, res, next) => {
  req.io = io;
  next(); 
});

app.use ("/api/products",productsRouter);
app.use ("/api/carts",cartsRouter);
app.use ("/",vistasRouter);

//El servidor se levanta escuchando por el puerto 8080. Segundo argumento es un callback que mustra que el servidor esta arriba.
const serverHTTP = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

const io = new Server(serverHTTP);

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Maneja el productDeleted
  socket.on('productDeleted', async (id) => {
    try {
      await ProductManager.deleteProduct(id);
      let products = await ProductManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });

  // Maneja el nuevoProducto
  socket.on('nuevoProducto', async (newProduct) => {
    try {
      await ProductManager.addProduct(newProduct);
      let products = await ProductManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente Desconectado');
  });
});


