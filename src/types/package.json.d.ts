export interface PkgJson {
    dependencies?: Dict<string>;
}

export interface PkgLock {
    dependencies: Dict<{
        version: string;
    }>
}
