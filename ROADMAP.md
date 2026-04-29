# Roadmap

Planned improvements and features for Cadence. Items within each category are loosely prioritized top-to-bottom.

---

## Security & Auth

- [ ] Server-side session store (Redis/DB) to enable instant session revocation
- [ ] Password change flow
- [ ] Password reset via email
- [ ] Invite-only or admin-approved registration (sensitive health data warrants controlled access)
- [ ] Audit log — record who accessed or modified data and when

---

## Data & Privacy

- [ ] Data export (JSON/CSV) for portability
- [ ] Configurable data retention policy per account
- [ ] HIPAA alignment review

---

## Observations & Logging

- [ ] Custom behavior catalog items scoped per user (currently shared across all users)
- [ ] ABC (Antecedent–Behavior–Consequence) structured data capture on the home screen
- [ ] Latency tracking (time from antecedent to behavior onset)
- [ ] Photo/video attachment support for incidents
- [ ] Offline support with sync when reconnected

---

## Analytics & Reports

- [ ] Weekly and monthly trend charts on the home screen
- [ ] Per-behavior frequency and duration breakdowns
- [ ] Comparative reporting across date ranges
- [ ] Customizable PDF report templates

---

## UX & Mobile

- [ ] Push notifications / reminders
- [ ] Theme customization (dark mode)
- [ ] Multi-child quick-switch from the home screen
- [ ] Native iOS app via Capacitor (re-evaluate after core features stabilize)

---

## Infrastructure

- [ ] Rate limiting via persistent store (Upstash/Redis) for multi-instance deployments
- [ ] Automated database backups
- [ ] Staging environment
