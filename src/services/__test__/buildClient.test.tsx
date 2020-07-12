import { buildClient, AxiosInstance } from "../buildClient";
import axios, { Canceler } from "axios";
import { Service } from "../../factories/Service";

describe( 'buildClient', () => {

    it( 'methods and properties work properly', () => {
        // constants
        const baseURL = "http://localhost:8000";
        const timeout = 5000;

        let Client = buildClient( {
            baseURL,
            timeout,
            custom: {
                getStaticBase () {
                    return this.defaults.baseURL + "/static";
                },
                test: "test"
            }
        } );

        expect( Client.getStaticBase() ).toEqual( baseURL + "/static" );
        expect( Client.test ).toEqual( "test" );
    } );

    describe( 'headers', () => {
        const token = "Loremipsumdolorsitamet";
        const onResponseRejected = jest.fn();
        const onRequestRejected = jest.fn();
        const onResponseFulfilled = jest.fn();

        afterEach( () => jest.resetAllMocks() );

        it( 'sets token in headers properly', async () => {
            // constants
            const baseURL = "http://localhost:8000";
            const timeout = 5000;
            const onRequestFulfilled = jest.fn().mockImplementation( ( config: Record<string, any> = {}, axiosInstance: AxiosInstance ) => ( {
                ...config,
                headers: {
                    ...( config.headers ?? {} ),
                    "Authorization": `Bearer ${token}`
                }
            } ) );

            let client = buildClient( {
                baseURL,
                timeout,
                onRequestFulfilled
            } );

            // --------------------- request fullfilled --------------------------
            const config = {
                headers: {},
                data: {}
            };
            //@ts-ignore
            const req = client.interceptors.request.handlers[0].fulfilled( config );

            expect( onRequestFulfilled ).toBeCalledTimes( 1 );
            expect( req.headers["Authorization"].split( " " )[1] ).toEqual( token );

        } );
        it( 'all the callback functions works as expected', async () => {
            // constants
            const baseURL = "http://localhost:8000";
            const timeout = 5000;
            const SERVER_ERROR = "SERVER_ERROR";
            const NETWORK_ERROR = "NETWORK_ERROR";
            const onRequestFulfilled = jest.fn();

            let client = buildClient( {
                baseURL,
                timeout,
                onRequestFulfilled,
                onRequestRejected,
                onResponseFulfilled,
                onResponseRejected
            } );

            // -------------------------------------------------------------------
            const instance = axios.create( {
                baseURL,
                timeout,
                headers: {},
                data: {}
            } );
            instance.defaults.headers.post["Content-Type"] = "application/json";
            instance.interceptors.request.use( jest.fn(), jest.fn() );
            instance.interceptors.response.use( jest.fn(), jest.fn() );

            // --------------------- request fullfilled --------------------------
            const config = {
                headers: {},
                data: {}
            };
            //@ts-ignore
            const req = client.interceptors.request.handlers[0].fulfilled( config );

            expect( onRequestFulfilled ).toBeCalledTimes( 1 );
            expect( onRequestFulfilled ).toBeCalledWith( config, expect.any( Function ) );

            // ---------------------- request rejected -------------------------
            try {
                //@ts-ignore
                await client.interceptors.request.handlers[0].rejected( new Error( NETWORK_ERROR ) );
            } catch ( error ) {
                // catch the error rejected from above call and assert
                expect( onRequestRejected ).toBeCalledTimes( 1 );
                expect( onRequestRejected ).toBeCalledWith( error, instance );
                expect( error.message ).toEqual( NETWORK_ERROR );
            }

            // ---------------------- response fullfiled ------------------------
            const resExpected = {
                data: [
                    { id: 1, title: "title 1" },
                    { id: 2, title: "title 2" },
                ]
            };
            //@ts-ignore
            const res = client.interceptors.response.handlers[0].fulfilled( resExpected );
            expect( onResponseFulfilled ).toBeCalledTimes( 1 );
            expect( onResponseFulfilled ).toBeCalledWith( res, expect.any( Function ) );
            expect( res ).toEqual( resExpected );

            // ---------------------- response rejected -----------------------
            try {
                //@ts-ignore
                await client.interceptors.response.handlers[0].rejected( new Error( SERVER_ERROR ) );
            } catch ( error ) {
                // catch the error rejected from above call and assert
                expect( error.message ).toEqual( SERVER_ERROR );
                expect( onResponseRejected ).toBeCalledTimes( 1 );
                expect( onResponseRejected ).toBeCalledWith( error, instance );
            }

        } );
    } );

    // it( 'works with custom service', async () => {
    //     const client = buildClient( {
    //         baseURL: ""
    //     } );

    //     class Books extends Service {
    //         get (): [Promise<any>, Canceler] {
    //             const { cancelToken, canceler } = this.generateCancelToken();
    //             return [
    //                 client.get( "", {
    //                     cancelToken
    //                 } ),
    //                 canceler
    //             ];
    //         }
    //     }

    //     const BOOKS = new Books();

    //     try {
    //         const [promise, canceler] = BOOKS.get();

    //         await promise;
    //     } catch ( e ) {
    //         if ( BOOKS.isCancel( e ) ) {
    //             return console.log( "Request Canceled" );
    //         };
    //         console.log( e );
    //     }
    // } );


} );
