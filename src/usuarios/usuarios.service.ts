import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: { ...dto, password: hash },
    });
    const { password, ...result } = usuario;
    return result;
  }

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true, nombre: true, apellido: true,
        email: true, rol: true, activo: true, creadoEn: true,
      },
    });
    return usuarios;
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true, nombre: true, apellido: true,
        email: true, rol: true, activo: true, creadoEn: true,
      },
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const updated = await this.prisma.usuario.update({
      where: { id },
      data: dto,
    });
    const { password, ...result } = updated;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}
