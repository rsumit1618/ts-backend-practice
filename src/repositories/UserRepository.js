import BaseRepository from "./BaseRepository.js";
export class UserRepository extends BaseRepository {
    users = [];
    async create(user) {
        this.users.push(user);
        return user;
    }
    async findAll() {
        return this.users;
    }
}
