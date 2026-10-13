import { StoredProject } from '../types.js';

export const DEMO_PROJECTS: StoredProject[] = [
  {
    id: 'demo_proj_1',
    projectName: 'Apex B2B Marketing Website',
    clientLabel: 'Apex Global Logistics',
    originalAgreementText: `STATEMENT OF WORK — APEX GLOBAL LOGISTICS
Project Deliverables:
1. Responsive Home page with hero section, logistics calculator widget, and partner logo strip.
2. Pricing page featuring 3 tiered tier cards and FAQ accordion.
3. About Us page with company history timeline and 8 executive team bios.
4. Contact Us page with lead capture form sending notifications to sales@apex.com.
5. All pages built with Next.js and Tailwind CSS, deployed to Vercel.

Exclusions:
- User login, registration, password reset, and customer portal accounts are strictly excluded from this phase.
- Stripe payment processing or credit card tokenization is not included.
- Content writing or custom photography (client provides all copy and photography assets).

Revisions & Feedback:
- Includes two (2) rounds of consolidated feedback per deliverable. Additional revision rounds are billed at $110/hour upon written approval.`,
    notes: 'Contract signed Sep 2026. Kickoff meeting held.',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
    extractedScope: {
      deliverables: [
        {
          id: 'd1',
          text: 'Responsive Home page with calculator widget & logo strip',
          verbatimQuote: '1. Responsive Home page with hero section, logistics calculator widget, and partner logo strip.',
          isVerified: true,
        },
        {
          id: 'd2',
          text: 'Pricing page with 3 tier cards and FAQ accordion',
          verbatimQuote: '2. Pricing page featuring 3 tiered tier cards and FAQ accordion.',
          isVerified: true,
        },
        {
          id: 'd3',
          text: 'About Us page with timeline and 8 executive bios',
          verbatimQuote: '3. About Us page with company history timeline and 8 executive team bios.',
          isVerified: true,
        },
        {
          id: 'd4',
          text: 'Contact Us page with lead capture form',
          verbatimQuote: '4. Contact Us page with lead capture form sending notifications to sales@apex.com.',
          isVerified: true,
        },
      ],
      explicitInclusions: [
        {
          id: 'i1',
          text: 'Next.js, Tailwind CSS, Vercel deployment',
          verbatimQuote: '5. All pages built with Next.js and Tailwind CSS, deployed to Vercel.',
          isVerified: true,
        },
      ],
      explicitExclusions: [
        {
          id: 'e1',
          text: 'User login, registration, and customer portal',
          verbatimQuote: 'User login, registration, password reset, and customer portal accounts are strictly excluded from this phase.',
          isVerified: true,
        },
        {
          id: 'e2',
          text: 'Stripe payment processing or tokenization',
          verbatimQuote: 'Stripe payment processing or credit card tokenization is not included.',
          isVerified: true,
        },
      ],
      constraints: [],
      revisionPolicy: {
        id: 'r1',
        text: 'Two rounds of consolidated feedback; extra rounds at $110/hr',
        verbatimQuote: 'Includes two (2) rounds of consolidated feedback per deliverable. Additional revision rounds are billed at $110/hour upon written approval.',
        isVerified: true,
      },
      milestonesAndDeadlines: [],
      assumptions: ['Client delivers photography and copy before development begins'],
      ambiguousOrConflictingClauses: [],
      evidenceExcerpts: [],
    },
    approvedScope: {
      deliverables: [
        {
          id: 'd1',
          text: 'Responsive Home page with calculator widget & logo strip',
          verbatimQuote: '1. Responsive Home page with hero section, logistics calculator widget, and partner logo strip.',
          isVerified: true,
        },
        {
          id: 'd2',
          text: 'Pricing page with 3 tier cards and FAQ accordion',
          verbatimQuote: '2. Pricing page featuring 3 tiered tier cards and FAQ accordion.',
          isVerified: true,
        },
        {
          id: 'd3',
          text: 'About Us page with timeline and 8 executive bios',
          verbatimQuote: '3. About Us page with company history timeline and 8 executive team bios.',
          isVerified: true,
        },
        {
          id: 'd4',
          text: 'Contact Us page with lead capture form',
          verbatimQuote: '4. Contact Us page with lead capture form sending notifications to sales@apex.com.',
          isVerified: true,
        },
      ],
      explicitInclusions: [
        {
          id: 'i1',
          text: 'Next.js, Tailwind CSS, Vercel deployment',
          verbatimQuote: '5. All pages built with Next.js and Tailwind CSS, deployed to Vercel.',
          isVerified: true,
        },
      ],
      explicitExclusions: [
        {
          id: 'e1',
          text: 'User login, registration, and customer portal',
          verbatimQuote: 'User login, registration, password reset, and customer portal accounts are strictly excluded from this phase.',
          isVerified: true,
        },
        {
          id: 'e2',
          text: 'Stripe payment processing or tokenization',
          verbatimQuote: 'Stripe payment processing or credit card tokenization is not included.',
          isVerified: true,
        },
      ],
      constraints: [],
      revisionPolicy: {
        id: 'r1',
        text: 'Two rounds of consolidated feedback; extra rounds at $110/hr',
        verbatimQuote: 'Includes two (2) rounds of consolidated feedback per deliverable. Additional revision rounds are billed at $110/hour upon written approval.',
        isVerified: true,
      },
      milestonesAndDeadlines: [],
      assumptions: ['Client delivers photography and copy before development begins'],
      ambiguousOrConflictingClauses: [],
      evidenceExcerpts: [],
    },
    assessments: [
      {
        id: 'demo_assess_1',
        projectId: 'demo_proj_1',
        primaryStatus: 'POTENTIAL SCOPE CHANGE',
        shortSummary: 'The requested customer portal and payment checkout conflict directly with contract exclusions.',
        requestedChangesIdentified: [
          'Customer login portal for checking logistics orders',
          'Stripe credit card payment checkout for booking freight shipments',
        ],
        relevantOriginalScopeItems: [
          'Exclusion: User login and customer portal accounts',
          'Exclusion: Stripe payment processing',
        ],
        supportingQuotations: [
          {
            id: 'q1',
            quote: 'User login, registration, password reset, and customer portal accounts are strictly excluded from this phase.',
            whyItMatters: 'The agreement explicitly lists customer portal accounts as out of scope.',
            isVerified: true,
          },
          {
            id: 'q2',
            quote: 'Stripe payment processing or credit card tokenization is not included.',
            whyItMatters: 'Payment processing was explicitly excluded in the signed statement of work.',
            isVerified: true,
          },
        ],
        missingOrAmbiguousInfo: [
          'No backend database or authentication provider was included in the architectural scope.',
        ],
        suggestedNextStep: 'Present a separate Statement of Work or addendum for the customer portal & Stripe integration phase.',
        draftReply: `Hi Apex team,\n\nThanks for reaching out with these details!\n\nBased on our agreed project scope, customer login accounts and online payment processing were explicitly excluded from this initial marketing site phase:\n• User login, registration, and customer portal\n• Stripe payment checkout\n\nTo keep our current launch on track, I would be glad to prepare a separate proposal with a scoped timeline and cost for the portal and payment integration as Phase 2.\n\nPlease let me know if you would like me to draft that estimate!`,
        evidenceValidationWarnings: [],
        evaluatedAt: '2026-09-20T14:30:00.000Z',
      },
    ],
  },
];
