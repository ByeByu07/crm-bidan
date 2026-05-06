# AI Privacy & Compliance

## Context
Patient data (name, drug history, purchase patterns) is currently sent to DeepSeek API via Vercel AI Gateway in full plaintext.
While this is acceptable for MVP, long-term compliance requires anonymization and consent tracking.

## Todo
- [ ] Anonymize patient data before sending to AI API (replace names with hashed IDs, remove phone numbers)
- [ ] Add clinic onboarding checkbox for "AI Data Processing Consent"
- [ ] Implement patient-level opt-out for AI analysis (flag in `patient` table: `allowAiAnalysis`)
- [ ] Add data retention policy (auto-delete AI recommendations after 30 days in `ai_recommendation` table when implemented)
- [ ] Document data flow for clinic admin (privacy policy section)
- [ ] Add HIPAA compliance flag in AI Gateway provider options when available
- [ ] Implement zero data retention routing (`zeroDataRetention: true`) for sensitive patients

## Notes
- Current implementation uses `patientName` directly in the prompt
- Gateway supports `disallowPromptTraining: true` and `zeroDataRetention: true` for Pro/Enterprise plans
- Consider BYOK (Bring Your Own Key) for DeepSeek if privacy requirements increase
