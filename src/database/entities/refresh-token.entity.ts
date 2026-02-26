import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ type: 'text' })
  token: string;

  @Index()
  @Column({ type: 'char', length: 26 })
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp with time zone', name: 'expiresAt' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
