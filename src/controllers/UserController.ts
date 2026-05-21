import { UserService } from "../services/UserService.js";

export class UserController {

  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(): Promise<void> {

    const user = await this.userService.registerUser(
      "Alex",
      "alex@gmail.com"
    );

    console.log("User Created:");

    console.log(user);
  }

  async getAllUsers(): Promise<void> {

    const users = await this.userService.getAllUsers();

    console.log("All Users:");

    console.log(users);
  }
}