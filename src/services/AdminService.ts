import { UserService } from "./UserService.js";
import { UserRepository } from "../repositories/UserRepository.js";

export class AdminService extends UserService { 
    constructor(userRepository: UserRepository) {
        super(userRepository);
    }

    async showAdminServices(): Promise<void> {
        console.log("Admin can manage all users");
    }
}