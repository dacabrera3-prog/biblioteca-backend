import { Controller, Get, Param, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MultasService } from './multas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('multas')
@UseGuards(JwtAuthGuard)
export class MultasController {
  constructor(private readonly multasService: MultasService) {}

  @Get()
  findAll() {
    return this.multasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.multasService.findOne(id);
  }

  @Get('usuario/:usuarioId')
  findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.multasService.findByUsuario(usuarioId);
  }

  @Post(':id/pagar')
  pagar(@Param('id', ParseIntPipe) id: number) {
    return this.multasService.pagar(id);
  }
}
