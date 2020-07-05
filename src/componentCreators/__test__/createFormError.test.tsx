import { createFormError } from "../createFormError";
import { render, getByTestId } from "@testing-library/react";
import React from 'react';

// --------------------------------------------------------------------------------------------------

describe( 'createFormError', () => {

    const FormError = createFormError( {
        icon: <span data-testid="icon" className="icon">ERROR: </span>
    } );

    it( 'renders icon and error message if error is present and touched is true', () => {
        const errorMsg = "Some Error";
        const { container, queryByText } = render( <FormError error={ errorMsg } touched={ true } /> );

        const errorContainer = getByTestId( container, "error-msg" );

        // fails if icon not found
        getByTestId( errorContainer, "icon" );

        const error = queryByText( errorMsg );
        expect( error ).not.toBeNull();
    } );

    it( 'doesnot render if error is undefined', () => {
        const { queryByTestId } = render( <FormError touched={ true } /> );

        const errorContainer = queryByTestId( "error-msg" );
        expect( errorContainer ).toBeNull();
    } );

    it( 'doesnot render if touched is false', () => {
        const { queryByTestId } = render( <FormError touched={ false } error="Some Error" /> );

        const errorContainer = queryByTestId( "error-msg" );
        expect( errorContainer ).toBeNull();
    } );

    describe( 'alignment', () => {
        it( 'apply align-start class properly', () => {
            const { getByTestId } = render( <FormError touched={ true } error="Some Error" align="start" /> );

            const errorContainer = getByTestId( "error-msg" );
            expect( errorContainer.classList.contains( "align-start" ) ).toBeTruthy();
        } );

        it( 'apply align-end class properly', () => {
            const { getByTestId } = render( <FormError touched={ true } error="Some Error" align="end" /> );

            const errorContainer = getByTestId( "error-msg" );
            expect( errorContainer.classList.contains( "align-end" ) ).toBeTruthy();
        } );

        it( 'apply align-center class properly', () => {
            const { getByTestId } = render( <FormError touched={ true } error="Some Error" align="center" /> );

            const errorContainer = getByTestId( "error-msg" );
            expect( errorContainer.classList.contains( "align-center" ) ).toBeTruthy();
        } );

    } );

} );
