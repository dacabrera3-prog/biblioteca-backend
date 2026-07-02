import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.registro.findMany({
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
      orderBy: { creadoEn: 'desc' },
      take: 100,
    });
  }

  async crear(data: { usuarioId?: number; accion: string; entidad: string; entidadId?: number; detalle?: string; ip?: string }) {
    return this.prisma.registro.create({ data });
  }
}
