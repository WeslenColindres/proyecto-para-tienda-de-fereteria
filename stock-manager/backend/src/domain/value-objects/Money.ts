export class Money {
    constructor(
        public readonly amount: number,
        public readonly currency: string = 'GTQ'
    ) {
        if (amount < 0) {
            throw new Error('El monto no puede ser negativo');
        }
    }

    static from(amount: number, currency: string = 'GTQ'): Money {
        return new Money(amount, currency);
    }

    add(other: Money): Money {
        if (other.currency !== this.currency) {
            throw new Error('No se pueden sumar monedas diferentes');
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        if (other.currency !== this.currency) {
            throw new Error('No se pueden restar monedas diferentes');
        }
        return new Money(this.amount - other.amount, this.currency);
    }

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }
}
