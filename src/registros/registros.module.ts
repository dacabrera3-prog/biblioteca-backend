import { Module } from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { RegistrosController } from './registros.controller';

@Module({
  controllers: [RegistrosController],
  providers: [RegistrosService],
  exports: [RegistrosService],
})
export class RegistrosModule {}
