import { NestFactory } from '@nestjs/core';
import { AppModule } from './antifraud/antifraud.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'anti-fraud-consumer',
        },
      },
    },
  );

  await app.listen();
  console.log('🛡️ Anti-Fraud service listening on Kafka...');
}
bootstrap();
