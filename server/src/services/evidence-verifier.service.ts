import { EvidenceItem, ExtractedScope, ScopeItem } from '@scopesentry/shared';

export interface QuoteVerificationResult {
  isVerified: boolean;
  startIndex?: number;
  endIndex?: number;
  exactMatch: boolean;
  normalizedMatch: boolean;
  warning?: string;
}

export class EvidenceVerifierService {
  /**
   * Normalize whitespace (collapses runs of whitespace to a single space, trims).
   * Does NOT alter punctuation, casing, or word tokens.
   */
  public static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Verifies if a quote genuinely exists in the original agreement text.
   * Prefers exact substring match. Falls back to whitespace-normalized match.
   */
  public static verifyQuote(originalText: string, rawQuote: string): QuoteVerificationResult {
    if (!rawQuote || rawQuote.trim().length === 0) {
      return {
        isVerified: false,
        exactMatch: false,
        normalizedMatch: false,
        warning: 'Quotation string is empty.'
      };
    }

    const trimmedQuote = rawQuote.trim();

    // 1. Exact substring search
    const exactIndex = originalText.indexOf(trimmedQuote);
    if (exactIndex !== -1) {
      return {
        isVerified: true,
        startIndex: exactIndex,
        endIndex: exactIndex + trimmedQuote.length,
        exactMatch: true,
        normalizedMatch: false
      };
    }

    // 2. Safe whitespace-normalized search (without changing casing or words)
    const normQuote = this.normalizeWhitespace(trimmedQuote);
    const normSource = this.normalizeWhitespace(originalText);

    const normIndex = normSource.indexOf(normQuote);
    if (normIndex !== -1 && normQuote.length >= 8) {
      // Find approximate coordinates in original text via fuzzy regex of whitespace
      const escapedQuote = normQuote
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/ /g, '\\s+');
      
      const regex = new RegExp(escapedQuote);
      const match = regex.exec(originalText);

      if (match) {
        return {
          isVerified: true,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          exactMatch: false,
          normalizedMatch: true,
          warning: 'Quotation verified with minor whitespace formatting differences.'
        };
      }
    }

    // 3. Failed verification - quotation does not occur in source
    return {
      isVerified: false,
      exactMatch: false,
      normalizedMatch: false,
      warning: `Unverified citation: "${trimmedQuote.length > 80 ? trimmedQuote.substring(0, 77) + '...' : trimmedQuote}" does not appear verbatim in the original agreement.`
    };
  }

  /**
   * Verifies an array of EvidenceItem objects.
   */
  public static verifyEvidenceItems(
    originalText: string,
    items: EvidenceItem[]
  ): {
    verifiedItems: EvidenceItem[];
    unverifiedItems: EvidenceItem[];
    allWithStatus: EvidenceItem[];
    warnings: string[];
  } {
    const verifiedItems: EvidenceItem[] = [];
    const unverifiedItems: EvidenceItem[] = [];
    const allWithStatus: EvidenceItem[] = [];
    const warnings: string[] = [];

    for (const item of items) {
      const verification = this.verifyQuote(originalText, item.quote);
      const updated: EvidenceItem = {
        ...item,
        isVerified: verification.isVerified,
        startIndex: verification.startIndex,
        endIndex: verification.endIndex,
        warning: verification.warning
      };

      allWithStatus.push(updated);
      if (verification.isVerified) {
        verifiedItems.push(updated);
        if (verification.warning) {
          warnings.push(verification.warning);
        }
      } else {
        unverifiedItems.push(updated);
        if (verification.warning) {
          warnings.push(verification.warning);
        }
      }
    }

    return {
      verifiedItems,
      unverifiedItems,
      allWithStatus,
      warnings
    };
  }

  /**
   * Verifies quotes inside an ExtractedScope object.
   */
  public static verifyExtractedScope(
    originalText: string,
    scope: ExtractedScope
  ): {
    scope: ExtractedScope;
    verifiedCount: number;
    unverifiedCount: number;
    warnings: string[];
  } {
    let verifiedCount = 0;
    let unverifiedCount = 0;
    const warnings: string[] = [];

    const verifyScopeItem = (item: ScopeItem): ScopeItem => {
      if (!item.verbatimQuote || item.verbatimQuote.trim().length === 0) {
        return { ...item, isVerified: false };
      }
      const res = this.verifyQuote(originalText, item.verbatimQuote);
      if (res.isVerified) {
        verifiedCount++;
        if (res.warning) warnings.push(res.warning);
        return {
          ...item,
          isVerified: true,
          startIndex: res.startIndex,
          endIndex: res.endIndex,
          warning: res.warning
        };
      } else {
        unverifiedCount++;
        if (res.warning) warnings.push(res.warning);
        return {
          ...item,
          isVerified: false,
          warning: res.warning
        };
      }
    };

    const updatedDeliverables = scope.deliverables.map(verifyScopeItem);
    const updatedInclusions = scope.explicitInclusions.map(verifyScopeItem);
    const updatedExclusions = scope.explicitExclusions.map(verifyScopeItem);
    const updatedConstraints = scope.constraints.map(verifyScopeItem);
    const updatedMilestones = scope.milestonesAndDeadlines.map(verifyScopeItem);
    const updatedRevision = scope.revisionPolicy ? verifyScopeItem(scope.revisionPolicy) : null;

    return {
      scope: {
        ...scope,
        deliverables: updatedDeliverables,
        explicitInclusions: updatedInclusions,
        explicitExclusions: updatedExclusions,
        constraints: updatedConstraints,
        revisionPolicy: updatedRevision,
        milestonesAndDeadlines: updatedMilestones
      },
      verifiedCount,
      unverifiedCount,
      warnings
    };
  }
}
