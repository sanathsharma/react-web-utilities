/**
 * Takes an array and a optional key(default-"id"),
 * and returns a object of objects
 * @example
 * ```js
 * const data = [
 *     { id: 1, title: "MyBook", descriptions: "MyBook Description" },
 *     { id: 2, title: "MyBook2", descriptions: "MyBook 2 Description" },
 *     { id: 3, title: "MyBook3", descriptions: "MyBook 3 Description" },
 * ];
 * 
 * const transformedData = normalize( data, "id" );
 * 
 * console.log( transformedData );
 * // output 
 * // {
 * //     1: { id: 1, title: "MyBook", descriptions: "MyBook Description" },
 * //     2: { id: 2, title: "MyBook2", descriptions: "MyBook 2 Description" },
 * //     3: { id: 3, title: "MyBook3", descriptions: "MyBook 3 Description" },
 * // }
 * ```
 */
const normalize = ( arr: Record<string, any>[], key?: string ) => {
    const k = key ?? "id";

    const finalObj: Record<string, any> = {};
    arr.forEach( el => {
        finalObj[el[k]] = el;
    } );
    return finalObj;
};

/**
 * Works similar to noramlize, but it pops out the key in the object
 * @example
 * ```js
 * const data = [
 *     { id: 1, title: "MyBook", descriptions: "MyBook Description" },
 *     { id: 2, title: "MyBook2", descriptions: "MyBook 2 Description" },
 *     { id: 3, title: "MyBook3", descriptions: "MyBook 3 Description" },
 * ];
 *
 * const transformedData = normalizePop( data, "id" );
 *
 * console.log( transformedData );
 * // output
 * // {
 * //     1: { title: "MyBook", descriptions: "MyBook Description" },
 * //     2: { title: "MyBook2", descriptions: "MyBook 2 Description" },
 * //     3: { title: "MyBook3", descriptions: "MyBook 3 Description" },
 * // }
 * ```
 */
const normalizePop = ( arr: Record<string, any>[], key?: string ) => {
    const k = key ?? "id";

    const finalObj: Record<string, any> = {};
    arr.forEach( el => {
        finalObj[el[k]] = el;
        delete finalObj[el[k]][k];
    } );
    return finalObj;
};

/**
 * Opposite functionality to normalize / normalizePop
 * @example
 * ```js
 * const data = {
 *     1: { title: "MyBook", descriptions: "MyBook Description" },
 *     2: { title: "MyBook2", descriptions: "MyBook 2 Description" },
 *     3: { title: "MyBook3", descriptions: "MyBook 3 Description" },
 * };
 * 
 * const transformedData = denormalize( data, "id" );
 * 
 * console.log( transformedData );
 * // output
 * // [
 * //     { id: 1, title: "MyBook", descriptions: "MyBook Description" },
 * //     { id: 2, title: "MyBook2", descriptions: "MyBook 2 Description" },
 * //     { id: 3, title: "MyBook3", descriptions: "MyBook 3 Description" },
 * // ];
 * ```
 */
const denormalize = <O extends Record<string, any>> ( object: { [val: string]: O; }, key: string ) => {
    return Object.keys( object ).map( k => Object.assign( {}, object[k], { [key]: k } ) );
};

export {
    normalize,
    denormalize,
    normalizePop
};