import React from 'react';

export interface createFormErrorOptions {
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
    icon: React.ReactNode;
}

export interface FormErrorProps {
    /**
     * Boolean which tells whether the form field for focused or not
     * @default undefined
     */
    touched?: boolean;
    /**
     * String which contains error message
     * @default undefined
     */
    error?: string;
    /**
     * allignment of the error message
     * @default "start"
     */
    align?: "start" | "center" | "end";
}

/**
 * Create "FormError" component, that can be instantiated elsewhere
 * - returns -> a react component
 * @example
 * ```js
 * // FormError.js
 * // ...
 * export const FormError = createFormError( {
 *    icon: <i className="warning"></i>
 * } );
 * 
 * // MyForm.js
 * // ...
 * export default () => {
 *     // ...
 *     return (
 *         <form>
 *         //...
 *             <div className="field">
 *                 <label>My Input</label>
 *                 <input />
 *                 <FormError 
 *                     ...
 *                 />
 *             </div>
 *         // ...
 *         </form>
 *     );
 * }
 * ```
 */
const createFormError = ( options: createFormErrorOptions ): React.FC<FormErrorProps> => {
    const {
        icon
    } = options;

    return ( props ) => {
        const { touched, error, align = "start" } = props;

        return (
            <>
                {
                    touched && error && (
                        <span className={ `error-msg align-${align} unselectable` }>
                            { icon }
                            { error }
                        </span>
                    )
                }
            </>
        );
    };
};

export {
    createFormError
};
