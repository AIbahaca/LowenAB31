import express from "express";
import mongoose from "mongoose";

const app = express();

// Middleware
app.use(express.json());

// 🔥 Conexión a MongoDB Atlas
if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

// Modelo
const TodoSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  complete: { type: Boolean, default: false }
});

const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

// 📌 Obtener todas las tareas
app.get("/getAll", async (req, res) => {
  try {
    const data = await Todo.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Agregar tarea
app.post("/add", async (req, res) => {
  try {
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

// 📌 Completar / cambiar estado
app.get("/complete/:id/:estado", async (req, res) => {
  try {
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
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;