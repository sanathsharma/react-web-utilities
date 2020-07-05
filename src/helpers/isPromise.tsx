/**
 * Indicates whether the given object is **Promise (or) not**
 * @param object `any`
 * @returns `boolean`
 * @link https://gist.github.com/MarkoCen/ec27b8cd42855fde8a245d43b7b081d0
 */
const isPromise = ( object: any ) => {
    if ( Promise && Promise.resolve ) {
        return Promise.resolve( object ) == object;
    }
    throw new Error( "Promise not supported in your environment" );
};

export {
    isPromise
};