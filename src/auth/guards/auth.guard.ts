import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Session token is missing');
    }

    try {
      // Verify token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const tokenPayload = await this.jwtService.verifyAsync(token);

      // Fetch user with relations according to your schema
      const dbUser = await this.prisma.user.findUnique({
        where: { id: String(tokenPayload.sub) },
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

      // .
      //.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = dbUser;

      request.user = {
        ...safeUser,
        id: dbUser.id,
        username: dbUser.email,
        role: dbUser.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }
}
