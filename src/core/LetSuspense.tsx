/**
 * - inspired By
 * @link https://academind.com/learn/react/a-custom-suspense-component/
 */

// react
import React, { Fragment, useEffect, useState } from 'react';

// vendors
import { times } from 'lodash';

// services
// utils
// core
// redux
// ui-components
// others
// scss
// lazy
// interfaces and types

export interface LetSuspenseProps {
    /**
     * boolean or expression that evaluates to true or false
     * - `true` -> render the **children**
     * - `false` -> render **loadingPlaceholder**
    * @default false
    */
    condition?: boolean;
    /**
     * boolean or expression that evaluates to true or false
     * - `true` -> render the **errorPlaceholder**
     * - `false` -> render **loadingPlaceholder** / **children** based on **condition**
     * @default false
     */
    errorCondition?: boolean;
    /**
     * Component to rendered if loading is true
     * - Constructor of component
     * @default undefined
     */
    loadingPlaceholder: React.ComponentType<any>;
    /**
     * The number of placeholders to be rendered
     * @default 1
     */
    multiplier?: number;
    /**
     * Component to rendered if error occurs
     * - Instance of component
     * @default undefined
     */
    errorPlaceholder?: React.ReactNode;
    /**
     * The actual component(s) that will be rendered when the condition is true
     * @default undefined
     */
    children?: React.ReactNodeArray | React.ReactNode;
    /**
     * Minimum time (in milliseconds) before a component is rendered
     * @default 0
     */
    initialDelay?: number;
}

/**
 * Component that renders a placeholder component, 
 * till the condition satisfies for it to display its children.
 * @example
 * ```js
 * // MyComponent.js
 * // ...
 * export default ()=>{
 *     const [data, setData] = useState([]);
 * 
 *     useEffect( () => {
 *         // ...
 *         fetchData()
 *         // ...
 *     }, [] )
 * 
 *     const fetchData = () => {  ...  }
 * 
 *     return (
 *         <LetSuspense
 *             condition={ data.length > 0 }
 *             loadingPlaceholder={ LoaderComponent }
 *         >
 *             {
 *                 data.map( each => (
 *                    ...
 *                 ) )
 *             }
 *         </LetSuspense>
 *     )
 * }
 * ```
 */
const LetSuspense: React.FC<LetSuspenseProps> = ( props ) => {

    // ----------------------------------------- props --------------------------------------

    const {
        children,
        errorPlaceholder,
        loadingPlaceholder: LoadingPlaceholder,
        condition = false,
        multiplier = 1,
        errorCondition = false,
        initialDelay = 0
    } = props;

    // ---------------------------------------- states --------------------------------------

    const [component, setComponent] = useState<React.ReactNodeArray>( [] );

    // ------------------------------------- side effects ----------------------------------

    useEffect( () => {
        let timeout: any = null;

        // if error placeholder has to be shown in case of error
        if ( errorPlaceholder && errorCondition ) {
            setComponent( [errorPlaceholder] );
        } else if ( condition ) {
            // if condition evaluates true
            if ( initialDelay ) {
                // show loding till timeout ends
                setComponent( times( multiplier, ( index ) => <LoadingPlaceholder key={ index } /> ) );

                timeout = setTimeout( () => {
                    // return children if timeout complete
                    setComponent( [children] );
                }, initialDelay );
            } else {
                // render childern
                setComponent( [children] );
            }
        } else {
            // if !condition (condition evaluates false) render loading placeholders
            setComponent( times( multiplier, ( index ) => <LoadingPlaceholder key={ index } /> ) );
        }
        return () => {
            // cleanup on component unmount
            if ( timeout ) clearTimeout( timeout );
        };
    }, [children, condition, errorCondition] );

    return (
        <Fragment>
            { component.map( ( component, index ) => (
                <Fragment key={ index }>{ component } </Fragment>
            ) ) }
        </Fragment>
    );
};

export {
    LetSuspense
};