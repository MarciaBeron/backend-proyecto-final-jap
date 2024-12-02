const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '46545345',
    database: 'ecommerce'
};

// Crear conexión con la base de datos
const loadData = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Conexión a la base de datos establecida.");

        // Cargar categorías desde la carpeta de categorías
        const categoriesDir = path.join(__dirname, 'data', 'cats_products');
        const categoriesFiles = fs.readdirSync(categoriesDir).filter(file => file.endsWith('.json'));
        for (const file of categoriesFiles) {
            const categoryData = JSON.parse(fs.readFileSync(path.join(categoriesDir, file), 'utf-8'));
            await loadCategory(connection, categoryData);
        }

        // Cargar productos desde la carpeta de productos
        const productsDir = path.join(__dirname, 'data', 'products');
        const productsFiles = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));
        for (const file of productsFiles) {
            const productData = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf-8'));
            await loadProduct(connection, productData);
        }

        // Cargar comentarios desde la carpeta de comentarios
        const commentsDir = path.join(__dirname, 'data', 'products_comments');
        const commentsFiles = fs.readdirSync(commentsDir).filter(file => file.endsWith('.json'));
        for (const file of commentsFiles) {
            const commentData = JSON.parse(fs.readFileSync(path.join(commentsDir, file), 'utf-8'));
            await loadComment(connection, commentData);
        }

        console.log("Datos cargados con éxito.");
    } catch (error) {
        console.error('Error cargando los datos:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// Función para cargar una categoría
const loadCategory = async (connection, data) => {
    const { catID, catName, products } = data;

    // Verificar si el campo 'id' de la categoría existe
    if (!catID || !catName) {
        console.error(`La categoría "${catName}" no tiene un 'id' válido.`);
        return;
    }

    // Validar y reemplazar valores undefined con null si es necesario
    const validName = catName || null;
    const validDescription = data.description || null;
    const validImgSrc = data.img_src || null;

    try {
        // Insertar categoría con el 'id' del JSON
        await connection.execute(
            'INSERT INTO categories (catID, name, description, img_src) VALUES (?, ?, ?, ?)',
            [catID, validName, validDescription, validImgSrc]
        );
        console.log(`Categoría ${validName} cargada con éxito.`);
    } catch (error) {
        console.error('Error insertando categoría:', error.message);
    }
};

// Función para cargar un producto
const loadProduct = async (connection, data) => {
    const { id, name, description, cost, currency, image, category, images } = data;

    // Validar que el 'id' esté presente
    if (!id) {
        console.error("El producto no tiene un 'id' válido.");
        return;
    }

    // Validar que el 'category' esté presente
    if (!category) {
        console.error("El producto no tiene una categoría válida.");
        return;
    }

    // Obtener el category_id de la base de datos (esto asume que la categoría existe en la tabla 'categories')
    let [categoryResult] = await connection.execute(
        'SELECT catID FROM categories WHERE name = ?',
        [category]
    );

    if (categoryResult.length === 0) {
        console.error(`La categoría "${category}" no existe en la base de datos.`);
        return;
    }

    const categoryId = categoryResult[0].id;

    // Insertar producto
    try {
        await connection.execute(
            'INSERT INTO products (id, name, description, cost, currency, image, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name || null, description || null, cost || null, currency || null, image || null, categoryId || null]
        );
        console.log(`Producto ${name} cargado con éxito.`);
    } catch (error) {
        console.error('Error insertando producto:', error.message);
    }
};

// Función para cargar un comentario
const loadComment = async (connection, data) => {
    // Validación por cada comentario
    for (const comment of data) {
        const { product, user, score, description, dateTime } = comment;

        // Validar que el 'product' y 'user' existan
        if (!product || !user) {
            console.error("El comentario no tiene un 'product' o 'user' válido.");
            continue;
        }

        // Insertar comentario
        try {
            await connection.execute(
                'INSERT INTO comments (product_id, user, score, description, date_time) VALUES (?, ?, ?, ?, ?)',
                [product, user, score || null, description || null, dateTime || null]
            );
            console.log(`Comentario para el producto ${product} cargado con éxito.`);
        } catch (error) {
            console.error('Error insertando comentario:', error.message);
        }
    }
};

// Ejecutar carga de datos
loadData();





