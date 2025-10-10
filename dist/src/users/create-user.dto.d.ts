import { UserRole, FitnessGoal } from '@prisma/client';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    profileImage?: string;
    fitnessGoal?: FitnessGoal;
    age?: number;
    weight?: number;
    height?: number;
    role?: UserRole;
}
