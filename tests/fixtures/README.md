# Test fixtures

Every file here is written from scratch for this project. The schools, staff, students, dates and
links are fictional, and no file may be replaced with a real school document, screenshot, report
card, IEP, or email.

Rules for adding fixtures:

- Never commit a real child, family, or staff member's information, even partly redacted.
- Prefer plain text so extraction tests stay readable in diffs.
- Keep dates and amounts stable once tests assert on them.
- Cover the document types the product claims to support: report card, IEP notice, newsletter,
  permission slip, teacher email.
- If a fixture needs a screenshot or scan, generate it from the synthetic text instead of using a
  real photograph.
