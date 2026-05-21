import { UserService } from "./services/UserService.js";
import { AdminService } from "./services/AdminService.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { UserController } from "./controllers/UserController.js";
async function main() {
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);
    const adminService = new AdminService(userRepository);
    const userController = new UserController(userService);
    await userController.createUser();
    await userController.getAllUsers();
    console.log("All Users");
    await adminService.showAdminServices();
}
main().catch((error) => {
    console.error("App Error:", error);
});
