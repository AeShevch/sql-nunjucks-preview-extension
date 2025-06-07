export class DIContainer {
    private services: Map<string, any> = new Map();
    private factories: Map<string, () => any> = new Map();

    register<T>(key: string, instance: T): void {
        this.services.set(key, instance);
    }

    registerFactory<T>(key: string, factory: () => T): void {
        this.factories.set(key, factory);
    }

    get<T>(key: string): T {
        if (this.services.has(key)) {
            return this.services.get(key) as T;
        }

        if (this.factories.has(key)) {
            const factory = this.factories.get(key)!;
            const instance = factory();
            this.services.set(key, instance);
            return instance as T;
        }

        throw new Error(`Service ${key} not found in container`);
    }

    clear(): void {
        this.services.clear();
        this.factories.clear();
    }
} 