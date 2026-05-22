import type { IUser } from "../interfaces/IUser.js";
import { UserRepository } from "../repositories/UserRepository.js";

/**
 * UserService - Business logic and validation layer
 * 
 * Responsibilities:
 * - Validate user input (format, constraints)
 * - Implement business rules (unique email, etc.)
 * - Orchestrate repository operations
 * - Throw meaningful errors for HTTP layer to handle
 */
export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Validate email format
   * @throws Error if email format is invalid
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  /**
   * Validate name
   * @throws Error if name is invalid
   */
  private validateName(name: string): void {
    if (name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    if (name.trim().length > 100) {
      throw new Error("Name must not exceed 100 characters");
    }
  }

  /**
   * Register a new user
   * @throws Error if validation fails
   */
  async registerUser(name: string, email: string): Promise<IUser> {
    // Input validation
    if (!name || !name.trim()) {
      throw new Error("Name is required");
    }
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }

    this.validateName(name);
    this.validateEmail(email);

    // Business rule: check if email already exists
    const existingUsers = await this.userRepository.findAll();
    if (existingUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already in use");
    }

    // Create user (use UUID in production, Date.now() for demo)
    const user: IUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    return await this.userRepository.create(user);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Get user by ID
   * @throws Error if user not found
   */
  async getUserById(id: string): Promise<IUser> {
    if (!id || !id.trim()) {
      throw new Error("User ID is required");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * Update user details
   * @throws Error if validation fails or user not found
   */
  async updateUser(
    id: string,
    update: { name?: string; email?: string }
  ): Promise<IUser> {
    if (!id || !id.trim()) {
      throw new Error("User ID is required");
    }

    // At least one field must be provided
    if (!update?.name && !update?.email) {
      throw new Error("At least one field (name or email) is required to update");
    }

    // Get existing user
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    // Validate new fields if provided
    if (update.name) {
      this.validateName(update.name);
    }
    if (update.email) {
      this.validateEmail(update.email);
      
      // Check if new email already exists (except for current user)
      const allUsers = await this.userRepository.findAll();
      if (
        allUsers.some(
          (u) =>
            u.id !== id &&
            u.email.toLowerCase() === update.email!.toLowerCase()
        )
      ) {
        throw new Error("Email already in use");
      }
    }

    // Merge updates
    const updated: IUser = {
      ...existing,
      name: update.name ? update.name.trim() : existing.name,
      email: update.email ? update.email.trim().toLowerCase() : existing.email,
    };

    await this.userRepository.update(id, updated);
    return updated;
  }

  /**
   * Delete user
   * @throws Error if user not found
   */
  async deleteUser(id: string): Promise<{ deleted: true; id: string }> {
    if (!id || !id.trim()) {
      throw new Error("User ID is required");
    }

    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
    return { deleted: true, id };
  }
}
