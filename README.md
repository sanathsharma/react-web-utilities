# react-web-utilities
## Version 0.0.1

React utility library with handy hooks, components, helper functions.

# Table of contents
* [Install](#install)
* [Usage](#usage)
    * [Services](#services)
        * [buildClient](#buildclient)
    * [Core](#core)
        * [Routes](#routes)
        * [LetSuspense](#letsuspense)
    * [Hooks](#hooks)
        * [useCountRenders](#usecountrenders)
        * [useFetch](#usefetch)
    * [Factories](#factories)
        * [ReduxActionConstants](#reduxactionconstants)
    * [Component Creators](#component-creators)
        * [createFormError](#createformerror)
        * [createBreadcrumb](#createbreadcrumb)

# Install
with npm,
```sh
npm install --save @ssbdev/react-web-utilities
```
with yarn,
```sh
yarn add @ssbdev/react-web-utilities
```
# Usage
## Services
### buildClient
Builds a axios instance.

#### Options

Option Name | Type | Default | Required (or) Optional | Description 
-------------|-------|---------|-----------------------|-----------
apiBase | `string` | `undefined` | Required | baseURL for axios
defaultTimeout | `number` | `10000`| Optional | Request Timeout. `0` -> infinite
getToken | `() => string | undefined` | `undefined` | Optional | A function that returns a token string that is attached to **Authorization** header with *bearer*. i.e, `Bearer <token>`
onResponseError | `( error: AxiosError ) => void` | `undefined`| Optional | CallBack that can be used to update / make ui changes based on errors

#### Basic usage

Without token,
```js
const Client = new buildClient( {
    apiBase: "http://localhost:8000"
} );

// ...

Client.put(
    "/api/books",
    // body
    {
        title: "Update title",
        desc: "Updated description"
    },
    // params
    {
        bookId: 21
    }
).then( res => {
    // then block
} ).catch( error => { 
    // catch block
} )

// ...
```

With token,

Attaching token to **Authorization** header can be done by passing a function to **getToken** option which returns the token. Token will be substituted in the placeholder `<token>` as shown below. If the function returns `undefined` then empty string will be substituted instead.

Header will look like,
```js
"Authorization": "Bearer <token>"
```
code,
```js
// api.service.js
// ...
import { buildClient } from "@ssbdev/react-web-utilities";
// ...

const Client = new buildClient( {
    apiBase: "http://localhost:8000",
    getToken() {
        return localStorage.getItem( "token" )
    },
    onResponseError( error ) {
        // e.g, unauthorized error
        if( error.response && error.response.status === 401 ) {
            // redirection logic (or) reenter password popup
            // ...
        }
    }
} );

export {
    Client
}
```
```js
// MyComponent.js
// ...
import { Client } from "./api.service.js";
// ...

export default () => {
    const [data, setData] = useState( [] );

    useEffect( () => {
        Client.post("/api/books", { title: "MyBook", price: 100 } )
            .then( res => {
                setData( res.data );
            } )
            .catch( e => {
                console.log( "ERROR:", e );
            } )
    } , [] )

// ...
}
```

#### Advance Usage
Extend the buildClient class to add custom methods and properties
```js
// api.service.js
// ...
import { buildClient } from "@ssbdev/react-web-utilities";
// ...

class ExtendedClient extends buildClient {
    constructor( options, staticBase ) { // options: IBuildClientOptions
        super( options );

        this._staticBase = staticBase;
    }

    getStaticBase = () => {
        return this._staticBase;
    }

    upload = ( 
        method, // "post" | "put"
        url, // string
        data = {}, // any
        params = {} // Record<string, any>
    ) => {
        return this.instance( {
            method,
            url,
            data,
            params,
            timeout: 0, // infinite
            onUploadProgress ( e ) { // e: ProgressEvent
                const progress = ( e.loaded / e.total ) * 100;
                // logic to indicate the progress on the ui
                // ...
            }
        } );
    };
}

const Client = new ExtendedClient( {
    // options
    // ...
}, "http://localhost:8000/static );
// ...
```

## Core

### Routes
Responsible for rendering all the routes with switch. Uses react-router-dom, "Switch" & "Route" Components

#### Props table

Prop Name | Type | Default | Required (or) Optional | Description 
-------------|-------|---------|-----------------------|-----------
path | `string` | `undefined` | Required | Any valid URL path
component | `React.ComponentType<any>` | `undefined` | Optional | A React component to render only when the location matches. It will be rendered with route props
active | `boolean` | `true` | Optional | When false, route is equivalent to not existing
name | `string` | `undefined` | Optional |A Name for the route, used by the crumb
...rest | `RouteProps` | - | - | rest of ***react-router-dom***'s **RouteProps**. For more info, [click here](https://reacttraining.com/react-router/web/api/Route).

#### Basic usage
```js
// AppRouter.js
// ...
import { Routes } from "@ssbdev/react-web-utilities";
// ...

export default function AppRouter () {
    const routes = [
        { 
            path:"/",
            exact: true,
            component: Home
        },
        { 
            path:"/books",
            exact: true,
            component: Books
        },
        { 
            path:"/books/1",
            exact: true,
            component: BookInfo
        },
        { 
            path:"/books/1/author",
            exact: true,
            component: AuthorInfo
        },
    ];

    return (
        <Routes
            routes={ routes }
            redirectTo="/"
        />
    );
};
```

#### Usage with crumbs
```js
// AppRouter.js
// ...
import { Routes } from "@ssbdev/react-web-utilities";
// ...

export default function AppRouter () {
    const routes = [
        { 
            path:"/",
            exact: true,
            component: Home,
            name: "Home"
        },
        { 
            path:"/books",
            exact: true,
            component: Books,
            name: "All Books"
        },
        { 
            path:"/books/1",
            exact: true,
            component: BookInfo,
            name: "Book"
        },
        { 
            path:"/books/1/author",
            exact: true,
            component: AuthorInfo,
            name: "Author"
        },
    ];

    return (
        <Routes
            routes={ routes }
            crumbs={ true }
            redirectTo="/"
        />
    );
};
```
Basic Breadcrumb navigation component implementation.
or use [createBreadcrumb](#createbreadcrumb) instead.
```js
// Crumbs.js
// ...

export const Crumbs = ( props ) => {
    const { details } = props;

    const renderCrumbs = () => {
        const displayContent = [];

        details.forEach( ( detail, index ) => {
            const {
                key,
                content,
                active,
                href
            } = detail;
            
            displayContent.push(
                <Fragment key={ key }>
                    {
                        active 
                            ? <a href={ href }>{ content }</a>
                            : <span>{ content }</span>
                    }
                </Fragment>
            );

            // if not the last element
            if( details.length !== index + 1 ) {
                displayContent.push( 
                    <span
                        key={`${key}_seperator`} 
                        className="icon"
                    >/</span>
                );
            }
        } );

        return displayContent;
    }

    return (
        <div className="flex row">
            { renderCrumbs() }
        </div>
    );
};
```
"crumbs" prop usage,
```js
// e.g, AuthorInfo.js
// ...
import Crumbs from "./Crumbs";
// ...

export const AuthorInfo = ( props ) => {
    const { crumbs } = props;

    return (
        <div className="flex col">
            <Crumbs details={ crumbs } />
            <div>
                AuthorInfo
                ...
            </div>
        </div>
    );
};
```

### LetSuspense

Implementation inspired by a blog [How to Create a LetSuspense Component in React](https://academind.com/learn/react/a-custom-suspense-component/).

Component that renders a placeholder component, till the condition satisfies for it to display its children. i.e, When condition evaluates `true`, LetSuspense **children** are rendered & when condition evaluates `false`, the **loadingPlaceholder** is rendered **muliplier** number of times.

#### Props table

Prop Name | Type | Default | Required (or) Optional | Description 
-------------|-------|---------|-----------------------|-----------
condition | `boolean` | `false` | Optional | boolean or expression that evaluates to `true` or `false`. `true` -> render the **children**, `false` -> render **loadingPlaceholder**
errorCondition | `boolean` | `false` | Optional |  boolean or expression that evaluates to `true` or `false`. `true` -> render the **errorPlaceholder**, `false` -> render **loadingPlaceholder** / **children** based on **condition** 
loadingPlaceholder | `React.ComponentType<any>` | `undefined` | Required | Component to rendered if loading is true. Constructor of component. i.e, `LoaderComponent` instead of `<LoaderComponent />`
multiplier | `number` | `1` | Optional | The number of placeholders to be rendered
errorPlaceholder | `React.ReactNode` | `undefined` | Optional | Component to rendered if error occurs. Instance of a component, unlike **loadingPlaceholder**. i.e, `<Retry onClick={ ... } />` instead of `Retry`
children | `React.ReactNodeArray | React.ReactNode` | `undefined` | Optional | The actual component(s) that will be rendered when the condition evaluates to `true`
initialDelay | `number` | `0` | Optional | Minimum time (in milliseconds) before a component is rendered

#### Basic usage
```js
// MyComponent.js
// ...
export default ()=>{
    const [data, setData] = useState([]);

    useEffect( () => {
        // ...
        fetchData()
        // ...
    }, [] )

    const fetchData = () => {  
        // api request logic
    }

    return (
        <LetSuspense
            condition={ data.length > 0 }
            loadingPlaceholder={ LoaderComponent }
        >
            {
                data.map( each => (
                   ...
                ) )
            }
        </LetSuspense>
    );
};
```
#### With delay
Useful to show a loding screen event though there is not async dependency, meaning no backend api to hit to fetch the data, but still want to show the loding component for minute amount of time.
```js
// MyComponent.js
// ...
export default ()=>{
    return (
        <LetSuspense
            condition={ true }
            loadingPlaceholder={ LoaderComponent }
            delay={ 500 }
        >
            // ...
        </LetSuspense>
    );
};
```

## Hooks
### useCountRenders
Logs the number of times the component rerendred after mount. Logs only in development environment.

#### Args Table

Arg Name | Type | Default | Required (or) Optional | Description 
-------------|-------|---------|-----------------------|-----------
componentName | `string` | `undefined` | Required | Name of the component. used in the logs detail

#### usage
```js
// MyComponent.js
// ...
export default () => {
    useCountRenders("MyComponent");

    return (
        // jsx
    );
};
```

### useFetch
React hook for fetching data based on condition and dependency array.

#### Options

option | Type | Default | Required (or) Optional | Description 
--------|-------|---------|--------------------------|--------------
method | `( ...args: any ) => Promise<any>` | `undefined` | Required | Reference to the function which returns a Promise
args | `Parameters<method>` | `undefined` | Required | Arguments to the function refered for "method"
dependencies | `any[]` | `[]` | Optional | Refetch based on dependency value change, **useEffect** dependency array
normalize | `boolean | string` | false | Optional | normalizes based on the key provided. `true` -> normalizes by "id" (or) `false` -> directly sets data with the response data (or) `"somekey"` -> normalizes by "somekey"
onError | `( e: AxiosError ) => void` | `undefined` | Optional | Callback that gets called on api request gets rejected with an error
condition | `boolean` | `true` | Optional | Condition to fetch. `true` -> make the api request on fetch Call (or) `false` -> donnot make api request on fetch call

#### Return object

keys | Type | Default | Description 
--------|-------|---------|--------------
fetched | `Fetched` | `"FALSE"` | Tells at what state the api call is in. One of `"FALSE" | "FETCHING" | "ERROR" | "TRUE"`
data | `any` | `null` | Response data or normalized response data
setData | `React.Dispatch<React.SetStateAction<any>>` | - | Function to manipulate "data" state
fetch | `() => void` | - | Function to make the api call. General usecase is to call this function on retry if initial api request fails (`fetched="ERROR"`)

#### Basic Usage

```js
// books.service.js
// ...
import Client from "./api.service.js";

export default {
    getAllBooks() {
        return Client.get( "/api/books" );
    }
    getBookInfo( bookId: number ) {
        return Client.get( "api/books", { id: bookId } );
    }
    // ...other apis
}
```
```js
// MyComponent.js
// ...
import bookService from "./books.service.js";
import { useFetch } from "@ssbdev/react-web-utilities";
import { useParams } from 'react-router-dom';
//...

export default ( props ) => {
    const {
        fetched: booksFetched,
        data: books,
        setData: setBooks,
        fetch: fetchBooks
    } = useFetch( {
        method: bookService.getAllBooks,
        args: [], // args of the above method
    } );

    return {
        "FALSE": <div>Waiting...</div>,
        "FETCHING": <div>Fetching Books...</div>,
        "ERROR": <button onClick={ fetchBooks }>Retry</button>,
        "TRUE": (
            <div className="list">
                {
                    books.map( book => (
                        <span key={ book.id }>{ book.title }</span>
                    ) );
                }
            </div>
        )
    }[booksFetched];
};
```

## Factories
### ReduxActionConstants
Constructor that create a set of strings that can be used as Redux Action Types.

#### usage

```js
// books.actions.js
// ...
const BOOKS = new ReduxActionConstants( "books" );

console.log( Books );
// output
// {
//     ENTITY: "BOOKS";
//     INSERT: "[BOOKS] INSERT";
//     UPDATE: "[BOOKS] UPDATE";
//     REMOVE: "[BOOKS] REMOVE";
//     BULK_INSERT: "[BOOKS] BULK_INSERT";
//     BULK_UPDATE: "[BOOKS] BULK_UPDATE";
//     BULK_REMOVE: "[BOOKS] BULK_REMOVE";
//     SET: "[BOOKS] SET";
//     UNSET: "[BOOKS] UNSET";
//     RESET: "[BOOKS] RESET";
// }

const reducer_setBooks = ( books ) => ( {
    type: BOOKS.SET,
    payload: {
        books
    }
} );

export {
    reducer_setBooks,
    BOOKS
}
```
```js
// books.reducer.js
import BOOKS from "./books.actions.js";
// ...

const initialState = {
    books: []
};

const booksReducer = ( state=initialState, action ) => {
    switch(action.type) {
        case BOOKS.SET: {
            const { books } = action.payload;
            return {
                ...state,
                books: books
            }
        }
        default: return state;
    }
};

export {
    booksReducer,
    initialState as booksInit
}
```

## Component Creators
### createFormError
Create "FormError" component, that can be instantiated elsewhere. Returns a react component

#### createFormError options

option | Type | Default | Required (or) Optional | Description 
--------|-------|---------|--------------------------|--------------
icon | `React.ReactNode` | `undefined` | Required | icon node.

Example for `icon` option,
```html
<!-- fa icons -->
<i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
<!-- material icons -->
<span class="material-icons">warning</span>
```

#### FormError props

prop name | Type | Default | Required (or) Optional | Description 
--------|-------|---------|--------------------------|--------------
touched | `boolean` | `undefined` | Optional | Boolean which tells whether the form field for focused or not
error | `string` | `undefined` | Optional | String which contains error message
align | `"start" | "center" | "end"` | `"start"` | Optional | allignment of the error message

#### Basic usage
```js
// FormError.js
// ...
import { createFormError } from "@ssbdev/react-web-utilities";

export const FormError = createFormError( {
   icon: <i className="warning"></i>
} );
```
```js
// MyForm.js
import { FormError } from "./FormError.js";
// ...

export default () => {
    // ...
    return (
        <form>
        //...
            <div className="field">
                <label>My Input</label>
                <input />
                <FormError 
                    ...
                />
            </div>
        // ...
        </form>
    );
};
```

### createBreadcrumb
Create "Breadcrumb" navigation component, that can be instantiated elsewhere. Returns a react component.

#### createBreadcrumb options

option | Type | Default | Required (or) Optional | Description 
--------|-------|---------|--------------------------|--------------
defaultIcon | `React.ReactNode` | `undefined` | Required | icon node.
activeLinkClass | `string` | `"breadcrumb--active"` | Optional | ClassName given to active crumb link
inactiveLinkClass | `string` | `"breadcrumb--anchor"` | Optional | ClassName given to inactive crumb link

Example for `icon` option,
```html
<!-- fa icons -->
<i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
<!-- material icons -->
<span class="material-icons">warning</span>
```

#### Breadcrumb props

prop name | Type | Default | Required (or) Optional | Description 
------------|-------|---------|--------------------------|--------------
crumbs | [`CrumbType`](#crumbtype)`[]` | `undefined` | Required | crumb details passed along with **routeProps**. \***Note*:** Avaliable in RouteComponentProps only when used in components rendred by "Routes" component
icon | `React.ReactNode` | defaultIcon | Optional | override defaultIcon

#### CrumbType
key name | Type | Description 
------------|-------|--------------
key | `string` | unique key
content | `string` | Content that identifies the the path
active | `boolean` | Indicates whether the path visited is this path or not
href | `string` | path

#### Basic usage
```js
// Breadcrumb.js
// ...
import { createBreadcrumb } from "@ssbdev/react-web-utilities";

export const Breadcrumb = createBreadcrumb( {
    icon: <i className="angle right"></i>
} );
```
```js
// MyRouteComponent.js
import { Breadcrumb } from "./Breadcrumb.js";
// ...

export default ( props ) => {
    const { crumbs } = props;

    return (
        <div className="flex col">
            <Breadcrumb crumbs={ crumbs } />
            <div>
                AuthorInfo
            </div>
        </div>
    );
};
```

# License & copyright

© Sanath Sharma

Licensed under [MIT License](LICENSE)

