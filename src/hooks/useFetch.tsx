// react
import { useState, useEffect } from "react";

// vendors
import { AxiosError } from "axios";

// constants
import { Fetched } from "../constants/interfaces";

// helpers
import { normalize as normalizeFn } from "../helpers/normailze";

// --------------------------------------------------------------------------------------------

export interface useFetchOptions<Fn extends ( ...args: any ) => Promise<any>> {
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
     */
    fetch: () => void;
}

// --------------------------------------------------------------------------------------------

/**
 * React hook for fetching data based on condition and dependency array
 */
const useFetch = <
    D extends any = any,
    Fn extends ( ...args: any ) => Promise<any> = ( ...args: any ) => Promise<any>
> (
    options: useFetchOptions<Fn>
): useFetchReturnType<D> => {
    const {
        method,
        args,
        dependencies = [],
        normalize = false,
        onError,
        condition = true
    } = options;

    const [data, setData] = useState<D | null>( null );
    const [fetched, setFetched] = useState<Fetched>( "FALSE" );

    const fetch = () => {
        if ( !condition ) return;

        setFetched( "FETCHING" );
        method( ...args )
            .then( res => {
                let data = res.data;
                if ( normalize ) data = normalizeFn( data, typeof normalize === "string" ? normalize : undefined );

                setData( data );
                setFetched( "TRUE" );
            } )
            .catch( ( e: AxiosError ) => {
                onError?.( e );
                setFetched( "ERROR" );
            } );
    };

    useEffect( () => {
        fetch();
    }, dependencies );

    useEffect( () => {
        return () => {
            setData( null );
            setFetched( "FALSE" );
        };
    }, [] );

    return { fetched, data, setData, fetch };
};

// --------------------------------------------------------------------------------------------

export {
    useFetch
};
