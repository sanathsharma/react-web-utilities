import { render, waitFor } from "@testing-library/react";
import { LetSuspense } from "../LetSuspense";
import React from "react";

describe( 'LetSuspense', () => {
    const children = (
        <main data-testid="content">
            <header>Lorem, ipsum.</header>
            <section>
                Lorem ipsum dolor sit amet.
            </section>
            <footer>Lorem, ipsum dolor.</footer>
        </main>
    );
    const loadingPlaceholder = <div data-testid="loading">loading...</div>;
    const errorPlaceholder = <div data-testid="error">Error!!</div>;

    it( 'renders loadingPlaceholder if condition is false', () => {
        const { queryByTestId } = render(
            <LetSuspense
                loadingPlaceholder={ () => loadingPlaceholder }
                condition={ false }
            >
                { children }
            </LetSuspense>
        );

        const loading = queryByTestId( "loading" );
        expect( loading ).not.toBeNull();
    } );

    it( 'renders multiplier * loadingPlaceholder if condition is false', () => {
        const { getAllByTestId } = render(
            <LetSuspense
                loadingPlaceholder={ () => loadingPlaceholder }
                condition={ false }
                multiplier={ 5 }
            >
                { children }
            </LetSuspense>
        );

        const loading = getAllByTestId( "loading" );
        expect( loading ).toHaveLength( 5 );
    } );

    it( 'renders errorPlaceholder if error is true', () => {
        const { queryByTestId } = render(
            <LetSuspense
                loadingPlaceholder={ () => loadingPlaceholder }
                condition={ false }
                errorPlaceholder={ errorPlaceholder }
                errorCondition={ true }
            >
                { children }
            </LetSuspense>
        );

        const loading = queryByTestId( "loading" );
        expect( loading ).toBeNull();

        const error = queryByTestId( "error" );
        expect( error ).not.toBeNull();
    } );

    it( 'renders children if error is false and confition is true', () => {
        const { queryByTestId } = render(
            <LetSuspense
                loadingPlaceholder={ () => loadingPlaceholder }
                condition={ true }
                errorPlaceholder={ errorPlaceholder }
                errorCondition={ false }
            >
                { children }
            </LetSuspense>
        );

        const loading = queryByTestId( "loading" );
        expect( loading ).toBeNull();

        const error = queryByTestId( "error" );
        expect( error ).toBeNull();

        const content = queryByTestId( "content" );
        expect( content ).not.toBeNull();
    } );

    it( 'renders children if after the delay if provided', () => {
        const delay = 1000;
        const { queryByTestId } = render(
            <LetSuspense
                loadingPlaceholder={ () => loadingPlaceholder }
                condition={ true }
                initialDelay={ delay }
            >
                { children }
            </LetSuspense>
        );

        const loading = queryByTestId( "loading" );
        expect( loading ).not.toBeNull();

        const content = queryByTestId( "content" );
        expect( content ).toBeNull();

        waitFor( () => {
            const loading = queryByTestId( "loading" );
            expect( loading ).toBeNull();

            const content = queryByTestId( "content" );
            expect( content ).not.toBeNull();
        }, {
            timeout: delay
        } );
    } );

} );
