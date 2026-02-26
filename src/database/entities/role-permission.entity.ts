import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permission')
@Unique(['roleId', 'permissionId'])
export class RolePermission extends BaseEntity {
  @Column({ type: 'char', length: 26 })
  roleId: string;

  @ManyToOne(() => Role, (r) => r.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ type: 'char', length: 26 })
  permissionId: string;

  @ManyToOne(() => Permission, (p) => p.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
