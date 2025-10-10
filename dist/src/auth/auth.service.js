"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    jwtService;
    prismaService;
    constructor(jwtService, prismaService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
    }
    async signUp(signUpInput) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: signUpInput.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(signUpInput.password, 12);
        const user = await this.prismaService.user.create({
            data: {
                firstName: signUpInput.firstName,
                lastName: signUpInput.lastName,
                email: signUpInput.email,
                password: hashedPassword,
                phoneNumber: signUpInput.phoneNumber,
                role: 'USER',
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
        const tokenPayload = {
            sub: user.id,
            username: user.email,
        };
        const accessToken = await this.jwtService.signAsync(tokenPayload);
        const { password, ...safeUser } = user;
        return {
            accessToken,
            userId: safeUser.id,
            username: safeUser.email,
            user: safeUser,
        };
    }
    async validateUser(input) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: input.username,
            },
        });
        if (!user)
            return null;
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid)
            return null;
        return {
            userId: user.id,
            username: user.email,
        };
    }
    async authenticate(input) {
        const user = await this.validateUser(input);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.signIn(user);
    }
    async signIn(user) {
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
            throw new common_1.NotFoundException('User not found');
        }
        const { password, ...safeUser } = dbUser;
        return {
            accessToken,
            userId: safeUser.id,
            username: safeUser.email,
            user: safeUser,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map