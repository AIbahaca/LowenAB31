const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// ✅ MIDDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ ARCHIVOS ESTÁTICOS
app.use(express.static('public'));


// ⚡ CONFIGURACIÓN DE MONGOOSE (ANTI-ERRORES)
mongoose.set('strictQuery', true);

// 🔥 CONEXIÓN A MONGODB (MEJORADA)
async function conectarDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/todos', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1); // Detiene la app si falla la conexión
    }
}


// ✅ SCHEMA Y MODELO
const TodoSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: true
    },
    complete: {
        type: Boolean,
        default: false
    }
});

const Todo = mongoose.model('Todo', TodoSchema);


// 🟢 CREATE
app.post('/add', async (req, res) => {
    try {
        const nuevoTodo = new Todo({
            texto: req.body.texto,
            complete: false
        });

        await nuevoTodo.save();

        console.log('✅ Dato insertado');
        res.redirect('/');

    } catch (err) {
        console.error('❌ Error al insertar:', err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// 🔵 READ
app.get('/getAll', async (req, res) => {
    try {
        const data = await Todo.find({}, 'texto complete');

        res.json({
            success: true,
            data: data
        });

    } catch (err) {
        console.error('🔥 ERROR REAL:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// 🟡 UPDATE
app.get('/complete/:id/:status', async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status === 'true';

        await Todo.findByIdAndUpdate(
            id,
            { $set: { complete: status } }
        );

        console.log('✅ Estado actualizado');
        res.redirect('/');

    } catch (err) {
        console.error('❌ Error al actualizar:', err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// 🔴 DELETE
app.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;

        await Todo.findByIdAndDelete(id);

        console.log('🗑️ Dato eliminado');
        res.redirect('/');

    } catch (err) {
        console.error('❌ Error al eliminar:', err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// 🚀 INICIAR SERVIDOR SOLO DESPUÉS DE CONECTAR A DB
async function iniciarServidor() {
    await conectarDB();

    app.listen(3000, () => {
        console.log('🚀 Servidor listo en http://localhost:3000');
    });
}

iniciarServidor();