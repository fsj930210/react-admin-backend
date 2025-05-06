import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ comment: '主键', type: 'int' })
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: '创建时间',
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: '更新时间',
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP(0)',
    onUpdate: 'CURRENT_TIMESTAMP(0)',
  })
  updatedAt: Date;

  @Column({ name: 'create_by', update: false, comment: '创建者', nullable: true })
  createBy: number;

  @Column({ name: 'update_by', comment: '更新者', nullable: true })
  updateBy: number;
}
