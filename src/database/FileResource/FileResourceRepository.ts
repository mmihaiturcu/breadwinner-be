import { EntityRepository, Repository } from 'typeorm';
import { FileResource } from './FileResource.js';

@EntityRepository(FileResource)
export class FileResourceRepository extends Repository<FileResource> {
    findById(id: FileResource['id']) {
        return this.findOne({ id });
    }
}
