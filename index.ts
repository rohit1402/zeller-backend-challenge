interface SpecialDeal {
    buy: number;
    pay: number;
}

interface BulkDiscount {
    threshold: number;
    discountedPrice: number;
}

interface PricingRules {
    [sku: string]: {
        price: number;
        specialDeal?: SpecialDeal;
        bulkDiscount?: BulkDiscount;
    };
}

class Checkout {
    private pricingRules: PricingRules;
    private scannedItems: string[] = [];

    constructor(pricingRules: PricingRules) {
        this.pricingRules = pricingRules;
    }

    scan(item: string): void {
        this.scannedItems.push(item);
    }

    total(): number {
        const itemCounts: Record<string, number> = {};

        this.scannedItems.forEach((item) => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });

        let total = 0;

        for (const item of Object.keys(itemCounts)) {
            const count = itemCounts[item];
            const rule = this.pricingRules[item];

            if (!rule) continue;

            if (rule.specialDeal) {
                const dealCount = Math.floor(count / rule.specialDeal.buy);
                const nonDealCount = count % rule.specialDeal.buy;
                total += dealCount * rule.specialDeal.pay * rule.price;
                total += nonDealCount * rule.price;
            } else if (rule.bulkDiscount && count >= rule.bulkDiscount.threshold) {
                total += count * rule.bulkDiscount.discountedPrice;
            } else {
                total += count * rule.price;
            }
        }

        return total;
    }
}

const rule1: PricingRules = {
    ipd: { price: 549.99, bulkDiscount: { threshold: 4, discountedPrice: 499.99 } },
    mbp: { price: 1399.99 },
    atv: { price: 109.50, specialDeal: { buy: 3, pay: 2 } },
    vga: { price: 30.00 },
};

const co1 = new Checkout(rule1);

// Example 1
co1.scan('atv');
co1.scan('atv');
co1.scan('atv');
co1.scan('vga');
console.log('Total expected: $249.00');
console.log('Actual total:', co1.total());


// Example 2
const co2 = new Checkout(rule1);
co2.scan('atv');
co2.scan('ipd');
co2.scan('ipd');
co2.scan('atv');
co2.scan('ipd');
co2.scan('ipd');
co2.scan('ipd');
console.log('Total expected: $2718.95');
console.log('Actual total:', co2.total());
