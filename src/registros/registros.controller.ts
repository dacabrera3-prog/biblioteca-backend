import { Controller, Get, UseGuards } from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('registros')
@UseGuards(JwtAuthGuard)
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  findAll() {
    return this.registrosService.findAll();
  }
}
