import { ulid } from 'ulid';
import { BeforeInsert, PrimaryColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }
}
