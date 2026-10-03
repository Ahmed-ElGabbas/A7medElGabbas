import { adminSubmissionUrl, buildSubmissionEmail, escapeHtml } from './submission-email';
import type { SubmissionForEmail } from './submission-email';

const OPTIONS = { frontendUrl: 'https://ahmedelgabbas.dev' };

function submission(overrides: Partial<SubmissionForEmail> = {}): SubmissionForEmail {
  return {
    id: 'clx123abc',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Flutter mobile application',
    message: 'Hi Ahmed,\n\nI would like to discuss a project.\n\nBest,\nJohn',
    createdAt: new Date('2026-02-14T09:30:00.000Z'),
    ...overrides,
  };
}

describe('escapeHtml', () => {
  it('escapes the five markup-significant characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('escapes ampersands before the entities it introduces', () => {
    expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('Hello there, 123 — ok.')).toBe('Hello there, 123 — ok.');
  });
});

describe('adminSubmissionUrl', () => {
  it('deep-links into the admin inbox at the submission', () => {
    expect(adminSubmissionUrl('https://example.com', 'abc123')).toBe(
      'https://example.com/admin/contact?submission=abc123',
    );
  });

  it.each([
    ['a trailing slash', 'https://example.com/'],
    ['several trailing slashes', 'https://example.com///'],
    ['surrounding whitespace', '  https://example.com  '],
  ])('normalises %s on the configured base', (_label, base) => {
    expect(adminSubmissionUrl(base, 'abc123')).toBe(
      'https://example.com/admin/contact?submission=abc123',
    );
  });

  it('preserves a base path, which a preview deployment needs', () => {
    expect(adminSubmissionUrl('https://example.com/portfolio', 'abc')).toBe(
      'https://example.com/portfolio/admin/contact?submission=abc',
    );
  });

  it('encodes the id so it cannot inject extra query parameters', () => {
    expect(adminSubmissionUrl('https://example.com', 'a&b=c')).toBe(
      'https://example.com/admin/contact?submission=a%26b%3Dc',
    );
  });

  it('degrades to a relative link when FRONTEND_URL is unset, rather than producing "null/"', () => {
    expect(adminSubmissionUrl('', 'abc')).toBe('/admin/contact?submission=abc');
  });
});

describe('buildSubmissionEmail', () => {
  it('names the sender in the subject line', () => {
    expect(buildSubmissionEmail(submission(), OPTIONS).subject).toBe(
      'New portfolio contact submission from John Doe',
    );
  });

  it('collapses newlines in the sender name so they cannot inject headers', () => {
    const subject = buildSubmissionEmail(
      submission({ name: 'Eve\r\nBcc: attacker@evil.example' }),
      OPTIONS,
    ).subject;

    expect(subject).not.toContain('\r');
    expect(subject).not.toContain('\n');
    expect(subject).toBe('New portfolio contact submission from Eve Bcc: attacker@evil.example');
  });

  it('collapses tabs too', () => {
    expect(buildSubmissionEmail(submission({ name: 'A\tB' }), OPTIONS).subject).toBe(
      'New portfolio contact submission from A B',
    );
  });

  it('clamps a long name in the subject', () => {
    const subject = buildSubmissionEmail(submission({ name: 'n'.repeat(200) }), OPTIONS).subject;
    expect(subject.length).toBeLessThan('New portfolio contact submission from '.length + 61);
  });

  it('still produces a usable subject when the name is only whitespace', () => {
    expect(buildSubmissionEmail(submission({ name: '   ' }), OPTIONS).subject).toBe(
      'New portfolio contact submission from someone',
    );
  });

  describe('carries the submission content', () => {
    const content = buildSubmissionEmail(submission(), OPTIONS);

    it.each([
      ['name', 'John Doe'],
      ['email', 'john@example.com'],
      ['subject', 'Flutter mobile application'],
    ])('includes the %s in the text body', (_field, expected) => {
      expect(content.text).toContain(expected);
    });

    it('includes the message in the text body', () => {
      expect(content.text).toContain('I would like to discuss a project.');
    });

    it('includes the message in the html body', () => {
      expect(content.html).toContain('I would like to discuss a project.');
    });

    it('includes the deep link in both renderings', () => {
      const link = 'https://ahmedelgabbas.dev/admin/contact?submission=clx123abc';
      expect(content.text).toContain(link);
      expect(content.html).toContain(link);
    });

    it('includes the received timestamp', () => {
      expect(content.text).toContain('2026-02-14T09:30:00.000Z');
    });

    it('shows the subject in both renderings', () => {
      expect(content.text).toContain('Flutter mobile application');
      expect(content.html).toContain('Flutter mobile application');
    });
  });

  describe('handles a blank subject', () => {
    it('labels it in the text body instead of showing an empty gap', () => {
      expect(buildSubmissionEmail(submission({ subject: '' }), OPTIONS).text).toContain(
        '(no subject)',
      );
    });

    it('labels it in the html body too', () => {
      expect(buildSubmissionEmail(submission({ subject: '   ' }), OPTIONS).html).toContain(
        '(no subject)',
      );
    });
  });

  describe('escapes hostile input', () => {
    const nasty = submission({
      name: '<script>alert(1)</script>',
      email: 'evil@x.example',
      subject: '"><img src=x onerror=alert(1)>',
      message: '<script>alert("xss")</script>',
    });

    it('neutralises a script tag in the name', () => {
      const { html } = buildSubmissionEmail(nasty, OPTIONS);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('neutralises markup in the message', () => {
      expect(buildSubmissionEmail(nasty, OPTIONS).html).not.toContain('<script>alert');
    });

    it('neutralises an attribute break-out attempt in the subject', () => {
      const { html } = buildSubmissionEmail(nasty, OPTIONS);
      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&lt;img');
    });

    it('never emits a javascript: URL through the mailto link', () => {
      const { html } = buildSubmissionEmail(
        submission({ email: 'javascript:alert(1)' }),
        OPTIONS,
      );
      expect(html).not.toContain('mailto:javascript');
      expect(html).not.toContain('href="javascript:');
    });

    it('renders a non-address email as plain text instead of a link', () => {
      const { html } = buildSubmissionEmail(
        submission({ email: 'not an address at all' }),
        OPTIONS,
      );
      expect(html).not.toContain('<a href="mailto:');
      expect(html).toContain('not an address at all');
    });

    it('still links a real address', () => {
      expect(buildSubmissionEmail(submission(), OPTIONS).html).toContain(
        'href="mailto:john@example.com"',
      );
    });

    it('leaves the plain-text rendering unescaped but harmless', () => {
      // Text/plain is not markup; the value is simply shown verbatim.
      expect(buildSubmissionEmail(nasty, OPTIONS).text).toContain('<script>alert(1)</script>');
    });
  });

  it('renders a complete html document', () => {
    const { html } = buildSubmissionEmail(submission(), OPTIONS);
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('</html>');
  });

  it('is deterministic for the same input', () => {
    expect(buildSubmissionEmail(submission(), OPTIONS)).toEqual(
      buildSubmissionEmail(submission(), OPTIONS),
    );
  });
});