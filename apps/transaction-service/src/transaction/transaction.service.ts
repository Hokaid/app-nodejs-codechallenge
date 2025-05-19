import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class TransactionService implements OnModuleInit {
  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>,

    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.connect();
  }

  async create(dto: CreateTransactionDto) {
    const transaction = this.repo.create({
      ...dto,
      transactionStatus: 'pending',
    });

    const saved = await this.repo.save(transaction);

    this.kafkaClient.emit('transaction_created', {
      transactionExternalId: saved.transactionExternalId,
      value: saved.value,
    });

    return saved;
  }

  async updateStatus(id: string, status: string) {
    await this.repo.update(
      { transactionExternalId: id },
      { transactionStatus: status },
    );
  }

  async findOne(id: string) {
    const tx = await this.repo.findOne({
      where: { transactionExternalId: id },
    });

    if (!tx) return null;

    return {
      transactionExternalId: tx.transactionExternalId,
      transactionType: {
        name: tx.transferTypeId.toString(),
      },
      transactionStatus: {
        name: tx.transactionStatus,
      },
      value: Number(tx.value),
      createdAt: tx.createdAt,
    };
  }
}
