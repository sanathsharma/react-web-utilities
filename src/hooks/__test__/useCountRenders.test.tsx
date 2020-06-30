import { useCountRenders } from "../useCountRenders";
import { render } from "@testing-library/react";
import React from 'react';

describe( 'useCountRenders', () => {

    describe( 'logs count', () => {
        let consoleLogs: string[] = [];

        // mock console.log
        console.log = jest.fn(
            function ( ...args: string[] ) {
                consoleLogs.push( args.toString() );
            }
        );

        beforeEach( () => consoleLogs = [] );

        it( 'logs the render count to the console', () => {
            // mock develop ment environment for this test only
            // TODO: find a better way to test this
            process.env.NODE_ENV = "development";

            const Wrapper: React.FC = () => {
                useCountRenders( "Wrapper" );

                return null;
            };

            const { rerender, container } = render( <Wrapper /> );
            rerender( <Wrapper /> );
            expect( consoleLogs ).toHaveLength( 2 );

            // change the env after the test runs
            process.env.NODE_ENV = "test";
        } );

    } );

} );

