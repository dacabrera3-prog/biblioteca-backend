import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePrestamoDto {
  @IsInt()
  usuarioId: number;

  @IsInt()
  libroId: number;

  @IsDateString()
  fechaDevolucion: string;

  @IsOptional()
  @IsString()
  tipoDocRetenido?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
