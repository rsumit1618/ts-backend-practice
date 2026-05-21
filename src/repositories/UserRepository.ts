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
    
}
