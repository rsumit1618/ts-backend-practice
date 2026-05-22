import type { IUser } from "../interfaces/IUser.js";
import { UserRepository } from "../repositories/UserRepository.js";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(name: string, email: string): Promise<IUser> {
    if (!name || !email) {
      throw new Error("name and email are required");
    }

    const user: IUser = {
      id: Date.now().toString(),
      name,
      email,
    };

    return await this.userRepository.create(user);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<IUser> {
    if (!id) throw new Error("id is required");

    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUser(
    id: string,
    update: { name?: string; email?: string }
  ): Promise<IUser> {
    if (!id) throw new Error("id is required");

    if (!update?.name && !update?.email) {
      throw new Error("name or email is required to update");
    }

    const existing = await this.userRepository.findById(id);
    if (!existing) throw new Error("User not found");

    const updated: IUser = {
      ...existing,
      name: update.name ?? existing.name,
      email: update.email ?? existing.email,
    };

    await this.userRepository.update(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<{ deleted: true; id: string }> {
    if (!id) throw new Error("id is required");

    const existing = await this.userRepository.findById(id);
    if (!existing) throw new Error("User not found");

    await this.userRepository.delete(id);
    return { deleted: true, id };
  }
}

