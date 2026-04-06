import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    BDT = 'BDT',
    NGN = 'NGN',
}

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('idx_wallets_user_id', { unique: true })
    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'varchar', length: 10, default: Currency.USD })
    currency: string;

    /**
     * Balance is always computed as:
     *   SUM(CREDIT entries) - SUM(DEBIT entries) from the Ledger service.
     * This field is a cached snapshot for read performance ONLY.
     * It is NEVER used as the authoritative balance — the Ledger is the source of truth.
     */
    @Column({ type: 'decimal', precision: 20, scale: 6, default: '0' })
    balanceSnapshot: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ name: 'owner_name', length: 255 })
    ownerName: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
