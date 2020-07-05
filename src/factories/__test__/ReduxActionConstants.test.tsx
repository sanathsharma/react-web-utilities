import { ReduxActionConstants } from "../ReduxActionConstants";

it( 'has proper properties on instantiation', () => {
    const BOOKS = new ReduxActionConstants( "books" );

    expect( BOOKS ).toEqual( {
        ENTITY: "BOOKS",
        INSERT: "[BOOKS] INSERT",
        UPDATE: "[BOOKS] UPDATE",
        REMOVE: "[BOOKS] REMOVE",
        BULK_INSERT: "[BOOKS] BULK_INSERT",
        BULK_UPDATE: "[BOOKS] BULK_UPDATE",
        BULK_REMOVE: "[BOOKS] BULK_REMOVE",
        SET: "[BOOKS] SET",
        UNSET: "[BOOKS] UNSET",
        RESET: "[BOOKS] RESET"
    } );
} );
