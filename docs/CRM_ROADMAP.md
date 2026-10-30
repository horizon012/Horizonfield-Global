# CRM Roadmap for Horizonfield Global

## Intended business units
1. Agricultural Commodities
2. Building Materials
3. Technology Distribution (not recommerce)

Group businesses Nector Harvest and Elementall Core appear on the website. Whether they share the internal CRM should be an explicit company decision before implementing multi-business permissions.

## Initial data flow

Website enquiry -> POST `/api/v1/inquiries/` -> Django validates and saves `Lead` -> Django Admin for staff follow-up.

## Recommended later modules

- Role-based access (Admin, Sales Manager, Sales Executive, Operations); business-unit scope and row-level authorization
- Company, contact, lead, opportunity, activity/task management
- Multi-currency quotes with line items, exchange-rate source, terms, status and revision history
- Approved quotation -> sales order -> shipment tracking (later)
- Exportable reporting, lead sources, conversion and response time
- Event log, change audit, duplicate detection, optional CRM integrations

## Architecture principles

Keep Django as the source of truth for product and CRM data. Next.js can render marketing pages statically initially and fetch Django data during later phases. Do not duplicate writes to both frameworks. Django Admin is for authorized employees; do not expose it as an open public CRM.

The `Opportunity`, `Task`, `Activity`, `Quotation` and `QuotationLine` models are a **foundation**, not finished workflows.
