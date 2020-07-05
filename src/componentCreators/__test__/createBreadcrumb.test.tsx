import { render } from "@testing-library/react";
import {
    createBreadcrumb,
    CrumbType,
    BREADCRUMB_ACTIVE_LINK_CLASS,
    BREADCRUMB_INACTIVE_LINK_CLASS,
    BREADCRUMB_SEPERATOR_WRAPPER,
    BREADCRUMB_WRAPPER_CLASS
} from "../createBreadcrumb";
import React from 'react';
import { BrowserRouter } from "react-router-dom";

// ---------------------------------------------------------------------------------------------

describe( 'createBreadcrumb', () => {
    const crumbs: CrumbType[] = [
        { key: "Books", content: "Books", active: false, href: "/books" },
        { key: "Book Info", content: "Book Info", active: false, href: "/books/1" },
        { key: "Author Info", content: "Author Info", active: true, href: "/books/1/author" },
    ];

    describe( 'renders elements properly', () => {

        const Breadcrumb = createBreadcrumb( {
            defaultIcon: <span data-testid="icon" className="icon">/</span>
        } );

        it( 'renders breadcrumns component properly with active and inactive links', () => {
            const { getByText, getAllByTestId, rerender } = render(
                <BrowserRouter>
                    <Breadcrumb crumbs={ crumbs } />
                </BrowserRouter>
            );

            // active link
            const authorInfo = getByText( /Author Info/ );
            expect( authorInfo ).toBeInstanceOf( HTMLSpanElement );

            // inactive link
            const books = getByText( /Books/ );
            expect( books ).toBeInstanceOf( HTMLAnchorElement );
            expect( books.getAttribute( "href" ) ).toEqual( crumbs[0].href );

            // inactive link 2
            const bookInfo = getByText( /Book Info/ );
            expect( bookInfo ).toBeInstanceOf( HTMLAnchorElement );
            expect( bookInfo.getAttribute( "href" ) ).toEqual( crumbs[1].href );

            // seperators
            const seperator = getAllByTestId( "icon" );
            expect( seperator ).toHaveLength( crumbs.length - 1 );

            // after inserting another crumb
            const newCrumbs = crumbs.concat( [{ key: "New", content: "new", href: "/books/1/author/new-route", active: false }] );
            rerender(
                <BrowserRouter >
                    <Breadcrumb crumbs={ newCrumbs } />
                </BrowserRouter >
            );

            // seperators
            const seperators_2 = getAllByTestId( "icon" );
            expect( seperators_2 ).toHaveLength( newCrumbs.length - 1 );

        } );

        it( 'has proper classNames assigned', () => {
            const { container } = render(
                <BrowserRouter>
                    <Breadcrumb crumbs={ crumbs } />
                </BrowserRouter>
            );

            // container has one "breadcrumb"
            const breadcrumbs = container.querySelectorAll( `.${BREADCRUMB_WRAPPER_CLASS}` );
            expect( breadcrumbs ).toHaveLength( 1 );

            // constainer has 1 active links "breadcrumb--active"
            const activeLinks = container.querySelectorAll( `.${BREADCRUMB_ACTIVE_LINK_CLASS}` );
            expect( activeLinks ).toHaveLength( crumbs.filter( c => c.active ).length );

            // constainer has 2 inactive links "breadcrumb--anchor"
            const inactiveLinks = container.querySelectorAll( `.${BREADCRUMB_INACTIVE_LINK_CLASS}` );
            expect( inactiveLinks ).toHaveLength( crumbs.filter( c => !c.active ).length );

            // constainer has 2 seperators "breadcrumb--icon-wrapper"
            const seperators = container.querySelectorAll( `.${BREADCRUMB_SEPERATOR_WRAPPER}` );
            expect( seperators ).toHaveLength( crumbs.length - 1 );
        } );

    } );

    describe( 'overides classnames properly', () => {
        const activeClass = "active-link";
        const inactiveClass = "inactive-link";
        const iconWrapperClass = "icon-wrapper";

        const Breadcrumb = createBreadcrumb( {
            defaultIcon: <span data-testid="icon" className="icon">/</span>,
            activeLinkClass: activeClass,
            inactiveLinkClass: inactiveClass,
            iconWrapperClass: iconWrapperClass
        } );

        it( 'has proper classNames assigned', () => {
            const { container } = render(
                <BrowserRouter>
                    <Breadcrumb crumbs={ crumbs } />
                </BrowserRouter>
            );

            // container has one "breadcrumb"
            const breadcrumbs = container.querySelectorAll( `.${BREADCRUMB_WRAPPER_CLASS}` );
            expect( breadcrumbs ).toHaveLength( 1 );

            // constainer has 1 active links
            const activeLinks = container.querySelectorAll( `.${activeClass}` );
            expect( activeLinks ).toHaveLength( crumbs.filter( c => c.active ).length );

            // constainer has 2 inactive links
            const inactiveLinks = container.querySelectorAll( `.${inactiveClass}` );
            expect( inactiveLinks ).toHaveLength( crumbs.filter( c => !c.active ).length );

            // constainer has 2 seperators
            const seperators = container.querySelectorAll( `.${iconWrapperClass}` );
            expect( seperators ).toHaveLength( crumbs.length - 1 );
        } );

    } );

    it( 'override icon', () => {
        const Breadcrumb = createBreadcrumb( {
            defaultIcon: <span data-testid="icon" className="icon">/</span>
        } );

        const { rerender, getAllByTestId, queryAllByTestId } = render(
            <BrowserRouter>
                <Breadcrumb crumbs={ crumbs } />
            </BrowserRouter>
        );

        const defaultIcons = getAllByTestId( "icon" );
        expect( defaultIcons ).toHaveLength( crumbs.length - 1 );

        // when over ride is provided
        rerender(
            <BrowserRouter>
                <Breadcrumb crumbs={ crumbs } icon={ <span data-testid="override-icon" className="override-icon">{ ">" }</span> } />
            </BrowserRouter>
        );

        const defaultIcons_2 = queryAllByTestId( "icon" );
        expect( defaultIcons_2 ).toHaveLength( 0 );

        const overides = getAllByTestId( "override-icon" );
        expect( overides ).toHaveLength( crumbs.length - 1 );
    } );


} );
