// react
import { useRef } from "react";

/**
 * Logs the number of times the component has rerendred after mounting. In development environment
 * @param componentName string
 */
const useCountRenders = ( componentName: string ) => {
    const count = useRef( 0 );

    if ( process.env.NODE_ENV === "development" )
        console.log(
            `${componentName}, rendered for %c${count.current++} '(st/th) time!!!`, "color:red"
        );
};

export {
    useCountRenders
}; 