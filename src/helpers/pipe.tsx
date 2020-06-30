/**
 * Hack for pipeline operator
 * - it works with a mix of promises and non-promises
 * - link for implemention, example:
 * {@link https://repl.it/@devmastery/PromisablePipe#main.js}
 * - youtube video (by "Dev Mastery") link:
 * {@link https://youtu.be/38q7aSu52NY}
 * @param fns 
 */
const pipe = <P extends any = any> ( ...fns: Function[] ) => ( param: P ) => fns.reduce(
    ( result: any, fn ) => ( result.then && result.then( fn ) ) || fn( result ),
    param
);

export {
    pipe
};