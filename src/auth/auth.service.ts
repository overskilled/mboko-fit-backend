import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prismaService: PrismaService
    ) { }

    async validateUser(input: AuthInput): Promise<signInData | null> {
        // Try to find user by username or email
        const user = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    { username: input.username },
                    { email: input.username }
                ]
            }
        });

        if (!user) return null;

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) return null;

        return {
            userId: user.id,        // assuming 'id' is PK in Prisma
            username: user.username ?? user.email, // fallback to email if username missing
        };
    }

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validateUser(input);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.signIn(user);
    }

    async signIn(user: signInData): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username,
        };

        const accessToken = await this.jwtService.signAsync(tokenPayload);

        const dbUser = await this.prismaService.user.findUnique({
            where: { id: String(user.userId) },
            include: { profile: true, contacts: true, accounts: true, documents: true, verification: true },
        });

        if (!dbUser) {
            throw new NotFoundException("User not found");
        }

        const { password, ...safeUser } = dbUser;

        return {
            accessToken,
            userId: dbUser.id,
            username: dbUser.username ?? dbUser.email,
            user: safeUser,
        }
    }

}
