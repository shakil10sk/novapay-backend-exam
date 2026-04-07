import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PayrollJobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('payroll_jobs')
export class PayrollJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employer_wallet_id' })
  employerWalletId: string;

  @Column({ type: 'int' })
  totalEmployees: number;

  @Column({ type: 'int', default: 0 })
  processedEmployees: number;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  totalAmount: string;

  @Column({ length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: PayrollJobStatus.QUEUED })
  status: PayrollJobStatus;

  @Column({ name: 'job_id', nullable: true })
  jobId: string; // BullMQ internal ID

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
