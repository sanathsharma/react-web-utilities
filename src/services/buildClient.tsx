import Axios, { AxiosRequestConfig } from 'axios';

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
export interface IBuildClientOptions extends AxiosRequestConfig {
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
}

// TODO: rename custom, update readme, changelog, update above extension example
interface OtherOptions<
    C extends Record<string, ( ( this: AxiosInstance, ...args: any ) => any ) | string | number | any[] | undefined | null>
    > {
    /**
     * custom methods and properties on client
     */
    custom?: C;
}

// ---------------------------------------------------------------------------------------

/**
 * - Small wrapper on axios.create
 * @example
 * ```js
 * // api.service.js
 * // ...
 * const Client = buildClient( {
 *     baseURL: "http://localhost:8000",
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
 *         Client.post(
 *             // url
 *             "/api/books",
 *             // data
 *             { title: "MyBook", price: 100 }
 *         ) .then( res => {
 *             setData( res.data );
 *         } ).catch( e => {
 *             console.log( "ERROR:", e );
 *         } )
 *     } , [] )
 * 
 * // ...
 * }
 * ```
 * 
 * - Example for custom methods and properties
 * @example
 * ```js
 * // api.service.js
 * // ...
 * import { buildClient } from "@ssbdev/react-web-utilities";
 * // ...
 * 
 * const Client = buildClient({
 *     baseURL: "http://localhost:8000",
 *     custom: {
 *         getStaticBase() {
 *             return this.defaults.baseURL + "/static";
 *         },
 *         upload(
 *             method, // "post" | "put"
 *             url,
 *             data,
 *             config // AxiosRequestConfig
 *         ) {
 *             return this[method]( url, data, {
 *                 timeout: 0,
 *                 onUploadProgress ( e ) { // e: ProgressEvent
 *                     const progress = ( e.loaded / e.total ) * 100;
 *                     // logic to indicate the progress on the ui
 *                     // ...
 *                 },
 *                 ...config
 *             } )l
 *         }
 *     }
 * } );
 * 
 * export {
 *     Client
 * }
 * ```
 */

const buildClient = function <
    C extends Record<string, ( ( this: AxiosInstance, ...args: any ) => any ) | string | number | any[] | undefined | null>
> ( options: IBuildClientOptions & OtherOptions<C> ): AxiosInstance & C {
    const {
        getToken,
        onResponseError,
        custom,
        ...rest
    } = options;

    const instance = Axios.create( rest );

    // configurations
    // instance.defaults.headers.common["Content-Type"] = "application/json";
    instance.defaults.headers.post["Content-Type"] = "application/json";

    // attaching token to request body
    if ( typeof getToken === "function" )
        instance.interceptors.request.use(
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
        instance.interceptors.response.use(
            ( res ) => {
                return res;
            },
            ( e ) => {
                onResponseError( e );
                return Promise.reject( e );
            }
        );

    return Object.assign( {}, instance, custom );
};

// ---------------------------------------------------------------------------------------

export {
    buildClient
};