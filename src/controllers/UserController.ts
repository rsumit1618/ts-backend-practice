import type { IUser } from "../interfaces/IUser.js";
import { UserService } from "../services/UserService.js";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async create(name: string, email: string): Promise<IUser> {
    return await this.userService.registerUser(name, email);
  }

  async list(): Promise<IUser[]> {
    return await this.userService.getAllUsers();
  }

  async getOne(id: string): Promise<IUser> {
    return await this.userService.getUserById(id);
  }

  async update(
    id: string,
    update: { name?: string; email?: string }
  ): Promise<IUser> {
    return await this.userService.updateUser(id, update);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    return await this.userService.deleteUser(id);
  }
}

