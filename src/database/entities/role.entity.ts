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
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  role: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  parentRoleId: string | null;

  @ManyToOne(() => Role, (r) => r.childRoles, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentRoleId' })
  parentRole: Role | null;

  @OneToMany(() => Role, (r) => r.parentRole)
  childRoles: Role[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
