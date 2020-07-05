import React from 'react';
import { Router, RouteComponentProps } from 'react-router-dom';
import { render, queryByTestId, waitFor } from '@testing-library/react';
import { Routes, IRoutes } from '../Routes';
import { createMemoryHistory } from "history";

describe( 'Routes', () => {
    const history = createMemoryHistory();

    const text = ( comp: "Home" | "Books" | "Book Info", url: string, crumbLength: number | "NA" ) => `${comp}: ${url} | Crumbs = ${crumbLength}`;

    const assertBookInfo = ( container: HTMLElement, crumbLength: number | "NA" ) => {
        const home = queryByTestId( container, "home" );
        expect( home ).toBeNull();

        const books = queryByTestId( container, "books" );
        expect( books ).toBeNull();

        const bookInfo = queryByTestId( container, "book-info" );
        expect( bookInfo ).not.toBeNull();
        expect( bookInfo?.innerHTML ).toEqual( text( "Book Info", "/books/1", crumbLength ) );
    };

    const assertHome = ( container: HTMLElement, crumbLength: number | "NA" ) => {
        const home = queryByTestId( container, "home" );
        expect( home ).not.toBeNull();
        expect( home?.innerHTML ).toEqual( text( "Home", "/", crumbLength ) );

        const books = queryByTestId( container, "books" );
        expect( books ).toBeNull();

        const bookInfo = queryByTestId( container, "book-info" );
        expect( bookInfo ).toBeNull();
    };

    const assertBooks = ( container: HTMLElement, crumbLength: number | "NA" ) => {
        const home = queryByTestId( container, "home" );
        expect( home ).toBeNull();

        const books = queryByTestId( container, "books" );
        expect( books ).not.toBeNull();
        expect( books?.innerHTML ).toEqual( text( "Books", "/books", crumbLength ) );

        const bookInfo = queryByTestId( container, "book-info" );
        expect( bookInfo ).toBeNull();
    };

    const routes = ( type: "render" | "component" ): IRoutes[] => [
        {
            path: "/",
            [type]: ( props: RouteComponentProps ) => <div data-testid="home">{ text( "Home", props.match.url, props.crumbs?.length ?? "NA" ) }</div>,
            exact: true,
            name: "Home"
        },
        {
            path: "/books",
            [type]: ( props: RouteComponentProps ) => <div data-testid="books">{ text( "Books", props.match.url, props.crumbs?.length ?? "NA" ) }</div>,
            exact: true,
            name: "Books"
        },
        {
            path: "/books/:bookId",
            [type]: ( props: RouteComponentProps ) => <div data-testid="book-info">{ text( "Book Info", props.match.url, props.crumbs?.length ?? "NA" ) }</div>,
            exact: true,
            name: "Book Info"
        }
    ];

    afterEach( () => history.replace( "/" ) );

    describe( 'component prop', () => {
        it( 'renders component properly', () => {
            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "component" ) } />
                </Router>
            );

            assertHome( container, "NA" );

        } );

        it( 'changes component on route change', () => {

            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "component" ) } />
                </Router>
            );

            history.push( "/books" );

            assertBooks( container, "NA" );

            history.push( "/books/1" );

            // route change
            assertBookInfo( container, "NA" );

        } );

        it( 'renders component properly with crumbs', () => {

            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "component" ) } crumbs={ true } />
                </Router>
            );

            assertHome( container, 1 );

        } );

        it( 'changes component on route change with crumbs', () => {

            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "component" ) } crumbs={ true } />
                </Router>
            );

            history.push( "/books" );

            assertBooks( container, 2 );

            history.push( "/books/1" );

            // route change
            assertBookInfo( container, 3 );

        } );

    } );

    describe( 'redirect prop', () => {
        it( 'redirect to specified route if url is wrong', () => {
            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "component" ) } redirectTo="/" />
                </Router>
            );

            history.push( "/unknown-page" );
            expect( history.location.pathname ).toBe( "/" );

            assertHome( container, "NA" );
        } );

        it( 'doesnot render any component if url is wrong and redirect is not specified', () => {
            const { queryByTestId } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "component" ) } />
                </Router>
            );

            history.push( "/unknown-page" );
            expect( history.location.pathname ).toBe( "/unknown-page" );

            const home = queryByTestId( "home" );
            expect( home ).toBeNull();

            const books = queryByTestId( "books" );
            expect( books ).toBeNull();

            const bookInfo = queryByTestId( "book-info" );
            expect( bookInfo ).toBeNull();
        } );

    } );

    describe( 'render prop', () => {

        it( 'renders component properly', () => {
            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "render" ) } />
                </Router>
            );

            assertHome( container, "NA" );

        } );

        it( 'changes component on route change', () => {

            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "render" ) } />
                </Router>
            );

            history.push( "/books" );

            assertBooks( container, "NA" );

            history.push( "/books/1" );

            // route change
            assertBookInfo( container, "NA" );

        } );

        it( 'renders component properly with crumbs', () => {

            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "render" ) } crumbs={ true } />
                </Router>
            );

            assertHome( container, 1 );

        } );

        it( 'changes component on route change with crumbs', () => {

            const { container } = render(
                <Router history={ history }>
                    <Routes routes={ routes( "render" ) } crumbs={ true } />
                </Router>
            );

            history.push( "/books" );

            assertBooks( container, 2 );

            history.push( "/books/1" );

            // route change
            assertBookInfo( container, 3 );

        } );
    } );

    describe( 'active prop', () => {
        const routes: IRoutes[] = [
            { path: "/", component: () => <div data-testid="home">Home</div>, active: true, exact: true },
            { path: "/books", component: () => <div data-testid="books">Books</div>, active: false },
        ];

        it( 'doesnt render component if active is false', () => {
            const { queryByTestId } = render(
                <Router history={ history }>
                    <Routes routes={ routes } />
                </Router>
            );

            history.push( "/books" );
            expect( history.location.pathname ).toEqual( "/books" );

            const home = queryByTestId( "home" );
            expect( home ).toBeNull();

            const books = queryByTestId( "books" );
            expect( books ).toBeNull();
        } );

        it( 'redirect if active is true and redirect url is provided', () => {
            const { queryByTestId } = render(
                <Router history={ history }>
                    <Routes routes={ routes } redirectTo="/" />
                </Router>
            );

            history.push( "/books" );
            waitFor( () => {
                expect( history.location.pathname ).toEqual( "/" );

                const home = queryByTestId( "home" );
                expect( home ).not.toBeNull();

                const books = queryByTestId( "books" );
                expect( books ).toBeNull();
            } );
        } );

    } );

} );


// TODO: testing with exact true and false