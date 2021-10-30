import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FileResource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    path: string;

    @Column()
    hash: string;
}
