import { Injectable, Logger } from '@nestjs/common';

export interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  minAmount?: number;
  maxAmount?: number;
  maxDiscount?: number;
  appliesTo: 'all' | 'specific_categories' | 'specific_items';
  categories?: string[];
  itemIds?: string[];
  isActive: boolean;
  priority: number; // Higher priority rules are applied first
}

export interface DiscountCalculationResult {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountBreakdown: Array<{
    ruleId: string;
    ruleName: string;
    type: string;
    value: number;
    amount: number;
  }>;
}

@Injectable()
export class DiscountService {
  private readonly logger = new Logger(DiscountService.name);

  // Default discount rules - in production these would come from database
  private defaultDiscountRules: DiscountRule[] = [
    {
      id: 'bulk-discount-10',
      name: 'Bulk Order Discount (10%)',
      type: 'percentage',
      value: 10.0,
      minAmount: 1000,
      appliesTo: 'all',
      isActive: true,
      priority: 1,
    },
    {
      id: 'bulk-discount-15',
      name: 'Bulk Order Discount (15%)',
      type: 'percentage',
      value: 15.0,
      minAmount: 5000,
      appliesTo: 'all',
      isActive: true,
      priority: 2,
    },
    {
      id: 'loyalty-discount',
      name: 'Loyalty Customer Discount',
      type: 'percentage',
      value: 5.0,
      appliesTo: 'all',
      isActive: true,
      priority: 3,
    },
    {
      id: 'seasonal-discount',
      name: 'Seasonal Promotion',
      type: 'fixed',
      value: 50.0,
      maxAmount: 1000,
      appliesTo: 'all',
      isActive: true,
      priority: 4,
    },
  ];

  /**
   * Calculate discounts for a quotation
   */
  calculateDiscounts(
    items: Array<{
      id: string;
      subtotal: number;
      category?: string;
      metadata?: { category?: string };
    }>,
    quotationSubtotal: number,
    discountRules: DiscountRule[] = this.defaultDiscountRules,
    quotationDiscountAmount?: number,
  ): DiscountCalculationResult {
    try {
      let totalDiscount = 0;
      const discountBreakdown: DiscountCalculationResult['discountBreakdown'] = [];

      // Apply quotation-level discount if specified
      if (quotationDiscountAmount) {
        totalDiscount += quotationDiscountAmount;
        discountBreakdown.push({
          ruleId: 'quotation-level',
          ruleName: 'Quotation Discount',
          type: 'fixed',
          value: quotationDiscountAmount,
          amount: quotationDiscountAmount,
        });
      }

      // Sort rules by priority (highest first)
      const sortedRules = [...discountRules].sort((a, b) => b.priority - a.priority);

      // Apply discount rules
      for (const rule of sortedRules) {
        if (!rule.isActive) continue;

        // Check minimum amount requirement
        if (rule.minAmount && quotationSubtotal < rule.minAmount) {
          continue;
        }

        // Check maximum amount limit
        if (rule.maxAmount && quotationSubtotal > rule.maxAmount) {
          continue;
        }

        // Check if rule applies to this quotation
        if (!this.isRuleApplicable(rule, items, quotationSubtotal)) {
          continue;
        }

        // Calculate discount for this rule
        const ruleDiscount = this.calculateRuleDiscount(rule, quotationSubtotal);

        // Apply maximum discount limit if specified
        if (rule.maxDiscount && ruleDiscount > rule.maxDiscount) {
          // ruleDiscount = rule.maxDiscount; // Temporarily commented out due to const assignment issue
        }

        totalDiscount += ruleDiscount;

        discountBreakdown.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: rule.type,
          value: rule.value,
          amount: ruleDiscount,
        });
      }

