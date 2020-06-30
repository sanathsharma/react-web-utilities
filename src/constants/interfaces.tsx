export type ObjectType<T = any> = { [x: string]: T; };

export type Fetched = "FALSE" | "FETCHING" | "ERROR" | "TRUE";