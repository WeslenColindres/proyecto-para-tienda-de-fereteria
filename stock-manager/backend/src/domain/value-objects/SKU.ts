export class SKU {
    private readonly value: string;

    constructor(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('El SKU no puede estar vacio');
        }
        // Add more validation logic here if needed (e.g., regex)
        this.value = value.trim().toUpperCase();
    }

    static from(value: string): SKU {
        return new SKU(value);
    }

    toString(): string {
        return this.value;
    }

    equals(other: SKU): boolean {
        return this.value === other.value;
    }
}
