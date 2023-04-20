import { PrismaService } from '@/app/infra/database';
import { AuthService } from '@/auth/auth.service';
import { Role } from '@/auth/enum/role.enum';
import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';

@Injectable()
export class CommonService {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  async registerUser({ email, password }: { email: string; password: string }) {
    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userRoles: {
          create: [
            {
              role: {
                connect: {
                  name: Role.COMMON,
                },
              },
            },
          ],
        },
      },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return this.authService.login(user);
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: Role.COMMON,
            },
          },
        },
      },
    });
  }
}