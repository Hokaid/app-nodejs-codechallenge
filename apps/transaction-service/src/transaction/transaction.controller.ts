import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @EventPattern('transaction_status')
  async handleTransactionStatus(@Payload() message: any) {
    const { transactionExternalId, status } = message.value;
    await this.service.updateStatus(transactionExternalId, status);
    console.log(`🟢 Updated transaction ${transactionExternalId} to ${status}`);
  }
}
