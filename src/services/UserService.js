import { UserRepository } from "../repositories/UserRepository.js";
export class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async registerUser(name, email) {
        const user = {
            id: Date.now().toString(),
            name,
            email
        };
        return await this.userRepository.create(user);
    }
    async getAllUsers() {
        return await this.userRepository.findAll();
    }
}
