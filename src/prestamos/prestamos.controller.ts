import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('prestamos')
@UseGuards(JwtAuthGuard)
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Post()
  create(@Body() dto: CreatePrestamoDto) {
    return this.prestamosService.create(dto);
  }

  @Get()
  findAll() {
    return this.prestamosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.findOne(id);
  }

  @Get('usuario/:usuarioId')
  findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.prestamosService.findByUsuario(usuarioId);
  }

  @Post(':id/devolver')
  devolver(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.devolver(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePrestamoDto) {
    return this.prestamosService.update(id, dto);
  }
}
