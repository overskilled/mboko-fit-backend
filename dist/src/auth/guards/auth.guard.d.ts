import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
export declare class AuthGuard implements CanActivate {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
