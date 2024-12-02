-- Creación de la tabla de usuarios
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de la tabla de categorías
CREATE TABLE categories (
  catID INT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  product_count INT DEFAULT 0,
  img_src VARCHAR(255)
);

-- Creación de la tabla de productos
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  cost INT,
  currency VARCHAR(10),
  sold_count INT DEFAULT 0,
  image VARCHAR(255),
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(catID) ON DELETE CASCADE
);

-- Creación de la tabla de imágenes de productos
CREATE TABLE product_images (
  id INT PRIMARY KEY,
  product_id INT,
  image_url VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Creación de la tabla de comentarios
CREATE TABLE comments (
  product_id INT,
  user VARCHAR(100),
  score INT CHECK (score >= 1 AND score <= 5),
  description TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Creación de la tabla de ítems del carrito
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT CHECK (quantity > 0),
  unit_cost INT,
  currency VARCHAR(10),
  image VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Creación de la tabla de favoritos
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE cart_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  count INT,
  currency VARCHAR(20),
  unitCost INT,
  image VARCHAR(111),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE user_carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);