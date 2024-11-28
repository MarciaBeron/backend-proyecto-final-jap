const express = require("express");
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const puerto = 3000;
const SECRET_KEY = 'clave-secreta-para-el-token';


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'proyecto-final-jap')));

const users = [
    { id: 1, username: 'usuario@ejemplo.com', password: '123456' }
];

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


app.get('/cats/cat.json', authorize, (req, res) => {
    res.sendFile(path.join(__dirname, "data", "cats", "cat.json"));
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