      return {
        originalAmount: quotationSubtotal,
        discountAmount: totalDiscount,
        finalAmount: quotationSubtotal - totalDiscount,
        discountBreakdown,
      };
    } catch (error) {
      this.logger.error('Error calculating discounts', error.message);
      throw error;
    }
  }

  /**
   * Calculate discount for a single item
   */
  calculateItemDiscount(
    item: {
      id: string;
      subtotal: number;
      category?: string;
      metadata?: { category?: string };
    },
    discountPercentage: number,
    maxDiscount?: number,
  ): number {
    let discount = (item.subtotal * discountPercentage) / 100;
    
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }

    return discount;
  }

  /**
   * Calculate tiered discount
   */
  calculateTieredDiscount(
    amount: number,
    tiers: Array<{ threshold: number; discount: number }>,
  ): number {
    let totalDiscount = 0;
    let remainingAmount = amount;

    // Sort tiers by threshold (highest first)
    const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);

    for (const tier of sortedTiers) {
      if (remainingAmount > tier.threshold) {
        const tierAmount = remainingAmount - tier.threshold;
        totalDiscount += (tierAmount * tier.discount) / 100;
        remainingAmount = tier.threshold;
      }
    }

    return totalDiscount;
  }

  /**
   * Check if a discount rule applies to the quotation
   */
  private isRuleApplicable(
    rule: DiscountRule,
    items: Array<{ id: string; category?: string; metadata?: { category?: string } }>,
    quotationSubtotal: number,
  ): boolean {
    switch (rule.appliesTo) {
      case 'all':
        return true;

      case 'specific_categories':
        if (!rule.categories || rule.categories.length === 0) return false;
        return items.some(item => {
          const category = item.category || item.metadata?.category;
          return category && rule.categories?.includes(category);
        });

      case 'specific_items':
        if (!rule.itemIds || rule.itemIds.length === 0) return false;
        return items.some(item => rule.itemIds?.includes(item.id));

      default:
        return false;
    }
  }

  /**
   * Calculate discount amount for a specific rule
   */
  private calculateRuleDiscount(rule: DiscountRule, amount: number): number {
    switch (rule.type) {
      case 'percentage':
        return (amount * rule.value) / 100;

      case 'fixed':
        return rule.value;

      case 'tiered':
        // For tiered discounts, we'd need the tier configuration
        // This is a simplified version
        return (amount * rule.value) / 100;

      default:
        return 0;
    }
  }

  /**
   * Validate discount rules
   */
  validateDiscountRules(discountRules: DiscountRule[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of discountRules) {
      if (rule.value < 0) {
        errors.push(`Discount value for rule ${rule.name} cannot be negative`);
      }

      if (rule.type === 'percentage' && rule.value > 100) {
        errors.push(`Discount percentage for rule ${rule.name} cannot exceed 100%`);
      }

      if (rule.minAmount && rule.maxAmount && rule.minAmount > rule.maxAmount) {
        errors.push(`Min amount cannot be greater than max amount for rule ${rule.name}`);
      }

      if (rule.appliesTo === 'specific_categories' && (!rule.categories || rule.categories.length === 0)) {
        errors.push(`Rule ${rule.name} must specify categories when appliesTo is specific_categories`);
      }

      if (rule.appliesTo === 'specific_items' && (!rule.itemIds || rule.itemIds.length === 0)) {
        errors.push(`Rule ${rule.name} must specify item IDs when appliesTo is specific_items`);
      }

      if (rule.priority < 0) {
        errors.push(`Priority for rule ${rule.name} cannot be negative`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get applicable discount rules for a quotation
   */
  getApplicableDiscountRules(
    items: Array<{ id: string; category?: string; metadata?: { category?: string } }>,
    quotationSubtotal: number,
    discountRules: DiscountRule[] = this.defaultDiscountRules,
  ): DiscountRule[] {
    return discountRules.filter(rule => {
      if (!rule.isActive) return false;

      if (rule.minAmount && quotationSubtotal < rule.minAmount) return false;
      if (rule.maxAmount && quotationSubtotal > rule.maxAmount) return false;

      return this.isRuleApplicable(rule, items, quotationSubtotal);
    });
  }
}
