import { Module } from '@nestjs/common';
import { FileProcessorService } from './file-processor.service';
import { FileProcessorController } from './file-processor.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [FileProcessorService],
  controllers: [FileProcessorController],
})
export class FileProcessorModule {}
