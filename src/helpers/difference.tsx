import { isEqual, isObject, transform } from 'lodash';

/**
 * Deep diff between two object, using lodash
 * @link https://gist.github.com/Yimiprod/7ee176597fef230d1451
 * @param  {Object} object Object compared
 * @param  {Object} base Object to compare with
 * @return {Object} Return a new object who represent the diff
 */
function difference ( object: { [x: string]: any; }, base: { [x: string]: any; } ) {
    function changes ( object: { [x: string]: any; }, base: { [x: string]: any; } ) {
        return transform( object, function ( result: any, value, key ) {
            if ( !isEqual( value, base[key] ) ) {
                result[key] = ( isObject( value ) && isObject( base[key] ) ) ? changes( value, base[key] ) : value;
            }
        } );
    }
    return changes( object, base );
}

export {
    difference
};