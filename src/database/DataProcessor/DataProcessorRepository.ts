import { EntityRepository, Repository } from 'typeorm';
import { DataProcessor } from './DataProcessor';

@EntityRepository(DataProcessor)
export class DataProcessorRepository extends Repository<DataProcessor> {}
