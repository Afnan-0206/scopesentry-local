import { describe, it, expect } from 'vitest';
import { EvidenceVerifierService } from '../src/services/evidence-verifier.service.js';
import { ExtractedScope } from '@scopesentry/shared';

describe('EvidenceVerifierService', () => {
  const agreement = `
Project Scope Agreement for TechCorp
Deliverables:
1. Home page with hero banner and CTA.
2. About Us page with team bios.
3. Contact Us form with email notification.

Exclusions:
- User authentication and member portal are strictly excluded.
- Payment gateway integration is not included in this phase.

Revisions:
Two rounds of feedback are included. Extra rounds billed at standard hourly rate.
  `.trim();

  it('should verify exact verbatim quotations', () => {
    const quote = 'User authentication and member portal are strictly excluded.';
    const result = EvidenceVerifierService.verifyQuote(agreement, quote);

    expect(result.isVerified).toBe(true);
    expect(result.exactMatch).toBe(true);
    expect(result.startIndex).toBeDefined();
    expect(result.endIndex).toBeDefined();
    expect(agreement.substring(result.startIndex!, result.endIndex!)).toBe(quote);
    expect(result.warning).toBeUndefined();
  });

  it('should verify safe whitespace-normalized quotations across line breaks', () => {
    const quote = 'Two rounds of feedback are included.   Extra rounds billed at standard hourly rate.';
    const result = EvidenceVerifierService.verifyQuote(agreement, quote);

    expect(result.isVerified).toBe(true);
    expect(result.startIndex).toBeDefined();
  });

  it('should fail and flag fabricated or hallucinated quotations', () => {
    const fakeQuote = 'The contractor agrees to build a full e-commerce shopping cart.';
    const result = EvidenceVerifierService.verifyQuote(agreement, fakeQuote);

    expect(result.isVerified).toBe(false);
    expect(result.exactMatch).toBe(false);
    expect(result.normalizedMatch).toBe(false);
    expect(result.warning).toContain('does not appear verbatim in the original agreement');
  });

  it('should handle empty or whitespace-only quotes safely', () => {
    const result = EvidenceVerifierService.verifyQuote(agreement, '   ');
    expect(result.isVerified).toBe(false);
    expect(result.warning).toBe('Quotation string is empty.');
  });

  it('should verify all items in an ExtractedScope structure', () => {
    const scope: ExtractedScope = {
      deliverables: [
        {
          id: '1',
          text: 'Home page',
          verbatimQuote: '1. Home page with hero banner and CTA.',
          isVerified: false,
        },
        {
          id: '2',
          text: 'Mobile App',
          verbatimQuote: 'Native iOS and Android mobile applications', // Fake
          isVerified: false,
        },
      ],
      explicitInclusions: [],
      explicitExclusions: [
        {
          id: '3',
          text: 'Payment gateway',
          verbatimQuote: 'Payment gateway integration is not included in this phase.',
          isVerified: false,
        },
      ],
      constraints: [],
      revisionPolicy: {
        id: '4',
        text: 'Two rounds of feedback',
        verbatimQuote: 'Two rounds of feedback are included.',
        isVerified: false,
      },
      milestonesAndDeadlines: [],
      assumptions: [],
      ambiguousOrConflictingClauses: [],
      evidenceExcerpts: [],
    };

    const verified = EvidenceVerifierService.verifyExtractedScope(agreement, scope);

    expect(verified.verifiedCount).toBe(3);
    expect(verified.unverifiedCount).toBe(1);
    expect(verified.scope.deliverables[0].isVerified).toBe(true);
    expect(verified.scope.deliverables[1].isVerified).toBe(false);
    expect(verified.scope.deliverables[1].warning).toBeDefined();
    expect(verified.scope.explicitExclusions[0].isVerified).toBe(true);
    expect(verified.scope.revisionPolicy?.isVerified).toBe(true);
  });
});
