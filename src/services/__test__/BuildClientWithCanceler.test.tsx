import { BuildClientWithCanceler } from '../BuildClientWithCanceler';

describe( 'BuildClientWithCanceler', () => {

    it( 'basic usage', async () => {
        const client = new BuildClientWithCanceler( {
            baseURL: ""
        } );

        client.get = jest.fn().mockImplementation( () => [
            jest.fn().mockResolvedValue( {
                data: [{ title: "books" }]
            } ),
            jest.fn()
        ] );

        try {
            const [promise, canceler] = client.get( "" );
            const { data } = await promise;
            expect( data ).toEqual( [{ title: "books" }] );
        } catch ( e ) {
            if ( client.isCancel( e ) ) {
                return console.log( "Request Canceled" );
            };
            console.log( e );
        }
    } );

    it( 'extended usage', async () => {
        const client = new BuildClientWithCanceler( {
            baseURL: ""
        } );

        client.get = jest.fn().mockImplementation( () => [
            jest.fn().mockResolvedValue( {
                data: [{ title: "books" }]
            } ),
            jest.fn()
        ] );

        const BOOKS = {
            url: "",
            isCancel: client.isCancel,
            get () {
                return client.get( this.url );
            },
            update ( details: any ) {
                return client.put( this.url, details );
            },
            create ( book: any ) {
                return client.post( this.url, book );
            }
        };

        try {
            const [promise, canceler] = BOOKS.get();
            const { data } = await promise;
            expect( data ).toEqual( [{ title: "books" }] );
        } catch ( e ) {
            if ( BOOKS.isCancel( e ) ) {
                return console.log( "Request Canceled" );
            };
            console.log( e );
        }
    } );

    // it( 'canceler', async () => {
    //     const client = new BuildClientWithCanceler( {
    //         baseURL: ""
    //     } );

    //     client.get = jest.fn().mockImplementation( () => [
    //         new Promise( ( resolve, reject ) => {
    //             setTimeout( () => {
    //                 resolve( {
    //                     data: [{ title: "books" }]
    //                 } );
    //             }, 1000 );
    //         } ),
    //         jest.fn()
    //     ] );

    //     try {
    //         const [promise, canceler] = client.get( "" );
    //         await promise;
    //     } catch ( e ) {
    //         console.log( 'client.isCancel( e )  :', client.isCancel( e ) );
    //         expect( client.isCancel( e ) ).toBeTruthy();
    //     }
    // } );
} );

