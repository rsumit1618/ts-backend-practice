import type { IUser } from "../interfaces/IUser.js";
import BaseRepository from "./BaseRepository.js";

export class UserRepository extends BaseRepository<IUser> {
  private users: IUser[] = [];

  async create(user: IUser): Promise<IUser> {
    this.users.push(user);
    return user;
  }

  async findAll(): Promise<IUser[]> {
    return this.users;
  }

  async findById(id: string): Promise<IUser | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async update(id: string, updated: IUser): Promise<void> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return;
    this.users[idx] = updated;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }
}

