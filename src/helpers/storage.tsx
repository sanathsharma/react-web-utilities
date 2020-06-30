import { encode, decode } from './encoder';

/**
 * get item from storage by "key" name;
 * - can bind with either "localStorage" or "sessionStorage"
 * - decodes the data in "storage" and returns the value of the key
 * @example
 * ```js
 * const token = getItem.bind(sessionStorage,'token');
 * //or
 * getItem.call(sessionStorage,'token');
 * ```
 */
export function getItem ( this: Storage, key: string ) {
    key = encode( key );
    const value = this.getItem( key );
    if ( value ) return JSON.parse( decode( value ) );
};

/**
 * get all storage data in form of an object
 * - can bind with either "localStorage" or "sessionStorage"
 * - decodes all the key value pair in "storage" and returns a object containing them
 * @example
 * ```js
 * const data = getAll.call( localStorage );
 * ```
 */
export function getAll ( this: Storage ) {
    const EncodedKeysArr = keysList.call( this );
    const DecodedObj: {
        [x: string]: any;
    } = {};
    EncodedKeysArr.forEach( key => {
        DecodedObj[decode( key )] = JSON.parse( decode( getItem.call( this, key ) ) );
    } );
    return DecodedObj;
};

/**
 * set item to storage 
 * - can bind with either "localStorage" or "sessionStorage"
 * - encodes the key value and puts it in "storage"
 * @example
 * ```js
 * const setToken = setItem.bind(sessionStorage,'token');
 * setToken('fghjklwelkdhbnqlme');
 * //or
 * setItem.call(sessionStorage,'token','fghjklwelkdhbnqlme');
 * ```
 */
export function setItem ( this: Storage, key: string, value: any ) {
    key = encode( key );
    if ( value === undefined || value === null ) return;
    value = encode( JSON.stringify( value ) );
    this.setItem( key, value );
};

/**
 * set each "key", "value" pair in a object as an item in storage
 * - can bind with either "localStorage" or "sessionStorage"
 * - encodes each key-value pair of the object and stores it seperately in the "storage"
 * @example
 * ```js
 * const data = {
 *     userId: 1,
 *     userName: "Test User",
 *     token: "kjhsfuiefhsieufhiseuhsi.wgdiuqhdoiqhdwoi"
 * };
 * 
 * setItems.call( localStorage, data );
 * ```
 */
export function setItems ( this: Storage, obj: { [x: string]: any; } ) {
    for ( let key in obj ) {
        setItem.call( this, key, obj[key] );
    }
};

/**
 * remove a single item in storage by its "key"
 * - can bind with either "localStorage" or "sessionStorage"
 * @example
 * ```js
 * removeItem.call( localStorage, "token" );
 * ```
 */
export function removeItem ( this: Storage, key: string ) {
    key = encode( key );
    this.removeItem( key );
};

/**
 * clear all the items in storage
 * - can bind with either "localStorage" or "sessionStorage"
 * @example
 * ```js
 * clear.call( localStorage )
 * ```
 */
export function clear ( this: Storage ) {
    this.clear();
};

/**
 * gives a list (array) of all key names for all the items in the storage
 * - can bind with either "localStorage" or "sessionStorage"
 * @example
 * ```js
 * const keys = keysList.call( localStorage );
 * 
 * console.log( keys )
 * // e.g, output
 * // ["userId","userName","token"]
 * ```
 */
export function keysList ( this: Storage ) {
    const EncodedKeysArr = Object.keys( this );
    return EncodedKeysArr.map( key => {
        return decode( key );
    } );
};

/**
 * gives length of storage
 * - can bind with either "localStorage" or "sessionStorage"
 * @example
 * ```js
 * const length = length.call( localStorage );
 * 
 * console.log( length );
 * // e.g, output
 * // 3
 * ```
 */
export function length ( this: Storage ) {
    return this.length;
};