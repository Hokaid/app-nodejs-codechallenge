import { NestFactory } from '@nestjs/core';
import { AppModule } from './transaction/transaction.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('🚀 Transaction service running on http://localhost:3000');
}
bootstrap();
