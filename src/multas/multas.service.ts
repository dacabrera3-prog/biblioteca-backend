import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MultasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.multa.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        prestamo: { include: { libro: { select: { titulo: true } } } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: number) {
    const multa = await this.prisma.multa.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        prestamo: true,
      },
    });
    if (!multa) throw new NotFoundException(`Multa #${id} no encontrada`);
    return multa;
  }

  async findByUsuario(usuarioId: number) {
    return this.prisma.multa.findMany({
      where: { usuarioId },
      include: { prestamo: { include: { libro: { select: { titulo: true } } } } },
    });
  }

  async pagar(id: number) {
    await this.findOne(id);
    return this.prisma.multa.update({
      where: { id },
      data: { estado: 'PAGADA' },
    });
  }
}
