import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

// ---------------------------------------------------------------------------------------------

// TODO: add hoverText for title of the links
export type CrumbType = {
    /**
     * unique key
     */
    key: string;
    /**
     * Content that identifies the the path
     */
    content: string;
    /**
     * Indicates whether the path visited is this path or not
     */
    active: boolean;
    /**
     * path
     */
    href: string;
};

// ---------------------------------------------------------------------------------------------

export interface createBreadcrumbOptions {
    /**
    * icon node
    * @example
    * ```html
    * <!-- fa icons -->
    * <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
    * <!-- material icons -->
    * <span class="material-icons">warning</span>
    * ```
    */
    defaultIcon: React.ReactNode;
    /**
     * ClassName give to active crumb link
     * @default "breadcrumb--active"
     */
    activeLinkClass?: string;
    /**
     * ClassName given to inactive crumb link
     * @default "breadcrumb--anchor"
     */
    inactiveLinkClass?: string;
    /**
     * ClassName given for each seperator icon-wrapper
     * @default "breadcrumb--icon-wrapper"
     */
    iconWrapperClass?: string;
}

export interface BreadcrumbProps {
    /**
     * crumb details passed along with routeProps.
     * **Note:** Avaliable in RouteComponentProps only when used in components rendred by "Routes" component
     */
    crumbs: CrumbType[];
    /**
     * override defaultIcon
     * - @default defaultIcon
     */
    icon?: React.ReactNode;
}

// ---------------------------------------------------------------------------------------------

const BREADCRUMB_WRAPPER_CLASS = "breadcrumb";
const BREADCRUMB_ACTIVE_LINK_CLASS = "breadcrumb--active";
const BREADCRUMB_INACTIVE_LINK_CLASS = "breadcrumb--anchor";
const BREADCRUMB_SEPERATOR_WRAPPER = "breadcrumb--icon-wrapper";

// ---------------------------------------------------------------------------------------------

/**
 * Create "Breadcrumb" navigation component, that can be instantiated elsewhere.
 * - returns -> a react component
 * @example
 * ```js
 * // Breadcrumb.js
 * // ...
 * export const Breadcrumb = createBreadcrumb( {
 *     icon: <i className="angle right"></i>
 * } );
 * 
 * // MyRouteComponent.js
 * // ...
 * export default ( props ) => {
 *     const { crumbs } = props;
 * 
 *     return (
 *         <div className="flex col">
 *             <Breadcrumb crumbs={ crumbs } />
 *             <div>
 *                 AuthorInfo
 *             </div>
 *         </div>
 *     );
 * }
 * ```
 */
const createBreadcrumb = ( options: createBreadcrumbOptions ): React.FC<BreadcrumbProps> => {
    const {
        defaultIcon,
        activeLinkClass = BREADCRUMB_ACTIVE_LINK_CLASS,
        inactiveLinkClass = BREADCRUMB_INACTIVE_LINK_CLASS,
        iconWrapperClass = BREADCRUMB_SEPERATOR_WRAPPER
    } = options;

    return ( props ) => {
        const {
            crumbs,
            icon = defaultIcon
        } = props;

        const renderCrumbs = () => {
            const displayContent: React.ReactNode[] = [];

            crumbs.forEach( ( detail, index ) => {
                const {
                    key,
                    content,
                    active,
                    href
                } = detail;

                displayContent.push(
                    <Fragment key={ key }>
                        {
                            !active
                                ? (
                                    <NavLink
                                        to={ href }
                                        className={ inactiveLinkClass }
                                    >
                                        { content }
                                    </NavLink>
                                )
                                : <span className={ activeLinkClass }>{ content }</span>
                        }
                    </Fragment>
                );

                // if not the last element
                if ( crumbs.length !== index + 1 ) {
                    displayContent.push(
                        <span
                            key={ `${key}_seperator` }
                            className={ iconWrapperClass }>
                            { icon }
                        </span>
                    );
                }
            } );

            return displayContent;
        };

        return (
            <div className={ BREADCRUMB_WRAPPER_CLASS }>
                { renderCrumbs() }
            </div>
        );
    };
};

// ---------------------------------------------------------------------------------------------

export {
    createBreadcrumb,
    BREADCRUMB_WRAPPER_CLASS,
    BREADCRUMB_ACTIVE_LINK_CLASS,
    BREADCRUMB_INACTIVE_LINK_CLASS,
    BREADCRUMB_SEPERATOR_WRAPPER,
};