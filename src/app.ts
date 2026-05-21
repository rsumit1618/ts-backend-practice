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

app.get("/users", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const newUser = await userService.registerUser(name, email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
