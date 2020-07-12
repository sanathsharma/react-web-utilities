// react
import { useState, useEffect, useRef } from "react";

// vendors
import Axios, { AxiosError, Canceler, CancelToken } from "axios";
import { isFunction } from "lodash";

// constants
import { Fetched } from "../constants/interfaces";

// helpers
import { normalize as normalizeFn } from "../helpers/normailze";
import { isPromise } from "../helpers/isPromise";

// --------------------------------------------------------------------------------------------

export interface useFetchOptions<
    Fn extends
    ( ( ...args: any ) => Promise<any> ) |
    ( ( ...args: any ) => ( cancelToken: CancelToken ) => Promise<any> ) |
    ( ( ...args: any ) => [Promise<any>, Canceler] )
    > {
    /**
     * Reference to the function which returns a Promise
     * @default undefined
     */
    method: Fn,
    /**
     * Arguments to the function refered for "method"
     * @default undefined
     */
    args: Parameters<Fn>,
    /**
     * Refetch based on dependency value change
     * - useEffect dependency array
     * @default []
     */
    dependencies?: any[],
    /**
     * normalizes based on the key provided
     * - boolean or string
     * - true -> normalizes by "id"
     * - false -> directly sets data with the response data
     * - "somekey" -> normalizes by "somekey"
     * @default false
     */
    normalize?: boolean | string,
    /**
     * Transform the response data before storing it the "data" state.
     * Whatever is returned by the function is set to "data". It can also return a **promise**.
     * - **Note:** if normalize is true|"somekey", 
     * then normalized data is avaliable in the params instead of response data
     */
    transformResData?: ( data: any ) => any;
    /**
     * Callback that gets called on api request gets rejected with an error
     * @default undefined
     */
    onError?: ( e: AxiosError ) => void;
    /**
     * Condition to fetch
     * - true -> make the api request on fetch Call
     * - false -> donnot make api request on fetch call
     * @default true
     */
    condition?: boolean;
    /**
     * Default state of "data"
     * @default null
     */
    defaultData?: any;
    /**
     * Default state of "fetched"
     * @default "FALSE"
     */
    defaultFetched?: Fetched;
    /**
     * message of the error thrown on request cancel
     * @default undefined
     */
    onCancelMsg?: string;
    /**
     * callback which is called when an ongoing request is canceled
     * - **onError** is not called when onCancel is present
     * @default undefined
     */
    onCancel?: ( e: AxiosError | Error ) => void;
}

export interface useFetchReturnType<D extends any = any> {
    /**
     * Tells at what state the api call is in.
     * - "FALSE" | "FETCHING" | "ERROR" | "TRUE"
     * @default "FALSE"
     */
    fetched: Fetched;
    /**
     * Response data or normalized response data
     * @default null
     */
    data: D | null;
    /**
     * Function to manipulate "data" state
     */
    setData: React.Dispatch<React.SetStateAction<D | null>>;
    /**
     * Function to make the api call.
     * General usecase is to call this function on retry if initial api request fails (fetched="ERROR")
     * @param force (`boolean`) force api hit even if `condition` is false
     */
    fetch: ( force?: boolean ) => void;
}

// --------------------------------------------------------------------------------------------

const CancelTokenConstructor = Axios.CancelToken;

/**
 * React hook for fetching data based on condition and dependency array
 */
const useFetch = <
    D extends any = any,
    Fn extends
    ( ( ...args: any ) => Promise<any> ) |
    ( ( ...args: any ) => ( cancelToken: CancelToken ) => Promise<any> ) |
    ( ( ...args: any ) => [Promise<any>, Canceler] ) = ( ...args: any ) => Promise<any>
> (
    options: useFetchOptions<Fn>
): useFetchReturnType<D> => {
    const {
        method,
        args,
        dependencies = [],
        normalize = false,
        transformResData,
        onError,
        condition = true,
        defaultData = null,
        defaultFetched = "FALSE",
        onCancelMsg,
        onCancel
    } = options;

    const [data, setData] = useState<D | null>( defaultData );
    const [fetched, setFetched] = useState<Fetched>( defaultFetched );

    const cancelRequest = useRef<Canceler | null>( null );

    const fetch = async ( force = false ) => {
        if ( !condition && !force ) return;

        // if another request is made imediately, cancel it
        cancelRequest.current?.();

        setFetched( "FETCHING" );

        try {
            const result = method( ...args );

            let res;
            if ( typeof result === "function" ) {
                // executor: ( cancel: Canceler ) => void
                const canceler = new CancelTokenConstructor( ( cancel ) => {
                    cancelRequest.current = cancel.bind( null, onCancelMsg );
                } );

                res = await result( canceler );
            }
            else if ( Array.isArray( result ) ) {
                res = await result[0];
                cancelRequest.current = result[1];
            }
            else res = await result;

            let data = res.data;

            if ( normalize ) data = normalizeFn( data, typeof normalize === "string" ? normalize : undefined );
            if ( typeof transformResData === "function" ) {
                data = transformResData( data );

                // if promise is returned
                if ( isPromise( data ) ) data = await data;
            }

            setData( data );
            setFetched( "TRUE" );
        } catch ( e ) {
            if ( isFunction( onCancel ) && Axios.isCancel( e ) ) {
                onCancel( e );
            } else {
                onError?.( e );
            }
            setFetched( "ERROR" );
        }
    };

    useEffect( () => {
        fetch();

        () => {
            // cancel ongoing request, if any before making another request
            cancelRequest.current?.();
        };
    }, dependencies );

    useEffect( () => {
        return () => {
            setData( defaultData );
            setFetched( defaultFetched );
        };
    }, [] );

    return { fetched, data, setData, fetch };
};

// --------------------------------------------------------------------------------------------

export {
    useFetch
};
