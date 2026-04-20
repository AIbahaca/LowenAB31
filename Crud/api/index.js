import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// 🔥 Conexión optimizada (SIN opciones viejas)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// 📦 Modelo
const TodoSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  complete: { type: Boolean, default: false }
});

const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

// 📌 Obtener todas las tareas
app.get("/getAll", async (req, res) => {
  try {
    await connectDB();
    const data = await Todo.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Agregar tarea
app.post("/add", async (req, res) => {
  try {
    await connectDB();
    const todo = new Todo({
      texto: req.body.texto,
      complete: false
    });

    await todo.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Cambiar estado
app.get("/complete/:id/:estado", async (req, res) => {
  try {
    await connectDB();
    await Todo.findByIdAndUpdate(req.params.id, {
      complete: req.params.estado === "true"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Eliminar tarea
app.get("/delete/:id", async (req, res) => {
  try {
    await connectDB();
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;