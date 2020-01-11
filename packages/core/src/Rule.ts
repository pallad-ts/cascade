export interface Rule<T = any> {
    supports(target: T): boolean;

    run(target: T): void | Promise<void>;

    getRelated(target: T): any[];
}