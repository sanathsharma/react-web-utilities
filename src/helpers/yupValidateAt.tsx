import { ObjectType } from "../constants/interfaces";
import { Schema } from 'yup';

/**
 * Validates a key-value, based on the yup schema provided
 * - if resolves -> gives sanitized data
 * - if rejects -> gives error message
 * @param {Schema} schema yup schema
 * @param {String} field key
 * @param {any} value value
 */
function yupValidateAt<T extends ObjectType> ( schema: Schema<T>, field: keyof T, value: T ): Promise<any> {//value partial T ?????
    const promise = schema.validateAt( field as string, value );
    return new Promise( ( resolve, reject ) => {
        promise
            .then( ( data ) => {
                resolve( data );
            } )
            .catch( error => {
                reject( error.message );
            } );
    } );
};

export {
    yupValidateAt
};