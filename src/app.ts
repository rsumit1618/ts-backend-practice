import express from "express";
import { UserRepository } from "./repositories/UserRepository.js";
import { UserService } from "./services/UserService.js";
import { UserController } from "./controllers/UserController.js";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware
 */
app.use(express.json());

// Security headers (production-ready)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Request logging (production-ready)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// CORS (production-ready)
app.use((req, res, next) => {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin || "")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

/**
 * Dependency Injection Setup
 */
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/**
 * Error mapping - converts domain errors to HTTP responses
 * 
 * Mapping logic:
 * - "not found" → 404
 * - "required", "invalid", "already" → 400
 * - "conflict" → 409
 * - default → 500
 */
function toHttpError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  const messageLower = message.toLowerCase();

  if (messageLower.includes("not found")) {
    return { status: 404, message };
  }

  if (
    messageLower.includes("required") ||
    messageLower.includes("invalid") ||
    messageLower.includes("already")
  ) {
    return { status: 400, message };
  }

  if (messageLower.includes("conflict")) {
    return { status: 409, message };
  }

  // Log unexpected errors for debugging
  console.error("Unexpected error:", err);
  return { status: 500, message: "Internal server error" };
}

/**
 * Routes
 */

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Server Running",
    timestamp: new Date().toISOString(),
  });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await userController.list();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ success: false, error: message });
  }
});

// Create user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Initial validation (controller-level)
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, error: "name and email are required" });
    }

    // Service handles business logic and detailed validation
    const newUser = await userController.create(name, email);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ success: false, error: message });
  }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await userController.getOne(req.params.id);
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ success: false, error: message });
  }
});

// Update user
app.put("/users/:id", async (req, res) => {
  try {
    const { name, email } = req.body ?? {};
    const updated = await userController.update(req.params.id, {
      name,
      email,
    });
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ success: false, error: message });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const result = await userController.remove(req.params.id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ success: false, error: message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT} | Environment: ${process.env.NODE_ENV || "development"}`
  );
  console.log(`📖 See README.md for API documentation`);
});
