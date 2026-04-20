import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI no está definido");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const TodoSchema = new mongoose.Schema({
  texto: String,
  complete: Boolean,
});

const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const data = await Todo.find();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      let body = req.body;

      // FIX importante para Vercel
      if (typeof body === "string") {
        body = JSON.parse(body);
      }

      const todo = new Todo({
        texto: body.texto,
        complete: false,
      });

      await todo.save();
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Método no permitido" });

  } catch (error) {
    console.error("ERROR REAL:", error);
    return res.status(500).json({ error: error.message });
  }
}