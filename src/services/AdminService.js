import { UserService } from "./UserService.js";
import { UserRepository } from "../repositories/UserRepository.js";
export class AdminService extends UserService {
    constructor(userRepository) {
        super(userRepository);
    }
    async showAdminServices() {
        console.log("Admin can manage all users");
    }
}
