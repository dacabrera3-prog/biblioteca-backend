import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LibrosService } from './libros.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('libros')
@UseGuards(JwtAuthGuard)
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  // Solo BIBLIOTECARIO puede crear libros
  @Post()
  @UseGuards(RolesGuard)
  @Roles('BIBLIOTECARIO')
  create(@Body() dto: CreateLibroDto) {
    return this.librosService.create(dto);
  }

  // Todos pueden ver libros
  @Get()
  findAll(@Query('buscar') buscar?: string) {
    if (buscar) return this.librosService.buscar(buscar);
    return this.librosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.findOne(id);
  }

  // Solo BIBLIOTECARIO puede editar libros
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('BIBLIOTECARIO')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLibroDto) {
    return this.librosService.update(id, dto);
  }

  // Solo BIBLIOTECARIO puede eliminar libros
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('BIBLIOTECARIO')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }
}
