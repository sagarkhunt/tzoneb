import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Department } from './department.entity';
import { Organization } from './organization.entity';

@Entity('cost_center')
export class CostCenter extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'char', length: 26, name: 'departmentId', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => Department, (d) => d.costCenters, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department | null;

  @Column({ type: 'char', length: 26, name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
