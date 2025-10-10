import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
interface AuthInput {
    username: string;
    password: string;
}
interface SignUpInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}
interface SignInData {
    userId: string;
    username: string;
}
export interface AuthResult {
    accessToken: string;
    userId: string;
    username: string;
    user: any;
}
export declare class AuthService {
    private jwtService;
    private prismaService;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    signUp(signUpInput: SignUpInput): Promise<AuthResult>;
    validateUser(input: AuthInput): Promise<SignInData | null>;
    authenticate(input: AuthInput): Promise<AuthResult>;
    signIn(user: SignInData): Promise<AuthResult>;
}
export {};
