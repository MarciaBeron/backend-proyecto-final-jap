const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const mysql = require("mysql2/promise");
const puerto = 3000;
const SECRET_KEY = 'clave-secreta-para-el-token';
const path = require('path');



app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'proyecto-final-jap')));


let db;

(async () => {
    try {
        // Usamos mysql.createConnection con await
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '46545345',
            database: 'ecommerce'
        });
        console.log("Conexión a la base de datos establecida.");
    } catch (err) {
        console.error("Error de conexión a la base de datos:", err);
    }
})();


const users = [
    { id: 1, username: 'usuario@ejemplo.com', password: '123456' }
];

// Middleware de autorización con JWT
const authorize = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token inválido o expirado:', error.message);
        return res.status(403).json({ message: 'Token inválido.' });
    }
};

app.post('/cart', authorize, async (req, res) => {
    const { products } = req.body;
    const user_id = req.user.id;  // Obtiene el user_id desde el token JWT

    // Validar datos recibidos
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Datos inválidos: se requiere una lista de productos.' });
    }

    let connection;

    try {
        connection = db;  // Usar la conexión ya establecida (no crear una nueva)

        // Iniciar una transacción
        await connection.beginTransaction();

        // Crear un nuevo carrito para el usuario
        const [cartResult] = await connection.execute(
            'INSERT INTO user_carts (user_id) VALUES (?)',
            [user_id]
        );

        const cart_id = cartResult.insertId;

        // Insertar productos en la tabla cart_products
        const productInsertions = products.map(product => {
            const { product_id, count, unitCost, currency, image } = product;

            return connection.execute(
                'INSERT INTO cart_products (id, product_id, count, unitCost, currency, image) VALUES (?, ?, ?, ?, ?, ?)',
                [cart_id, product_id, count, unitCost, currency, image]
            );
        });

        await Promise.all(productInsertions);

        // Confirmar la transacción
        await connection.commit();

        res.status(201).json({ message: 'Carrito guardado exitosamente.', cart_id });

    } catch (error) {
        console.error('Error guardando el carrito:', error.message);

        if (connection) {
            // Revertir la transacción en caso de error
            await connection.rollback();
        }

        res.status(500).json({ message: 'Error guardando el carrito.' });
    } 
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Por favor ingrese el usuario y la contraseña.' });
    }

    const user = users.find(u => u.username === username);
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
});


app.get('/cats/cat.json', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "cats", "cat.json"));
});

app.get('/localities.json', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "localities.json"));
});

app.get('/sell/publish.json', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "sell", "publish.json"));
});

app.get('/cats_products/:file', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "cats_products", req.params.file));
});

app.get('/products/:file', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "products", req.params.file));
});

app.get('/products_comments/:file', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "products_comments", req.params.file));
});

app.get('/user_cart/:file', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "user_cart", req.params.file));
});

app.get('/cart/buy.json', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "cart", "buy.json"));
});

app.listen(puerto, () => {
    console.log(`Servidor iniciado.`);
});