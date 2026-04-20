import mongoose from "mongoose";

// conexión global
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// modelo
const TodoSchema = new mongoose.Schema({
  texto: String,
  complete: Boolean
});

const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

// handler principal (Vercel)
export default async function handler(req, res) {
  try {
    await connectDB();

    // GET /api/getAll
    if (req.method === "GET" && req.url.includes("getAll")) {
      const data = await Todo.find();
      return res.status(200).json(data);
    }

    // POST /api/add
    if (req.method === "POST" && req.url.includes("add")) {
      const { texto } = req.body;
      const todo = new Todo({ texto, complete: false });
      await todo.save();
      return res.status(200).json({ success: true });
    }

    // GET /api/complete/:id/:estado
    if (req.method === "GET" && req.url.includes("complete")) {
      const parts = req.url.split("/");
      const id = parts[3];
      const estado = parts[4];

      await Todo.findByIdAndUpdate(id, {
        complete: estado === "true"
      });

      return res.status(200).json({ success: true });
    }

    // GET /api/delete/:id
    if (req.method === "GET" && req.url.includes("delete")) {
      const parts = req.url.split("/");
      const id = parts[3];

      await Todo.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: "Ruta no encontrada" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}