import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationStatus } from '../../enums/organization.enum';
import { BaseEntity } from './base.entity';
import { PurchasePlan } from './purchase-plan.entity';
import { User } from './user.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', name: 'orgId', unique: true, insert: false })
  orgId: string;

  @Column({ type: 'char', length: 26, name: 'userId', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @OneToMany(() => PurchasePlan, (pp) => pp.organization)
  purchasePlans: PurchasePlan[];

  @Column({ type: 'integer', name: 'licenseCount', default: 0 })
  licenseCount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  @Column({ type: 'boolean', name: 'isActive', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
