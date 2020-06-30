import { Fetched } from "../constants";

const changeFetched = ( entity: string, fetched: Fetched ) => ( {
    type: `[${entity}] CHANGE_FETCHED`,
    fetched
} );

export {
    changeFetched
};