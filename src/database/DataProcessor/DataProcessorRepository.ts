import { EntityRepository, Repository } from 'typeorm';
import { DataProcessor } from './DataProcessor.js';

@EntityRepository(DataProcessor)
export class DataProcessorRepository extends Repository<DataProcessor> {}
