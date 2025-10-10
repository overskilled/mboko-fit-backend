import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<any>;
    remove(id: string): Promise<void>;
    getProfile(userId: string): Promise<any>;
}
