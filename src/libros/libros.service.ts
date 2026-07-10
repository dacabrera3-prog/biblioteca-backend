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

  async buscar(query?: string, anio?: number) {
    const esAnio = query ? (!isNaN(parseInt(query)) && parseInt(query) > 999) : false;
    const anioQuery = anio || (esAnio ? parseInt(query!) : undefined);
    const textQuery = (esAnio || !query) ? undefined : query;

    return this.prisma.libro.findMany({
      where: {
        activo: true,
        AND: [
          ...(anioQuery ? [{ anio: { equals: anioQuery } }] : []),
          ...(textQuery ? [{
            OR: [
              { titulo: { contains: textQuery, mode: 'insensitive' as const } },
              { autor: { contains: textQuery, mode: 'insensitive' as const } },
              { editorial: { contains: textQuery, mode: 'insensitive' as const } },
              { isbn: { contains: textQuery, mode: 'insensitive' as const } },
            ],
          }] : []),
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
