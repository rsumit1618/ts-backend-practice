import express from "express";
import { UserRepository } from "./repositories/UserRepository.js";
import { UserService } from "./services/UserService.js";
import { UserController } from "./controllers/UserController.js";

const app = express();

app.use(express.json());

const PORT = 3000;

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

app.get("/", (req, res) => {
  res.send("Backend Server Running");
});

function toHttpError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";

  if (message.toLowerCase().includes("not found")) {
    return { status: 404, message };
  }

  if (
    message.toLowerCase().includes("required") ||
    message.toLowerCase().includes("required to update") ||
    message.toLowerCase().includes("id is required")
  ) {
    return { status: 400, message };
  }

  return { status: 500, message };
}

app.get("/users", async (req, res) => {
  try {
    const users = await userController.list();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ error: message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const newUser = await userController.create(name, email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ error: message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await userController.getOne(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ error: message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { name, email } = req.body ?? {};
    const updated = await userController.update(req.params.id, { name, email });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ error: message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const result = await userController.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

