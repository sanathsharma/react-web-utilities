import Axios, { AxiosRequestConfig } from 'axios';
import { isPromise } from '../helpers';
import { isFunction } from 'lodash';

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


// --------------------------------------------------------------------------------------------

export type CancelToken = import( 'axios' ).CancelToken;
export type Canceler = import( 'axios' ).Canceler;

// ---------------------------------------------------------------------------------------

export interface IBuildClientOptions extends AxiosRequestConfig {
    /**
     * CallBack that can be used to modify response
     * @default undefined
     * ```js
     * onResponseFulfilled( res ) {
     *     // data directly avaliable in the promise chain
     *     return res.data;
     * }
     * ```
     */
    onResponseFulfilled?: ( res: AxiosResponse, instance: AxiosInstance ) => AxiosResponse | Promise<AxiosResponse>;
    /**
     * CallBack that can be used to update / make ui changes based on errors
     * **Note** Error doesnot get thrown (not be avaliable in subsequent catch blocks) if error object is not returned
     * @default undefined
     * @example
     * ```js
     * onResponseRejected( error ) {
     *    // e.g, unauthorized error
     *    if( error.response && error.response.status === 401 ) {
     *        // redirection logic (or) reenter password popup
     *        // ...
     *    }
     *    return err;
     *}
     * ```
     */
    onResponseRejected?: ( error: AxiosError, instance: AxiosInstance ) => AxiosError | Error | undefined;
    /**
     * Callback that can be use to set headers before the request goes to server
     * @default undefined
     * @example
     * ```js
     * onRequestFulfilled( req ) {
     *     const token = localStorage.getItem("token") ?? "";
     *     req.headers["Authorization"] = `Bearer ${token}`;
     *     return req;
     * }
     * ```
     */
    onRequestFulfilled?: ( req: AxiosRequestConfig, instance: AxiosInstance ) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
    /**
    * CallBack that can be used to update / make ui changes based on errors;
    * **Note** Error doesnot get thrown (not be avaliable in subsequent catch blocks) if error object is not returned
    * @default undefined
    * @example
    * ```js
    * onRequestRejected( error ) {
    *    // e.g, request timed out
    *    if( error.response && error.response.status === 408 ) {
    *        // make ui changes
    *        // ...
    *    }
    *}
    * ```
    */
    onRequestRejected?: ( error: AxiosError, instance: AxiosInstance ) => AxiosError | Error | undefined;
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

interface Others {
    generateCancelToken: () => {
        cancelToken: CancelToken;
        canceler: Canceler;
    };
    isCancel: typeof Axios.isCancel;
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
 *     onRequestFulfilled( req ) {
 *         const token = localStorage.getItem("token") ?? "";
 *         req.headers["Authorization"] = `Bearer ${token}`;
 *         return req;
 *     },
 *     onResponseRejected( error ) {
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
 * };
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
 *             } );
 *         }
 *     }
 * } );
 * 
 * export {
 *     Client
 * };
 * ```
 */
const CancelToken = Axios.CancelToken;

const generateCancelToken = () => {
    const { token, cancel } = CancelToken.source();
    return { cancelToken: token, canceler: cancel };
};

const buildClient = function <
    C extends Record<string, ( ( this: AxiosInstance, ...args: any ) => any ) | string | number | any[] | undefined | null>
> ( options: IBuildClientOptions & OtherOptions<C> ): AxiosInstance & C & Others {
    const {
        onResponseRejected,
        onRequestFulfilled,
        onRequestRejected,
        onResponseFulfilled,
        custom,
        ...rest
    } = options;

    const instance = Axios.create( rest );

    // configurations
    // instance.defaults.headers.common["Content-Type"] = "application/json";
    instance.defaults.headers.post["Content-Type"] = "application/json";

    // attaching token to request body
    instance.interceptors.request.use(
        ( req ) => onRequestFulfilled?.( req, instance ) ?? req,
        async ( e ) => {
            let err;
            if ( isFunction( onRequestRejected ) ) {
                err = onRequestRejected( e, instance );
                if ( isPromise( err ) ) err = await err;

                // do not reject if error not returned
                if ( !err ) return;
            }
            return Promise.reject( err ?? e );
        }
    );

    // errorhandling
    instance.interceptors.response.use(
        ( res ) => onResponseFulfilled?.( res, instance ) ?? res,
        async ( e ) => {
            let err;
            if ( isFunction( onResponseRejected ) ) {
                err = onResponseRejected( e, instance );
                if ( isPromise( err ) ) err = await err;

                // do not reject if error not returned
                if ( !err ) return;
            }
            return Promise.reject( err ?? e );
        }
    );

    return Object.assign( instance, { generateCancelToken, isCancel: Axios.isCancel }, custom );
};

// ---------------------------------------------------------------------------------------

export {
    buildClient
};