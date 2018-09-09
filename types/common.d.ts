type Dict<T=any> = { [key: string]: T };

type PartialRecursive<T> = {
    [P in keyof T]?: PartialRecursive<T[P]>;
};

