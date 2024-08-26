const { Router } = require("express");
const ProductManager = require("../dao/ProductManager");

const router = Router();

ProductManager.path = "src/data/Products.json";

router.get("/", async (req, res) => {
  let products = await ProductManager.getProducts();
  console.log
  let { limit } = req.query;
  if (limit) {
    // si llega el valor de limite..
    limit = Number(limit); // transformo ese valor a numero.
    if (isNaN(limit)) {
      // si no es un numero,
      return res.status(400).send("El valor de limit tiene que ser un numero");
    }
  } else {
    limit = products.length;
  }
  let resultado = products.slice(0, limit);
  res.status(200).send(resultado);
});

router.get("/:pid", async (req, res) => {
  let { pid } = req.params;
  id = Number(pid);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id debe ser numerico` });
  }
  let products = await ProductManager.getProducts();
  product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).send(`Producto com Id ${id} not found`);
  }
  res.status(200).send(product);
});

router.post("/", async (req, res) => {
  let {
    id,
    title,
    description,
    price,
    //thumbnails,
    code,
    stock,
    status,
    category,
  } = req.body;
  if (
    id ||
    !title ||
    typeof title !== "string" ||
    !description ||
    typeof description !== "string" ||
    !price ||
    typeof price !== "number" ||
    //!thumbnails ||
    //!Array.isArray(thumbnails) ||
    !code ||
    typeof code !== "string" ||
    !stock ||
    typeof stock !== "number" ||
    !status ||
    typeof status !== "boolean" ||
    !category ||
    typeof category !== "string"
  ) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Parametros invalidos, por favor verifica nuevamente` });
  }
  let products = await ProductManager.getProducts();
  let existe = products.find(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  );
  if (existe) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ya existe un producto con esse code:${code}` });
  }

  try {
    let productNew = await ProductManager.addProduct({
      title,
      description,
      price,
      //thumbnails,
      code,
      stock,
      status,
      category,
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
       req.io.emit("updateProducts", await ProductManager.getProducts());
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
