import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    updateUser(id: string, data: Prisma.UserUpdateInput): Promise<any>;
    createUser(data: Prisma.UserCreateInput): Promise<any>;
    deleteUser(id: string): Promise<void>;
    findAll(): Promise<any[]>;
}
