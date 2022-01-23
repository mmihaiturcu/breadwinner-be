import { EntityRepository, Repository } from 'typeorm';
import { DataSupplier } from './DataSupplier';

@EntityRepository(DataSupplier)
export class DataSupplierRepository extends Repository<DataSupplier> {}
