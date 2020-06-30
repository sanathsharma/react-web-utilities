import Axios from 'axios';

// ---------------------------------------------------------------------------------------

/**
 * "AxiosError" interface re-exported from "axios"
 */
export type AxiosError<T = any> = import( "axios" ).AxiosError<T>;
/**
 * "AxiosResponse" interface re-exported from "axios"
 */
export type AxiosResponse<T = any> = import( "axios" ).AxiosResponse<T>;
/**
 * "AxiosInstance" interface re-exported from "axios"
 */
export type AxiosInstance = import( "axios" ).AxiosInstance;

// ---------------------------------------------------------------------------------------
export interface IBuildClientOptions {
    /**
     * baseURL for axios
     * @default undefined
     */
    apiBase: string;
    /**
     * A function that returns a token string that is attached to 
     * Authorization header with bearer ( i.e, `Bearer <token>` )
     * @default undefined
     */
    getToken?: () => string | undefined;
    /**
     * CallBack that can be used to update / make ui changes based on errors
     * @default undefined
     * @example
     * ```js
     * onResponseError( error ) {
     *    // e.g, unauthorized error
     *    if( error.response && error.response.status === 401 ) {
     *        // redirection logic (or) reenter password popup
     *        // ...
     *    }
     *}
     * ```
     */
    onResponseError?: ( error: AxiosError ) => void;
    /**
     * Request Timeout
     * - 0 -> infinite
     * @default 10000
     */
    defaultTimeout?: number;
}

// ---------------------------------------------------------------------------------------

/**
 * - Basic usage example
 * @example
 * ```js
 * // api.service.js
 * // ...
 * const Client = new buildClient( {
 *     apiBase: "http://localhost:8000",
 *     getToken() {
 *         return localStorage.getItem( "token" )
 *     },
 *     onResponseError( error ) {
 *         // e.g, unauthorized error
 *         if( error.response && error.response.status === 401 ) {
 *             // redirection logic (or) reenter password popup
 *             // ...
 *         }
 *     }
 * } );
 * 
 * export {
 *     Client
 * }
 * 
 * // MyComponent.js
 * // ...
 * export default () => {
 *     const [data, setData] = useState( [] );
 * 
 *     useEffect( () => {
 *         Client.post("/api/books", { title: "MyBook", price: 100 } )
 *             .then( res => {
 *                 setData( res.data );
 *             } )
 *             .catch( e => {
 *                 console.log( "ERROR:", e );
 *             } )
 *     } , [] )
 * 
 * // ...
 * }
 * ```
 * 
 * - Example for extending the usage
 * @example
 * ```js
 * // api.service.js
 * // ...
 * class ExtendedClient extends buildClient {
 *     constructor( options ) { // options: IBuildClientOptions
 *         super( options );
 *     }
 * 
 *     upload = ( 
 *         method, // "post" | "put"
 *         url, // string
 *         data = {}, // any
 *         params = {} // Record<string, any>
 *     ) => {
 *         return this.instance( {
 *             method,
 *             url,
 *             data,
 *             params,
 *             timeout: 0, // infinite
 *             onUploadProgress ( e ) { // e: ProgressEvent
 *                 const progress = ( e.loaded / e.total ) * 100;
 *                 // logic to indicate the progress on the ui
 *                 // ...
 *             }
 *         } );
 *     };
 * }
 * 
 * const Client = new ExtendedClient( {
 *     // options
 *     // ...
 * } );
 * // ...
 * ```
 */
class buildClient {
    private _apiBase: string;
    private axios: AxiosInstance;
    private timeout: number;

    constructor( options: IBuildClientOptions ) {
        const {
            apiBase,
            getToken,
            onResponseError,
            defaultTimeout = 10000
        } = options;

        // initializations
        this._apiBase = apiBase;
        this.timeout = defaultTimeout;

        // axios instance
        this.axios = Axios.create( {
            baseURL: this._apiBase,
            timeout: this.timeout
        } );

        // configurations
        // this.axios.defaults.headers.common["Content-Type"] = "application/json";
        this.axios.defaults.headers.post["Content-Type"] = "application/json";

        // attaching token to request body
        if ( typeof getToken === "function" )
            this.axios.interceptors.request.use(
                ( req ) => {
                    let token = getToken();
                    req['headers']['Authorization'] = token ? `Bearer ${token}` : '';
                    return req;
                },
                ( e ) => {
                    return Promise.reject( e );
                }
            );

        // errorhandling
        if ( typeof onResponseError === "function" )
            this.axios.interceptors.response.use(
                ( res ) => {
                    return res;
                },
                ( e ) => {
                    onResponseError( e );
                    return Promise.reject( e );
                }
            );
    }

    get apiBase () {
        return this._apiBase;
    }

    get = ( url: string, params: Record<string, any> = {}, timeout?: number ) => {
        return this.axios( {
            method: 'get',
            url,
            params,
            timeout: timeout ?? this.timeout
        } );
    };

    post = ( url: string, data: any = {}, params: Record<string, any> = {}, timeout?: number ) => {
        return this.axios( {
            method: 'post',
            url,
            data,
            params,
            timeout: timeout ?? this.timeout
        } );
    };

    put = ( url: string, data: any, params: Record<string, any> = {}, timeout?: number ) => {
        return this.axios( {
            method: 'put',
            url,
            data,
            params,
            timeout: timeout ?? this.timeout
        } );
    };

    delete = ( url: string, timeout?: number ) => {
        return this.axios( {
            method: 'delete',
            url,
            timeout: timeout ?? this.timeout
        } );
    };

    patch = ( url: string, data: any, params: Record<string, any> = {}, timeout?: number ) => {
        return this.axios( {
            method: 'patch',
            url,
            data,
            params,
            timeout: timeout ?? this.timeout
        } );
    };

    /**
     * Axios instance
     */
    get instance () {
        return this.axios;
    }
}

// ---------------------------------------------------------------------------------------

export {
    buildClient
};