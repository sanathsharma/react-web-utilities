import Axios, { AxiosResponse, AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { isFunction } from "lodash";
import { isPromise } from "../helpers";
import { Canceler } from "./buildClient";

// ------------------------------------------------------------------------------------------------

export interface IBuildClientWithCancelerOptions extends AxiosRequestConfig {
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

// ------------------------------------------------------------------------------------------------

/**
 * Similar to buildClient, but this is a constructor which provides a canceler function along with the promise.
 * Basic usage
 * @example
 * ```js
 * const Client = new BuildClientWithCanceler( {
 *     baseURL: "http://localhost:8000"
 * } );
 * 
 * // ...
 * 
 * const [promise, canceler] = Client.put(
 *     // url
 *     "/api/books",
 *     // data
 *     {
 *         title: "Update title",
 *         desc: "Updated description"
 *     },
 *     // config
 *     {
 *     // params
 *         params: { bookId: 21 }
 *     }
 * );
 * 
 * promise.then( res => {
 *     // then block
 * } ).catch( error => {
 *     // catch block
 * } )
 * 
 * //... some where else in the code, to cancel the request
 * canceler();
 * 
 * // ...
 * ```
 * 
 * Usage with useEffect
 * @example
 * ```js
 * // api.service.js
 * // ...
 * 
 * const Client = new BuildClientWithCanceler( {
 *     baseURL: "http://localhost:8000"
 * } );
 * 
 * export {
 *     Client
 * };
 * ```
 * ```js
 * // MyComponent.js
 * // ...
 * import { Client } from "./api.service.js";
 * // ...
 * 
 * export default () => {
 *     const [data, setData] = useState( [] );
 * 
 *     useEffect( () => {
 *         const [promise, canceler] = Client.post(
 *             // url
 *             "/api/books",
 *             // data
 *             { title: "MyBook", price: 100 }
 *         )
 * 
 *         promise.then( res => {
 *             setData( res.data );
 *         } ).catch( e => {
 *             console.log( "ERROR:", e );
 *         } )
 * 
 *         return () => canceler();
 *     } , [] )
 * 
 *     return (
 *         <div>
 *             // ...
 *         </div>
 *     );
 * }
 * ```
 */
class BuildClientWithCanceler {
    instance: AxiosInstance;
    private CancelToken = Axios.CancelToken;
    isCancel = Axios.isCancel;
    request: AxiosInstance['request'];

    constructor( options: IBuildClientWithCancelerOptions ) {
        const {
            onRequestFulfilled,
            onRequestRejected,
            onResponseFulfilled,
            onResponseRejected,
            ...rest
        } = options;

        this.instance = Axios.create( rest );

        // set request
        this.request = this.instance.request;

        // configurations
        // instance.defaults.headers.common["Content-Type"] = "application/json";
        this.instance.defaults.headers.post["Content-Type"] = "application/json";

        // attaching token to request body
        this.instance.interceptors.request.use(
            ( req ) => onRequestFulfilled?.( req, this.instance ) ?? req,
            async ( e ) => {
                let err;
                if ( isFunction( onRequestRejected ) ) {
                    err = onRequestRejected( e, this.instance );
                    if ( isPromise( err ) ) err = await err;

                    // do not reject if error not returned
                    if ( !err ) return;
                }
                return Promise.reject( err ?? e );
            }
        );

        // errorhandling
        this.instance.interceptors.response.use(
            ( res ) => onResponseFulfilled?.( res, this.instance ) ?? res,
            async ( e ) => {
                let err;
                if ( isFunction( onResponseRejected ) ) {
                    err = onResponseRejected( e, this.instance );
                    if ( isPromise( err ) ) err = await err;

                    // do not reject if error not returned
                    if ( !err ) return;
                }
                return Promise.reject( err ?? e );
            }
        );

        Object.setPrototypeOf( this, BuildClientWithCanceler.prototype );
    };

    private updates = ( method: "post" | "patch" | "put" ) =>
        ( url: string, data: any = {}, config: AxiosRequestConfig = {} ): [Promise<any>, Canceler] => {
            const { cancelToken, canceler } = this.generateCancelToken();

            return [
                this.instance[method]( url, data, {
                    cancelToken,
                    ...config
                } ),
                canceler
            ];
        };

    private others = ( method: "options" | "head" | "delete" | "get" ) =>
        ( url: string, config: AxiosRequestConfig = {} ): [Promise<any>, Canceler] => {
            const { cancelToken, canceler } = this.generateCancelToken();

            return [
                this.instance[method]( url, {
                    cancelToken,
                    ...config
                } ),
                canceler
            ];
        };

    get = this.others( "get" );
    head = this.others( "head" );
    delete = this.others( "delete" );
    options = this.others( "options" );

    post = this.updates( "post" );
    put = this.updates( "put" );
    patch = this.updates( "patch" );

    get apiBase () {
        return this.instance.defaults.baseURL;
    }

    private generateCancelToken = () => {
        const { token, cancel } = this.CancelToken.source();
        return { cancelToken: token, canceler: cancel };
    };
}

export {
    BuildClientWithCanceler
};