/**
 * IUser - TypeScript interface defining the User data contract
 * 
 * This interface ensures type safety across the application.
 * Any object claiming to be a User must match this shape.
 */
export interface IUser {
  id: string;
  name: string;
  email: string;
}
