console.log("Cargo Script");

const socket = io(); // Conectar al servidor

// Manejar actualización de productos
socket.on("updateProducts", (products) => {
  const productList = document.getElementById("product-list");
  productList.innerHTML = ""; // Limpia la list

  products.forEach((product) => {
    const li = document.createElement("li");
    li.className = "product-item";

    
    const title = document.createElement("h2");
    title.textContent = product.title;

    const description = document.createElement("p");
    description.textContent = `Descripción: ${product.description}`;

    const price = document.createElement("p");
    price.textContent = `Precio: $${product.price}`;

    const code = document.createElement("p");
    code.textContent = `Código: ${product.code}`;

    const stock = document.createElement("p");
    stock.textContent = `Stock: ${product.stock}`;

    const status = document.createElement("p");
    status.textContent = `Estado: ${product.status ? 'Activo' : 'Inactivo'}`;

    const category = document.createElement("p");
    category.textContent = `Categoría: ${product.category}`;

    // Crear botón de eliminar
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.className = "delete-button";
    deleteButton.setAttribute("data-id", product.id);
    deleteButton.addEventListener("click", () => deleteProduct(product.id));

    // Agregar todos los elementos al <li>
    li.appendChild(title);
    li.appendChild(description);
    li.appendChild(price);
    li.appendChild(code);
    li.appendChild(stock);
    li.appendChild(status);
    li.appendChild(category);
    li.appendChild(deleteButton);

    // Agregar <li> a la lista
    productList.appendChild(li);
  });
});

// Enviar nuevo producto
document.getElementById("product-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const newProduct = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    price: parseFloat(document.getElementById("price").value),
    code: document.getElementById("code").value,
    stock: parseInt(document.getElementById("stock").value),
    status: document.getElementById("status").checked,
    category: document.getElementById("category").value,
  };

  fetch('/realtimeproducts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newProduct)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('Error al agregar producto:', data.error);
    } else {
      console.log('Producto agregado correctamente');
          }
  })
  .catch(error => {
    console.error('Error en la solicitud:', error);
  });
});


// Función para eliminar producto
function deleteProduct(id) {
  fetch(`/api/products/${id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    if (data.payload) {
      console.log ('Producto eliminado correctamente')
    } else {
      console.error('Error al eliminar el producto:', data.error);
    }
  });
}