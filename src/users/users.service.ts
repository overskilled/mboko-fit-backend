import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
// K

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<any> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        preferences: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<any> {
    const user = await this.prisma.user.create({
      data,
      include: {
        preferences: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(): Promise<any[]> {
    const users = await this.prisma.user.findMany({
      include: {
        preferences: true,
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    });

    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
