/**
 * Constructor that create a set of strings that can be used as Redux Action Types.
 * - **Note:** extend the contructor to add custom Action Types
 */
class ReduxActionConstants {
    /** 
     * entity name 
     * @example BOOK, AUTHOR, etc.
    */
    ENTITY: string;
    /** 
     * insert/add single data(object/key-value) in array/object
    */
    INSERT: string;
    /** 
     * update single data(object/key-value) in array/object
    */
    UPDATE: string;
    /**
     * remove/delete single data(object/key-value) in array/object
     */
    REMOVE: string;
    /**
     * insert/add multiple data(object/key-value) in array/object
    */
    BULK_INSERT: string;
    /**
    * update multiple data(object/key-value) in array/object
    */
    BULK_UPDATE: string;
    /**
    * remove/delete multiple data(object/key-value) in array/object
    */
    BULK_REMOVE: string;
    /**
     * set a key on the first level of the reducer with data
     */
    SET: string;
    /**
    * set a key on the first level of the reducer with undefined/null/NaN/etc.
    */
    UNSET: string;
    /**
     * reset all the values of the reducer with defaults
     */
    RESET: string;

    constructor( entityName: string ) {
        const entity = entityName.trim().toUpperCase();
        this.ENTITY = entity;
        this.INSERT = `[${entity}] INSERT`;
        this.UPDATE = `[${entity}] UPDATE`;
        this.REMOVE = `[${entity}] REMOVE`;
        this.BULK_INSERT = `[${entity}] BULK_INSERT`;
        this.BULK_UPDATE = `[${entity}] BULK_UPDATE`;
        this.BULK_REMOVE = `[${entity}] BULK_REMOVE`;
        this.SET = `[${entity}] SET`;
        this.UNSET = `[${entity}] UNSET`;
        this.RESET = `[${entity}] RESET`;

        Object.setPrototypeOf( this, ReduxActionConstants.prototype );
    };
}

export {
    ReduxActionConstants
};