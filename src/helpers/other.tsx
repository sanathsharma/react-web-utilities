/**
 * Removes all the numbers in the string.
 * @param {String} string
 * @returns {String} string with no numbers in it.
 */
const nonNumbersInString = ( string: string ) => string.replace( /\d/g, '' );

/**
 * Removes all the characters except numbers in the string.
 * @param {String} string
 * @returns {String} string with no characters other than numbers in it.
 */

const numbersInString = ( string: string ) => string.replace( /\D/g, '' );

/**
 * Indicates whether the paramater given is integer or not. 
 * @param {any} value 
 * @returns {Boolean} boolean which indicates whether the paramater given is integer or not. 
 * - **imp** "Number.isInteger(val:any)" can also b used.
 */
const isInt = ( value: any ) => Number( value ) && value % 1 === 0;

/**
 * Indicates whether the paramater given is float or not.
 * @param {any} value
 * @returns {Boolean} boolean which indicates whether the paramater given is float or not.
 */
const isFloat = ( value: any ) => Number( value ) && value % 1 !== 0;

/**
 * Indicates whether the paramater given is number or not.
 * @param {any} val
 * @returns {Boolean} boolean which indicates whether the paramater given is number or not.
 */
const isNumber = ( val: any ) => typeof val === 'number' && val === val;

export {
    nonNumbersInString,
    numbersInString,
    isInt,
    isFloat,
    isNumber
};