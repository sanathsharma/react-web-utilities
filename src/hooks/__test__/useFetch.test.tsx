import { buildClient } from "../../services/buildClient";
import { useFetch } from "../useFetch";
import { act, renderHook } from "@testing-library/react-hooks";
import { normalize } from "../../helpers/normailze";

describe( 'useFetch', () => {
    afterEach( () => {
        jest.resetAllMocks();
    } );

    const Client = buildClient( {
        baseURL: ""
    } );

    it( 'fetchs data properly on mount and manual fetch call', async () => {
        // constants
        const data = [{ title: "example" }];

        // mocks
        Client.get = jest.fn().mockResolvedValue( { data } );

        await act( async () => {
            const { result, waitForNextUpdate } = await renderHook( ( props ) => useFetch( {
                method: () => Client.get( "/api" ),
                args: []
            } ), {
                initialProps: {}
            } );

            // await waitForValueToChange( () => result.current.fetched );
            // console.log( 'result.current :', result.current );

            // assertions
            await waitForNextUpdate();
            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( data );

            await result.current.fetch();
            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( data );

            const newData = [{ title: "updated title" }];
            await result.current.setData( newData );
            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( newData );
        } );
    } );

    it( 'calls onError callback on api error', async () => {
        // constants
        const error = new Error( "SERVER ERROR" );

        // mocks
        Client.get = jest.fn().mockRejectedValue( error );
        const mockCallback = jest.fn();

        // NOTE: no need to wrap in act as not state changes are being made on error
        const { result, waitForNextUpdate } = await renderHook( ( props ) => useFetch( {
            method: ( id: number ) => Client.get( "/api", { params: { id } } ),
            args: [props.id],
            onError: mockCallback
        } ), {
            initialProps: {
                id: 1
            }
        } );

        // assertions
        await waitForNextUpdate();
        expect( result.current.fetched ).toBe( "ERROR" );
        expect( mockCallback ).toBeCalledTimes( 1 );
        expect( mockCallback ).toBeCalledWith( error );
    } );

    describe( 'condition option', () => {
        it( 'does not make any api hits if condition in false', () => {
            // constants
            const data = [{ title: "example" }];

            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            // NOTE: no need to wrap in act as no state changes are being made on error
            // NOTE: no need to await as no async action are being done if condition: false
            const { result, waitForNextUpdate } = renderHook( ( props ) => useFetch( {
                method: ( id: number ) => Client.get( "/api", { params: { id } } ),
                args: [props.id],
                condition: false
            } ), {
                initialProps: {
                    id: 1
                }
            } );

            // assertions
            expect( result.current.fetched ).toEqual( "FALSE" );
            expect( result.current.data ).toEqual( null );
        } );

        it( 'does not make any api hits if condition in false & make api hit when it changes (w/ condition as dependency)', async () => {
            // constants
            const data = [{ title: "example" }];

            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            // NOTE: no need to wrap in act as no state changes are being made on error
            // NOTE: no need to await as no async action are being done if condition: false
            const { result, rerender, waitForNextUpdate } = renderHook( ( props ) => useFetch( {
                method: () => Client.get( "/api" ),
                args: [],
                condition: props.condition,
                dependencies: [props.condition]
            } ), {
                initialProps: {
                    condition: false
                }
            } );

            // assertions
            expect( result.current.fetched ).toEqual( "FALSE" );
            expect( result.current.data ).toEqual( null );

            act( () => {
                rerender( {
                    condition: true,
                } );
            } );

            await waitForNextUpdate();

            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( data );
        } );

        it( 'does not make any api hits if condition in false & make api hit when it changes (w/o condition as dependency) on manual fetch call', async () => {
            // constants
            const data = [{ title: "example" }];

            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            // NOTE: no need to wrap in act as no state changes are being made on error
            // NOTE: no need to await as no async action are being done if condition: false
            const { result, rerender, waitForNextUpdate } = renderHook( ( props ) => useFetch( {
                method: () => Client.get( "/api" ),
                args: [],
                condition: props.condition
            } ), {
                initialProps: {
                    condition: false
                }
            } );

            // assertions
            expect( result.current.fetched ).toEqual( "FALSE" );
            expect( result.current.data ).toEqual( null );

            rerender( {
                condition: true,
            } );

            // assertions
            expect( result.current.fetched ).toEqual( "FALSE" );
            expect( result.current.data ).toEqual( null );

            act( () => {
                result.current.fetch();
            } );

            await waitForNextUpdate();

            // assertions
            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( data );
        } );

    } );


    it( 'gives defaultData if set before api hit', () => {
        // constants
        const data = [{ title: "example" }];
        const defaultData = [{ title: "dummy Title" }];

        // mocks
        Client.get = jest.fn().mockResolvedValue( { data } );

        // NOTE: no need to wrap in act as no state changes are being made on error
        // NOTE: no need to await as no async action are being done if condition: false
        const { result, waitForNextUpdate } = renderHook( ( props ) => useFetch( {
            method: ( id: number ) => Client.get( "/api", { params: { id } } ),
            args: [props.id],
            defaultData,
            condition: false
        } ), {
            initialProps: {
                id: 1
            }
        } );

        // assertions
        expect( result.current.fetched ).toEqual( "FALSE" );
        expect( result.current.data ).toEqual( defaultData );
    } );

    describe( 'normalize option', () => {
        // constants
        const data = [
            { id: 1, title: "example" },
            { id: 2, title: "example 2" },
            { id: 3, title: "example 3" },
        ];

        it( 'normalizes data properly when normalize:true', async () => {
            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            await act( async () => {
                const { result, waitForNextUpdate } = await renderHook( ( props ) => useFetch( {
                    method: () => Client.get( "/api" ),
                    args: [],
                    normalize: true
                } ), {
                    initialProps: {}
                } );

                await waitForNextUpdate();

                expect( result.current.fetched ).toEqual( "TRUE" );
                expect( result.current.data ).toEqual( {
                    1: { id: 1, title: "example" },
                    2: { id: 2, title: "example 2" },
                    3: { id: 3, title: "example 3" },
                } );
            } );
        } );
        it( 'normalizes data properly when normalize:string', async () => {
            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            await act( async () => {
                const { result, waitForNextUpdate } = await renderHook( ( props ) => useFetch( {
                    method: () => Client.get( "/api" ),
                    args: [],
                    normalize: "title"
                } ), {
                    initialProps: {}
                } );

                await waitForNextUpdate();

                expect( result.current.fetched ).toEqual( "TRUE" );
                expect( result.current.data ).toEqual( {
                    "example": { id: 1, title: "example" },
                    "example 2": { id: 2, title: "example 2" },
                    "example 3": { id: 3, title: "example 3" },
                } );
            } );
        } );
    } );

    describe( 'transformResData', () => {

        it( 'transformResData works fine', async () => {
            // constants
            const data = [
                { id: 1, title: "example" },
                { id: 2, title: "example 2" },
                { id: 3, title: "example 3" },
            ];

            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            await act( async () => {
                const { result, waitForNextUpdate } = await renderHook( ( props ) => useFetch( {
                    method: () => Client.get( "/api" ),
                    args: [],
                    transformResData ( data ) {
                        return normalize( data, "title" );
                    }
                } ), {
                    initialProps: {}
                } );

                await waitForNextUpdate();

                expect( result.current.fetched ).toEqual( "TRUE" );
                expect( result.current.data ).toEqual( {
                    "example": { id: 1, title: "example" },
                    "example 2": { id: 2, title: "example 2" },
                    "example 3": { id: 3, title: "example 3" },
                } );
            } );
        } );

        it( 'works fine if transformResData returns a promise', async () => {
            // constants
            const data = [
                { id: 1, title: "example" },
                { id: 2, title: "example 2" },
                { id: 3, title: "example 3" },
            ];

            // mocks
            Client.get = jest.fn().mockResolvedValue( { data } );

            await act( async () => {
                const { result, waitForNextUpdate } = await renderHook( ( props ) => useFetch( {
                    method: () => Client.get( "/api" ),
                    args: [],
                    transformResData ( data ) {
                        return Promise.resolve( normalize( data, "title" ) );
                    }
                } ), {
                    initialProps: {}
                } );

                await waitForNextUpdate();

                expect( result.current.fetched ).toEqual( "TRUE" );
                expect( result.current.data ).toEqual( {
                    "example": { id: 1, title: "example" },
                    "example 2": { id: 2, title: "example 2" },
                    "example 3": { id: 3, title: "example 3" },
                } );
            } );
        } );

    } );

    it( 'refetches data if dependencies change', async () => {
        // constants
        const data = [
            { id: 1, title: "example" },
            { id: 2, title: "example 2" },
            { id: 3, title: "example 3" },
        ];

        const data_2 = [
            { id: 4, title: "example 4" },
            { id: 5, title: "example 5" },
            { id: 6, title: "example 6" },
        ];

        // mocks
        Client.get = jest.fn().mockImplementation( ( url: string, { params: { id } }: any ) => {
            if ( id === 1 ) return Promise.resolve( { data } );
            return Promise.resolve( { data: data_2 } );
        } );

        await act( async () => {
            const { result, waitForNextUpdate, rerender } = await renderHook( ( props ) => useFetch( {
                method: ( id: number ) => Client.get( "/api", { params: { id } } ),
                args: [props.id],
                dependencies: [props.id]
            } ), {
                initialProps: {
                    id: 1
                }
            } );

            await waitForNextUpdate();

            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( data );

            // change dependency
            rerender( {
                id: 2
            } );

            await waitForNextUpdate();

            expect( result.current.fetched ).toEqual( "TRUE" );
            expect( result.current.data ).toEqual( data_2 );
        } );
    } );

} );
