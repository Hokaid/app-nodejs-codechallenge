import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { ClientKafka } from '@nestjs/microservices';
import { Repository } from 'typeorm';

describe('TransactionService', () => {
  let service: TransactionService;
  let repo: Repository<Transaction>;
  let kafkaClient: ClientKafka;

  beforeEach(async () => {
    const kafkaMock = {
      emit: jest.fn(),
      connect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((dto) =>
                Promise.resolve({ ...dto, transactionExternalId: 'mock-id' }),
              ),
            findOne: jest.fn().mockResolvedValue({
              transactionExternalId: 'mock-id',
              transferTypeId: 1,
              transactionStatus: 'approved',
              value: 999,
              createdAt: new Date(),
            }),
            update: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: kafkaMock,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repo = module.get(getRepositoryToken(Transaction));
    kafkaClient = module.get<ClientKafka>('KAFKA_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a transaction and emit event', async () => {
    const dto = {
      accountExternalIdDebit: 'a',
      accountExternalIdCredit: 'b',
      transferTypeId: 1,
      value: 100,
    };

    const result = await service.create(dto as any);

    expect(result.transactionStatus).toBe('pending');
    expect(result.transactionExternalId).toBe('mock-id');
    expect(kafkaClient.emit).toHaveBeenCalledWith('transaction_created', {
      transactionExternalId: 'mock-id',
      value: 100,
    });
  });

  it('should find one transaction and format output', async () => {
    const result = await service.findOne('mock-id');

    expect(result).toEqual({
      transactionExternalId: 'mock-id',
      transactionType: { name: '1' },
      transactionStatus: { name: 'approved' },
      value: 999,
      createdAt: expect.any(Date),
    });
  });

  it('should update transaction status', async () => {
    await expect(
      service.updateStatus('mock-id', 'approved'),
    ).resolves.toBeUndefined();
    expect(repo.update).toHaveBeenCalledWith(
      { transactionExternalId: 'mock-id' },
      { transactionStatus: 'approved' },
    );
  });
});
