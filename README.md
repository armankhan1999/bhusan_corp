# Pravaah — Bhushan Corp Operations Platform

Phase 1 prototype and its governing documentation for **Bhushancorp Private Limited**, Exhibition
Road, Patna — the authorised channel and service partner for ELGi air compressors, ATS-ELGi
workshop equipment, KSB pumps and Ion Exchange water treatment, with a parallel turnkey
water & environment (EPC) vertical.

**Frontend-only.** No backend, no database, no real external call. Every integration is
faithfully simulated and visibly labelled as such.

---

## Repository layout

| Path | What it is |
|---|---|
| `00_README_Documentation_Index.md` | Reading guide for the document set, package statistics, open client decisions |
| `01_BRD_Bhushan_Operations_Platform.md` | Business Requirements — 62 requirements, 12 objectives, 22 KPIs, build-vs-buy analysis, RAID log |
| `02_PRD_Bhushan_Operations_Platform.md` | Product Requirements — 216 functional requirements, data model, 12-role RBAC matrix, design tokens, seed spec, demo script |
| `03_Epics_User_Stories_Bhushan_Operations_Platform.md` | 14 epics, 92 user stories with Given/When/Then acceptance criteria, sprint plan, traceability matrix |
| `PLAN.md` | Build plan: story → files → wave, plus the **16-item adjudication register** for conflicts found in the source documents |
| `pravaah/` | The Next.js 15 application |

Start with **`pravaah/README.md`** for the build status, verified gates, role credentials,
demonstration script and the A-01…A-22 acceptance checklist.

---

## Quick start

```bash
cd pravaah
npm install
npm run validate:seed   # reconciliation gate — 80 rules, must pass first
npm run dev             # http://localhost:3000
```

Then sign in as any of the twelve seeded personas. No password is validated.

```bash
npm run build && npm start   # production
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint
npm run test:unit            # WCAG contrast assertions
npm run test:e2e             # Playwright: RBAC, reconciliation, six-tap, axe, responsive, LCP
```

---

## The figure the prototype is built around

```
Receivables outstanding    ₹1,82,00,000
Project retention           ₹34,60,000
                          ──────────────
Locked cash                ₹2,17,00,000   (₹2.17 Cr)
```

Asserted by `npm run validate:seed`, not typed into a component. The four ageing buckets
(₹64 L / ₹47 L / ₹31 L / ₹40 L) sum to the receivables total exactly, and institutional plus
government exposure is exactly ₹1.12 Cr of it.

---

## Reading the documents against the code

Precedence, per `00_README` §7:

1. **Epics** — the Given/When/Then acceptance criteria are the contract.
2. **PRD** — for anything the stories do not specify: tokens, RBAC cells, data-model fields, seed volumes.
3. **BRD** — for adjudicating ambiguity.

A line-by-line read of the three documents surfaced **16 conflicts** that had to be resolved
before a deterministic build was possible — contradictory epic numbering, five priority
inversions, a de-scope order that orphaned a P0 story, an unachievable phase gate, three
incompatible definitions of the six-tap budget, and a palette that failed its own WCAG rule.
Each is catalogued with its reasoning in `PLAN.md` §3, and the runtime-affecting ones are
repeated in `pravaah/README.md`.

---

*Prototype prepared against the Aravya documentation package dated 31 July 2026. Statutory
positions are stated as at July 2026 and require re-validation before Phase 2. All seed data is
fictional and contains no real personal data.*
