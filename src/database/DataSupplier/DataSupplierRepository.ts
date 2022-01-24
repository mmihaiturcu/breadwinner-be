import { EntityRepository, Repository } from 'typeorm';
import { DataSupplier } from './DataSupplier.js';

@EntityRepository(DataSupplier)
export class DataSupplierRepository extends Repository<DataSupplier> {}
