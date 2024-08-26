const { Router } = require("express");
const fs = require("fs").promises
const CartManager = require("../dao/CartManager.js");

const router = Router();

CartManager.path = "src/data/Carts.json";

router.get("/", async (req, res) => {
  let carts = await CartManager.getCarts();
  let { limit } = req.query;
  if (limit) {
    // si llega el valor de limite..
    limit = Number(limit); // transformo ese valor a numero.
    if (isNaN(limit)) {
      // si no es un numero,
      return res.status(400).send("El valor de limit tiene que ser un numero");
    }
  } else {
    limit = carts.length;
  }
  let resultado = carts.slice(0, limit);
  res.status(200).send(resultado);
});

router.get("/:cid", async (req, res) => {
  let { cid } = req.params;
  id = Number(cid);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id debe ser numerico` });
  }
  let carts = await CartManager.getCarts();
  product = carts.find((p) => p.id === id);
  if (!product) {
    return res.status(404).send(`Producto com Id ${id} not found`);
  }
  res.status(200).send(product);
});

router.post("/", async (req, res) => {
  let {id, products} = req.body;

  if (id || !Array.isArray(products)) {
    return res.status(400).json({ error: "Error: Verifica  si colocaste un Id o 'products' no es un array." });
  }
  // Validar que cada elemento en 'products' sea un objeto
  for (let product of products) {
    if (typeof product !== 'object' || product === null) {
      return res.status(400).json({ error: "Cada elemento de 'products' debe ser un objeto válido." });
    }
  }

  try {
    let productNew = await CartManager.addProductCart({
 products
    });
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ productNew });
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: `${error.message}`,
    });
  }
});


router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const carId = Number(cid);
  const proid = Number(pid);

  // Validar que cid y pid sean numéricos
  if (isNaN(carId) || isNaN(proid)) {
    return res.status(400).json({ error: "cid y pid deben ser numéricos" });
  }

  try {
    // Leer el archivo de carritos
    const data = await fs.readFile(CartManager.path, 'utf8');
    const carts = JSON.parse(data);

    // Buscar el carrito por ID
    const cart = carts.find(c => c.id === carId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Verificar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(p => p.id === proid);

    if (productIndex !== -1) {
      // Producto ya existe en el carrito, incrementar la cantidad
      cart.products[productIndex].quantity = (cart.products[productIndex].quantity || 0) + 1;
    } else {
      // Producto no existe, agregar nuevo producto con quantity 1
      cart.products.push({ id: proid, quantity: 1 });
    }

    // Guardar el carrito actualizado en el archivo
    await fs.writeFile(CartManager.path, JSON.stringify(carts, null, 2));

    // Responder con éxito
    res.status(200).json({ message: "Producto agregado o actualizado en el carrito", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error inesperado en el servidor - Intente más tarde",
      detalle: error.message,
    });
  }
});








router.put("/:pid", async (req, res) => {
  let { pid } = req.params;
  id = Number(pid);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id debe ser numerico` });
  }

  let products;

  try {
    products = await ProductManager.getProducts();
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: `${error.message}`,
    });
  }
  let product = products.find((p) => p.id === id);
  if (!product) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Heroe con id ${id} not found` });
  }

  let aModificar = req.body;

  delete aModificar.id;

  if (aModificar.code) {
    let existe = products.find(
      (p) => p.code.toLowerCase() === aModificar.code.toLowerCase()
    );
    if (existe) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({
          error: `Ya existe otro producto con el codigo ${aModificar.code}`,
        });
    }
  }

  try {
    let productModified = await ProductManager.updateProduct(id, aModificar);
    // res.send(heroe)
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ productModified });
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: `${error.message}`,
    });
  }
});

router.delete("/:pid", async (req, res) => {
  let { pid } = req.params;
  id = Number(pid);
  if (isNaN(id)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ error: `id debe ser numerico` })
  }

  try {
    let resultado = await ProductManager.deleteProduct(id)
    if (resultado > 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: "Producto eliminado...!!!" });
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error al eliminar... :(` })
    }
} catch (error) {
    console.log(error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(
        {
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: `${error.message}`
        }
    )
}



});



module.exports = { router };
