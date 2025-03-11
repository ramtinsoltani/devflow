import YAML from 'yaml';
import { promisify } from 'node:util';
import { readFile } from 'node:fs';
import { resolve } from 'node:path';
import { Schema, ValidationError, Validator } from 'jsonschema';
import { ServerError } from '../lib/error';
import { Service } from './common';

export class ValidatorService implements Service {

  /** Cached validator schemas */
  private schemas = new Map<ValidatorSchema, Schema>();

  /**
   * Initializes the service by loading all validators (JSONSchema YAML files) from disk into memory.
   */
  public async init(): Promise<void> {

    for ( const validatorName of Object.values(ValidatorSchema) ) {

      // Read YAML file from disk
      const file = await promisify(readFile)(resolve(__dirname, '..', 'validators', validatorName + '.yaml'), { encoding: 'utf-8' });

      // Parse YAML and cache
      this.schemas.set(validatorName, YAML.parse(file));

    }

  }

  /**
   * Validates a target object against a given schema.
   * @param target Object to validate
   * @param schema Schema name
   */
  public validate(target: any, schema: ValidatorSchema): void {

    const schemaObj = this.schemas.get(schema);

    if ( ! schemaObj ) {

      console.error(new Error(`Could not find validation schema object in cache using from enum value "${schema}"!`));

      throw new ServerError('internal', 'Oops! Something went wrong.');

    }

    const v = new Validator();
    
    try {

      v.validate(target, schemaObj, { throwError: true });

    }
    catch (error: unknown) {
      
      if ( error instanceof ValidationError ) {

        throw new ServerError('invalid-request', error.toString());

      }
      else {

        throw new ServerError('internal', 'An unknown error has occurred!');

      }

    }
  
  }

}

/** Registry of all known validator schemas loaded from disk */
export enum ValidatorSchema {
  RequestNewSpace = 'request-new-space',
  RequestUpdateSpace = 'request-update-space',
  RequestNewCollection = 'request-new-collection',
  RequestUpdateCollection = 'request-update-collection',
  RequestNewItem = 'request-new-item',
  RequestUpdateItem = 'request-update-item',
  RequestFetchMetadata = 'request-fetch-metadata',
  RequestNewPermission = 'request-new-permission'
}