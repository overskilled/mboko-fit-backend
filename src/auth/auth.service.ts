import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async signUp(signUpInput: SignUpInput): Promise<AuthResult> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: signUpInput.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(signUpInput.password, 12);

    // Créer l'utilisateur
    const user = await this.prismaService.user.create({
      data: {
        firstName: signUpInput.firstName,
        lastName: signUpInput.lastName,
        email: signUpInput.email,
        password: hashedPassword,
        phoneNumber: signUpInput.phoneNumber,
        role: 'USER', // Par défaut
      },
      include: {
        preferences: true,
        workouts: true,
        customWorkouts: true,
        progress: true,
        notifications: true,
        favorites: true,
        cart: true,
        orders: true,
        subscriptions: true,
        createdPlans: true,
        createdProducts: true,
        createdExercises: true,
      },
    });

    // Générer le token JWT
    const tokenPayload = {
      sub: user.id,
      username: user.email,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;

    return {
      accessToken,
      userId: safeUser.id,
      username: safeUser.email,
      user: safeUser,
    };
  }

  async validateUser(input: AuthInput): Promise<SignInData | null> {
    // Try to find user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: input.username,
      },
    });

    if (!user) return null;

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) return null;

    return {
      userId: user.id,
      username: user.email,
    };
  }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signIn(user);
  }

  async signIn(user: SignInData): Promise<AuthResult> {
    const tokenPayload = {
      sub: user.userId,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    const dbUser = await this.prismaService.user.findUnique({
      where: { id: user.userId },
      include: {
        preferences: true,
        workouts: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
        customWorkouts: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
        progress: true,
        notifications: true,
        favorites: true,
        cart: {
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
            payments: true,
          },
        },
        subscriptions: {
          include: {
            plan: true,
          },
        },
        createdPlans: true,
        createdProducts: true,
        createdExercises: true,
      },
    });

    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    // Remove password from user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = dbUser;

    return {
      accessToken,
      userId: safeUser.id,
      username: safeUser.email,
      user: safeUser,
    };
  }
}
