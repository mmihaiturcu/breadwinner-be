import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FileResource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}
