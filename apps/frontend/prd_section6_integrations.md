## 6. Integrations & APIs

### API Spec (OpenAPI Snippet for Gemini)
```yaml
openapi: 3.0.0
info: {title: AI Calling Center API, version: 1.0}
paths:
  /contacts:
    post:
      summary: Ingest leads with hashing
      requestBody:
        content:
          application/json: {schema: {$ref: '#/components/schemas/LeadBatch'}}
      responses:
        201: {description: Hashes logged, contacts created}
  /campaigns/{id}/start:
    post:
      summary: Launch dialer
      parameters: [{name: id, in: path, required: true, schema: {type: string}}]
      responses:
        202: {description: Queued for VAPI}
components:
  schemas:
    LeadBatch:
      type: object
      properties:
        leads: {type: array, items: {type: object, properties: {phone: {type: string}, name: {type: string}, email: {type: string}}}}
        walletSignature: {type: string}  # For auth
```
Social Sync: X Webhook (via xAI API? Query: "brand mentions" → Semantic filter >0.7 → Enqueue dial); OAuth for user auth.
CRM: Zapier/Zoho: Triggers on "new booking" → Push to Salesforce (Opportunity create).
Compliance: TNS DNC API (daily scrub); TCPA: Consent log in metadata (e.g., {"consented_at": ISO, "method": "verbal"}).