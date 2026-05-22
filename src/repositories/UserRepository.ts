import type { IUser } from "../interfaces/IUser.js";
import BaseRepository from "./BaseRepository.js";

/**
 * UserRepository - Data persistence layer
 * 
 * Responsibilities:
 * - CRUD operations on users
 * - Manage data store (currently in-memory array)
 * 
 * In production, replace the in-memory array with:
 * - PostgreSQL: const user = await db.query('SELECT * FROM users WHERE id = $1', [id])
 * - MongoDB: const user = await UsersCollection.findOne({ _id: id })
 * - Redis: const user = await redis.get(`user:${id}`)
 */
export class UserRepository extends BaseRepository<IUser> {
  private users: IUser[] = [];

  /**
   * Create a new user
   */
  async create(user: IUser): Promise<IUser> {
    this.users.push(user);
    return user;
  }

  /**
   * Get all users
   */
  async findAll(): Promise<IUser[]> {
    return this.users;
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  /**
   * Update user
   */
  async update(id: string, updated: IUser): Promise<void> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return;
    this.users[idx] = updated;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }
}
