import type { IUser } from "../interfaces/IUser.js";
import { UserService } from "../services/UserService.js";

/**
 * UserController - HTTP Request/Response Handler
 * 
 * Responsibilities:
 * - Parse HTTP request data
 * - Delegate to service layer
 * - Format responses
 * 
 * ⚠️ Does NOT contain business logic - that's in the Service layer
 */
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Create a new user
   * Delegates to service.registerUser()
   */
  async create(name: string, email: string): Promise<IUser> {
    return await this.userService.registerUser(name, email);
  }

  /**
   * Get all users
   * Delegates to service.getAllUsers()
   */
  async list(): Promise<IUser[]> {
    return await this.userService.getAllUsers();
  }

  /**
   * Get user by ID
   * Delegates to service.getUserById()
   */
  async getOne(id: string): Promise<IUser> {
    return await this.userService.getUserById(id);
  }

  /**
   * Update user
   * Delegates to service.updateUser()
   */
  async update(
    id: string,
    update: { name?: string; email?: string }
  ): Promise<IUser> {
    return await this.userService.updateUser(id, update);
  }

  /**
   * Delete user
   * Delegates to service.deleteUser()
   */
  async remove(id: string): Promise<{ deleted: true; id: string }> {
    return await this.userService.deleteUser(id);
  }
}
