import { buildClient } from "../buildClient";

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
        const getToken = jest.fn().mockImplementation( () => token );
        const onResponseError = jest.fn();

        afterEach( () => jest.resetAllMocks() );
        it( 'sets token in headers properly', async () => {
            // constants
            const baseURL = "http://localhost:8000";
            const timeout = 5000;
            const SERVER_ERROR = "SERVER_ERROR";
            const NETWORK_ERROR = "NETWORK_ERROR";

            let client = buildClient( {
                baseURL,
                timeout,
                getToken,
                onResponseError
            } );

            // --------------------- request fullfilled --------------------------
            //@ts-ignore
            const req = client.interceptors.request.handlers[0].fulfilled( {
                headers: {},
                data: {}
            } );

            expect( getToken ).toBeCalledTimes( 1 );
            expect( req.headers["Authorization"].split( " " )[1] ).toEqual( token );

            // ---------------------- request rejected -------------------------
            try {
                //@ts-ignore
                await client.interceptors.request.handlers[0].rejected( new Error( NETWORK_ERROR ) );
            } catch ( error ) {
                // catch the error rejected from above call and assert
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
            expect( res ).toEqual( resExpected );

            // ---------------------- response rejected -----------------------
            try {
                //@ts-ignore
                await client.interceptors.response.handlers[0].rejected( new Error( SERVER_ERROR ) );
            } catch ( error ) {
                // catch the error rejected from above call and assert
                expect( error.message ).toEqual( SERVER_ERROR );
                expect( onResponseError ).toBeCalledTimes( 1 );
                expect( onResponseError ).toBeCalledWith( error );
            }

        } );
    } );

} );
