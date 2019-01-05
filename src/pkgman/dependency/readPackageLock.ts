export interface PackageLockDeps{
  [name: string]: {
    version: string;
    dependencies?: PackageLockDeps;
  };
}

export interface PackageLock {
  dependencies?:PackageLockDeps;
}
