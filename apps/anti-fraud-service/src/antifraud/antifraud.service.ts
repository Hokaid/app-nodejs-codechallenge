import { Controller } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  ClientKafka,
  Client,
  Transport,
} from '@nestjs/microservices';

@Controller()
export class AntifraudService {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
    },
  })
  private client: ClientKafka;

  @EventPattern('transaction_created')
  async handleTransactionCreated(@Payload() message: any) {
    const { transactionExternalId, value } = message.value;

    console.log(
      `🧐 Checking transaction ${transactionExternalId} with value ${value}...`,
    );

    const status = Number(value) > 1000 ? 'rejected' : 'approved';

    console.log(`✅ Transaction ${transactionExternalId} is ${status}`);

    this.client.emit('transaction_status', {
      transactionExternalId,
      status,
    });
  }
}
