import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Injectable()
export class LibrosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLibroDto) {
    return this.prisma.libro.create({
      data: { ...dto, disponibles: dto.stock },
    });
  }

  async findAll() {
    return this.prisma.libro.findMany({ where: { activo: true } });
  }

  async findOne(id: number) {
    const libro = await this.prisma.libro.findUnique({ where: { id } });
    if (!libro || !libro.activo) throw new NotFoundException(`Libro #${id} no encontrado`);
    return libro;
  }

  async buscar(query: string) {
    // Intentar parsear como año
    const anio = parseInt(query);
    const esAnio = !isNaN(anio) && anio > 999 && anio < 9999;

    return this.prisma.libro.findMany({
      where: {
        activo: true,
        OR: [
          { titulo: { contains: query, mode: 'insensitive' } },
          { autor: { contains: query, mode: 'insensitive' } },
          { editorial: { contains: query, mode: 'insensitive' } },
          { isbn: { contains: query, mode: 'insensitive' } },
          ...(esAnio ? [{ anio: { equals: anio } }] : []),
        ],
      },
    });
  }

  async update(id: number, dto: UpdateLibroDto) {
    await this.findOne(id);
    return this.prisma.libro.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.libro.update({ where: { id }, data: { activo: false } });
  }
}
