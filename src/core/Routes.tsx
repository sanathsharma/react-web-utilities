// react 
import React, { Fragment } from 'react';

// vendors
import { Switch, Route, Redirect, RouteProps } from 'react-router-dom';
import { CrumbType } from '../componentCreators/createBreadcrumb';

// services
// utils
// core
// ui-components
// others
// scss

declare module "react-router-dom" {
    export interface RouteComponentProps {
        /**
         * This key is added to RouteComponentProps by "@ssbdev/react-web-utilities".
         * With usage of "Routes" component and prop "crumbs" being true,
         * this key will be populated with crumbs info.
         */
        crumbs: CrumbType[] | undefined;
    }
}

export interface IRoutes extends RouteProps {
    /**
     * Any valid URL path.
     * @default undefined
     */
    path: string;
    /**
     * A React component to render only when the location matches. It will be rendered with route props.
     * @default undefined
     */
    component?: React.ComponentType<any>;
    /**
     * When false, route is equivalent to not existing
     * @default true
     */
    active?: boolean;
    /**
     * A Name for the route, used by the crumb.
     * @default undefined
     */
    name?: string;
}

export interface RoutesProps {
    /**array of objects containing "path", "component", "exact" for each route */
    routes: IRoutes[];
    /**
     * path to redirect if other paths in the switch does not match
     * @default undefined
     */
    redirectTo?: string;
    /**
     * When true, adds a prop called "crumbs" of type "Crumb" to the component or render method
     */
    crumbs?: boolean;
}

/**
 * Responsible for rendering all the routes with switch
 * - Uses react-router-dom, "Switch" & "Route" Components
 * @example
 * ```js
 * // AppRouter.js
 * // ...
 * export default function AppRouter () {
 *     const routes = [
 *         { path:"/", exact: true,  component: Home, name: "Home" },
 *         { path:"/books", exact: true,  component: Books, name: "All Books" },
 *         { path:"/books/1", exact: true,  component: BookInfo, name: "Book" },
 *         { path:"/books/1/author", exact: true,  component: AuthorInfo, name: "Author" },
 *     ];
 * 
 *     return (
 *         <Routes
 *             routes={ routes }
 *             crumbs={ true }
 *             redirectTo="/"
 *         />
 *     )
 * }
 * ```
 */
const Routes = ( props: RoutesProps ) => {
    const { routes, redirectTo, crumbs = false } = props;

    const renderRoutes = () => {
        return routes
            .map( ( {
                component: Component,
                path,
                active = true,
                render,
                ...rest
            } ) => {
                if ( !active ) return null;
                else if ( crumbs ) return <Route
                    key={ path }
                    path={ path }
                    render={ props => {
                        /**
                         * @link https://medium.com/@mattywilliams/generating-an-automatic-breadcrumb-in-react-router-fed01af1fc3
                         */

                        let crumbs = routes
                            // Get all routes that contain the current one.
                            .filter( ( { path } ) => props.match.path.includes( path ) )
                            // Swap out any dynamic routes with their param values.
                            // E.g. "/pizza/:pizzaId" will become "/pizza/1"
                            .map( ( { path, ...rest } ) => ( {
                                path: Object.keys( props.match.params ).length
                                    ? Object.keys( props.match.params ).reduce(
                                        ( path, param ) => path.replace(
                                            `:${param}`, props.match.params[param]
                                        ), path
                                    )
                                    : path,
                                ...rest
                            } ) );

                        const sections: CrumbType[] = crumbs.map( ( { name = "", path } ) => ( {
                            key: name,//TODO: generate a unique key
                            content: name,
                            active: props.match.url === path,
                            href: path
                        } ) );

                        return (
                            <Fragment>
                                {
                                    render
                                        ? render( { crumbs: sections, ...props } )
                                        : Component ?
                                            <Component crumbs={ sections } { ...props } />
                                            : null
                                }
                            </Fragment>
                        );
                    } }
                />;
                return (
                    <Route
                        key={ path }
                        path={ path }
                        component={ Component }
                        render={ render }
                        { ...rest }
                    />
                );
            } )
            .filter( Boolean );
    };

    return (
        <>
            <Switch>
                { renderRoutes() }
                { redirectTo && <Redirect to={ redirectTo } /> }
            </Switch>
        </>
    );
};

export {
    Routes
};