import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

const DIAS_MAX_CLIENTE = 10;
const MULTA_POR_DIA = 0.50;

@Injectable()
export class PrestamosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrestamoDto) {
    // Verificar libro
    const libro = await this.prisma.libro.findUnique({ where: { id: dto.libroId } });
    if (!libro || !libro.activo) throw new NotFoundException('Libro no encontrado');
    if (libro.disponibles <= 0) throw new BadRequestException('No hay ejemplares disponibles');

    // Verificar usuario
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario || !usuario.activo) throw new NotFoundException('Usuario no encontrado');

    // Máximo 3 préstamos activos
    const prestamosActivos = await this.prisma.prestamo.count({
      where: { usuarioId: dto.usuarioId, estado: { in: ['ACTIVO', 'PENDIENTE'] } },
    });
    if (prestamosActivos >= 3) {
      throw new BadRequestException('El usuario ya tiene 3 préstamos activos. No puede tener más.');
    }

    // Calcular fecha de devolución según rol
    let fechaDevolucion = new Date(dto.fechaDevolucion);
    let monto = 0;

    if (usuario.rol === 'CLIENTE') {
      // Clientes solo 10 días máximo
      const maxFecha = new Date();
      maxFecha.setDate(maxFecha.getDate() + DIAS_MAX_CLIENTE);
      if (fechaDevolucion > maxFecha) {
        fechaDevolucion = maxFecha;
      }
      monto = 0; // tarifa estándar, multa si se pasa
    } else if (usuario.rol === 'PROFESOR') {
      monto = 0; // gratuito
    } else if (usuario.rol === 'ESTUDIANTE') {
      monto = 0; // 50% descuento (se aplica si hay tarifa)
    }

    const prestamo = await this.prisma.prestamo.create({
      data: {
        usuarioId: dto.usuarioId,
        libroId: dto.libroId,
        fechaDevolucion,
        tipoDocRetenido: dto.tipoDocRetenido,
        observaciones: dto.observaciones,
        estado: 'ACTIVO',
      },
      include: {
        usuario: { select: { id: true, nombre: true, email: true, rol: true } },
        libro: true,
      },
    });

    await this.prisma.libro.update({
      where: { id: dto.libroId },
      data: { disponibles: { decrement: 1 } },
    });

    return {
      ...prestamo,
      info: {
        rol: usuario.rol,
        gratuito: usuario.rol === 'PROFESOR',
        descuento: usuario.rol === 'ESTUDIANTE' ? '50%' : '0%',
        diasMaximos: usuario.rol === 'CLIENTE' ? DIAS_MAX_CLIENTE : null,
      },
    };
  }

  async findAll() {
    return this.prisma.prestamo.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, email: true, rol: true } },
        libro: { select: { id: true, titulo: true, autor: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: number) {
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombre: true, email: true, rol: true } },
        libro: true,
        multa: true,
      },
    });
    if (!prestamo) throw new NotFoundException(`Préstamo #${id} no encontrado`);
    return prestamo;
  }

  async findByUsuario(usuarioId: number) {
    return this.prisma.prestamo.findMany({
      where: { usuarioId },
      include: { libro: { select: { id: true, titulo: true, autor: true } }, multa: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async devolver(id: number) {
    const prestamo = await this.findOne(id);
    if (prestamo.estado === 'DEVUELTO') throw new BadRequestException('El préstamo ya fue devuelto');

    const ahora = new Date();
    const updated = await this.prisma.prestamo.update({
      where: { id },
      data: { estado: 'DEVUELTO', fechaDevueltaReal: ahora },
    });

    await this.prisma.libro.update({
      where: { id: prestamo.libroId },
      data: { disponibles: { increment: 1 } },
    });

    // Generar multa si hay retraso
    if (ahora > prestamo.fechaDevolucion) {
      const diasRetraso = Math.ceil(
        (ahora.getTime() - prestamo.fechaDevolucion.getTime()) / (1000 * 60 * 60 * 24)
      );
      const monto = diasRetraso * MULTA_POR_DIA;
      await this.prisma.multa.create({
        data: { prestamoId: id, usuarioId: prestamo.usuarioId, diasRetraso, monto },
      });
    }

    return updated;
  }

  async update(id: number, dto: UpdatePrestamoDto) {
    await this.findOne(id);
    return this.prisma.prestamo.update({ where: { id }, data: dto });
  }
}
