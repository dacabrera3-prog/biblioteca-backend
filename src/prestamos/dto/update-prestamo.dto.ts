import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoPrestamo } from '@prisma/client';

export class UpdatePrestamoDto {
  @IsOptional()
  @IsEnum(EstadoPrestamo)
  estado?: EstadoPrestamo;

  @IsOptional()
  @IsString()
  tipoDocRetenido?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
