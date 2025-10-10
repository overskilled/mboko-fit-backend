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
exports.AuthGuard = void 0;
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AuthGuard = class AuthGuard {
    jwtService;
    prisma;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        const token = authorization && authorization.split(' ')[1];
        if (!token) {
            throw new common_1.UnauthorizedException('Session token is missing');
        }
        try {
            const tokenPayload = await this.jwtService.verifyAsync(token);
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
                throw new common_1.NotFoundException('User not found');
            }
            const { password, ...safeUser } = dbUser;
            request.user = {
                ...safeUser,
                id: dbUser.id,
                username: dbUser.email,
                role: dbUser.role,
            };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired session token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map