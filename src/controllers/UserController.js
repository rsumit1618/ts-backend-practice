import { UserService } from "../services/UserService.js";
export class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async createUser() {
        const user = await this.userService.registerUser("Alex", "alex@gmail.com");
        console.log("User Created:");
        console.log(user);
    }
    async getAllUsers() {
        const users = await this.userService.getAllUsers();
        console.log("All Users:");
        console.log(users);
    }
}
