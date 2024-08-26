const fs = require("fs");
const path = require("path");

class ProductManager {
  static path;

  static async getProducts() {
    //verifico si el arhivo existe.
    if (fs.existsSync(this.path)) {
      //Si existe lo retorno
      let products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
      return products;
    }

    //Si no existe el archivo, devuelvo un array vacio
    return [];
  }

  static async addProduct(product = {}) {
    let products = await this.getProducts();
    // Agrego el producto junto con un Id autoincrementable
    let id = 1;
    if (products.length > 0) {
      id = Math.max(...products.map((d) => d.id)) + 1;
    }
    let newProduct = {
      id,
      ...product,
    };
    products.push(newProduct);

    // Guardo en un Archivo Json
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));

    return newProduct;
  }

  static async updateProduct(id, aModificar = {}) {
    let products = await this.getProducts();
    let indiceProduct = products.findIndex((p) => p.id === id);
    if (indiceProduct === -1) {
      throw new Error(`Error: no existe id ${id}`);
    }
    products[indiceProduct] = {
      ...products[indiceProduct],
      ...aModificar,
      id,
    };
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));
    return products[indiceProduct];
  }

  static async deleteProduct(id) {
    let products = await this.getProducts();
    let indiceProduct = products.findIndex((h) => h.id === id);
    if (indiceProduct === -1) {
      throw new Error(`Error: no existe id ${id}`);
    }
    let cantidad0 = products.length;
    products = products.filter((h) => h.id !== id); // usamos el filtro para eliminar el producto que coincida con el id
    let cantidad1 = products.length;

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));

    return cantidad0 - cantidad1;
  }
}

module.exports = ProductManager;
