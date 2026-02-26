import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchasePlan } from './purchase-plan.entity';
import { User } from './user.entity';

@Entity('plans')
export class Plan extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', array: true, nullable: true })
  description: string[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'boolean', name: 'isActive', default: true })
  isActive: boolean;

  @Column({ type: 'integer', name: 'pricePerUser', default: 0 })
  pricePerUser: number;

  @Column({ type: 'integer', name: 'userPerPlan', default: 1 })
  userPerPlan: number;

  @Column({ type: 'text', nullable: true })
  cycle: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @OneToMany(() => PurchasePlan, (pp) => pp.plan)
  purchasePlans: PurchasePlan[];
}
