import { FitnessGoal } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
    fitnessGoal?: FitnessGoal;
    age?: number;
    weight?: number;
    height?: number;
}
