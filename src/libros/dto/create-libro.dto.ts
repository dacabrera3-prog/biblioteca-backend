import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLibroDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  autor: string;

  @IsNotEmpty()
  @IsString()
  editorial: string;

  @IsInt()
  @Min(1000)
  anio: number;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsInt()
  @Min(0)
  stock: number;
}
