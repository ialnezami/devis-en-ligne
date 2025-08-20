import { Injectable, Logger } from '@nestjs/common';

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  appliesTo: 'all' | 'specific_categories';
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
}

export interface TaxCalculationResult {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxBreakdown: Array<{
    ruleId: string;
    ruleName: string;
    rate: number;
    amount: number;
  }>;
}

@Injectable()
export class TaxCalculationService {
  private readonly logger = new Logger(TaxCalculationService.name);

  // Default tax rules - in production these would come from database
  private defaultTaxRules: TaxRule[] = [
    {
      id: 'vat-standard',
      name: 'VAT Standard Rate',
      rate: 20.0,
      type: 'percentage',
      appliesTo: 'all',
      isActive: true,
    },
    {
      id: 'vat-reduced',
      name: 'VAT Reduced Rate',
      rate: 5.0,
      type: 'percentage',
      appliesTo: 'specific_categories',
      categories: ['books', 'food', 'medical'],
      isActive: true,
    },
    {
      id: 'sales-tax',
      name: 'Sales Tax',
      rate: 8.5,
      type: 'percentage',
      appliesTo: 'all',
      minAmount: 100,
      isActive: true,
    },
  ];

  /**
   * Calculate tax for a quotation based on items and tax rules
   */
  calculateTax(
    items: Array<{
      subtotal: number;
      category?: string;
      metadata?: { category?: string };
    }>,
    taxRules: TaxRule[] = this.defaultTaxRules,
    quotationTaxRate?: number,
  ): TaxCalculationResult {
    try {
      let subtotal = 0;
      const taxBreakdown: TaxCalculationResult['taxBreakdown'] = [];

      // Calculate subtotal from items
      for (const item of items) {
        subtotal += item.subtotal;
      }

      // If quotation has a specific tax rate, use that
      if (quotationTaxRate !== undefined) {
        const taxAmount = (subtotal * quotationTaxRate) / 100;
        return {
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
          taxBreakdown: [
            {
              ruleId: 'quotation-specific',
              ruleName: 'Quotation Tax Rate',
              rate: quotationTaxRate,
              amount: taxAmount,
            },
          ],
        };
      }

      // Apply tax rules
      let totalTax = 0;
      for (const rule of taxRules) {
        if (!rule.isActive) continue;

        let taxableAmount = subtotal;

        // Check minimum amount requirement
        if (rule.minAmount && subtotal < rule.minAmount) {
          continue;
        }

        // Check maximum amount limit
        if (rule.maxAmount && subtotal > rule.maxAmount) {
          taxableAmount = rule.maxAmount;
        }

        // Check if rule applies to this quotation
        if (rule.appliesTo === 'specific_categories') {
          const hasMatchingCategory = items.some(item => {
            const category = item.category || item.metadata?.category;
            return category && rule.categories?.includes(category);
          });

          if (!hasMatchingCategory) {
            continue;
          }
        }

        // Calculate tax for this rule
        let ruleTaxAmount = 0;
        if (rule.type === 'percentage') {
          ruleTaxAmount = (taxableAmount * rule.rate) / 100;
        } else if (rule.type === 'fixed') {
          ruleTaxAmount = rule.rate;
        }

        totalTax += ruleTaxAmount;

        taxBreakdown.push({
          ruleId: rule.id,
          ruleName: rule.name,
          rate: rule.rate,
          amount: ruleTaxAmount,
        });
      }

      return {
        subtotal,
        taxAmount: totalTax,
        total: subtotal + totalTax,
        taxBreakdown,
      };
    } catch (error) {
      this.logger.error('Error calculating tax', error.message);
      throw error;
    }
  }

  /**
   * Calculate tax for a single item
   */
  calculateItemTax(
    item: {
      subtotal: number;
      category?: string;
      metadata?: { category?: string };
    },
    taxRate: number,
  ): number {
    return (item.subtotal * taxRate) / 100;
  }

  /**
   * Get applicable tax rules for a quotation
   */
  getApplicableTaxRules(
    items: Array<{ category?: string; metadata?: { category?: string } }>,
    taxRules: TaxRule[] = this.defaultTaxRules,
  ): TaxRule[] {
    return taxRules.filter(rule => {
      if (!rule.isActive) return false;

      if (rule.appliesTo === 'all') return true;

      if (rule.appliesTo === 'specific_categories') {
        return items.some(item => {
          const category = item.category || item.metadata?.category;
          return category && rule.categories?.includes(category);
        });
      }

      return false;
    });
  }

  /**
   * Validate tax rules
   */
  validateTaxRules(taxRules: TaxRule[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of taxRules) {
      if (rule.rate < 0) {
        errors.push(`Tax rate for rule ${rule.name} cannot be negative`);
      }

      if (rule.type === 'percentage' && rule.rate > 100) {
        errors.push(`Tax rate for rule ${rule.name} cannot exceed 100%`);
      }

      if (rule.minAmount && rule.maxAmount && rule.minAmount > rule.maxAmount) {
        errors.push(`Min amount cannot be greater than max amount for rule ${rule.name}`);
      }

      if (rule.appliesTo === 'specific_categories' && (!rule.categories || rule.categories.length === 0)) {
        errors.push(`Rule ${rule.name} must specify categories when appliesTo is specific_categories`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
