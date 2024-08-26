const fs = require("fs");
const path = require("path");

class CartManager {
  static path;

  static async getCarts() {
    try {
      if (fs.existsSync(this.path)) {
         const fileContent = await fs.promises.readFile(this.path, "utf-8");
        if (fileContent.trim() === "") {
          return [];
        }
        return JSON.parse(fileContent);
      } else {
        await fs.promises.writeFile(this.path, JSON.stringify([]));
        return [];
      }
    } catch (error) {
      console.error('Error al leer o parsear el archivo:', error);
      throw new Error('Error al obtener los carritos.');
    }
  }

  static async addProductCart(product = {}) {
    let carts = await this.getCarts();
    // Agrego el producto junto con un Id autoincrementable
    let id = 1;
    if (carts.length > 0) {
      id = Math.max(...carts.map((d) => d.id)) + 1;
    }
    let newProduct = {
      id,
      ...product,
    };
    carts.push(newProduct);

    // Guardo en un Archivo Json
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));

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

module.exports = CartManager;
