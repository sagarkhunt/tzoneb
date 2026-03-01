import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { CostCenter } from './cost-center.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('department')
export class Department extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'char', length: 26, name: 'managerId', nullable: true })
  managerId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'managerId' })
  manager: User | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'annualBudget', default: 0 })
  annualBudget: string;

  @Column({ type: 'char', length: 26, name: 'costCenterId', nullable: true })
  costCenterId: string | null;

  @ManyToOne(() => CostCenter, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'costCenterId' })
  costCenter: CostCenter | null;

  @Column({ type: 'char', length: 26, name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => CostCenter, (cc) => cc.department)
  costCenters: CostCenter[];

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
