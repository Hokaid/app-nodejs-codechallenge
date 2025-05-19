import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transactionExternalId: string;

  @Column()
  @Index()
  accountExternalIdDebit: string;

  @Column()
  @Index()
  accountExternalIdCredit: string;

  @Column()
  transferTypeId: number;

  @Column('decimal')
  value: number;

  @Column()
  transactionStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}
