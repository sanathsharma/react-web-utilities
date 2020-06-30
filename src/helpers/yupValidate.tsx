import { ObjectType } from "../constants/interfaces";
import { Schema } from 'yup';

/**
 * Validates a object based on the yup schema provided
 * - if resolves -> gives sanitized data
 * - if rejects -> gives errors object
 * @param {Schema} schema yup schema
 * @param {ObjectType} obj any object
 * @example
 * ```js
 * // ...
 * import * as yup from "yup";
 * // ...
 * 
 * const mySchema = yup.object().shape( {
 *     firstName: yup.string().trim().required(),
 *     email: yup.string().trim().email("invalid email").required(),
 *     age: yup.number().integer().positive().required()
 * } );
 * 
 * const example = {
 *     firstName: "  Test User  ",
 *     email: "testg.com",
 *     age: 25
 * };
 * 
 * // ...
 * yupValidate( mySchema, example )
 *     .then( data => { 
 *         console.log( data );
 *     } )
 *     .catch( errors => {
 *         console.log( errors );
 *         // output
 *         // {
 *         //      email: "invalid email"
 *         // }
 *     } )
 * // ...
 * ```
 * - learn more about yup here:
 * @link https://www.npmjs.com/package/yup
 */
function yupValidate<T extends ObjectType> ( schema: Schema<T>, obj: T ): Promise<ObjectType> {//obj partial T ?????
    const promise = schema.validate( obj, { abortEarly: false } );
    return new Promise( ( resolve, reject ) => {
        promise
            .then( ( data ) => {
                resolve( data );
            } )
            .catch( errors => {
                const errorsObj: ObjectType = {};

                errors.inner.forEach( ( each: ObjectType ) => {
                    errorsObj[each.path] = each.message;
                } );

                reject( errorsObj );
            } );
    } );
};

export {
    yupValidate
};