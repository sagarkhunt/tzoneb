import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import { Plan } from './plan.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from './user-role.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'character varying', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'character varying', select: false })
  password: string;

  @Column({ type: 'character varying' })
  firstName: string;

  @Column({ type: 'character varying' })
  lastName: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Organization, (org) => org.user)
  organizations: Organization[];

  @OneToMany(() => Plan, (plan) => plan.createdBy)
  plansCreated: Plan[];

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];
}
