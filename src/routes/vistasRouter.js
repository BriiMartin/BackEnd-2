const { Router } = require("express");
const router = Router();
const ProductManager = require("../dao/ProductManager");

ProductManager.path = "src/data/Products.json";

router.get("/products", async (req, res) => {
  let products = await ProductManager.getProducts();
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("index", {
    products,
  });
});

router.get("/realtimeproducts", async (req, res) => {
  let products = await ProductManager.getProducts();
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("realTimeProducts", {
    products,
  });
});

router.post("/realtimeproducts", async (req, res) => {
  let {
    id,
    title,
    description,
    price,
    // thumbnails,
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
    // !thumbnails ||
    // !Array.isArray(thumbnails) ||
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
  console.log("Products:", products);
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
    //Agregar el nuevo producto
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

    // Envio actualizacion de productos al socket
    const updateProducts = await ProductManager.getProducts();
    req.io.emit("updateProducts", updateProducts);

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


module.exports = { router };
