import type { IUser } from "../interfaces/IUser.js";
import { UserRepository } from "../repositories/UserRepository.js";

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {   
        this.userRepository = userRepository;
    }

    async registerUser(name : string,email:string): Promise<IUser> {

        const user: IUser = {
            id: Date.now().toString(),
            name,
            email
        };

        return await this.userRepository.create(user);

    }

    async getAllUsers(): Promise<IUser[]> {
        return await this.userRepository.findAll();
    }
}