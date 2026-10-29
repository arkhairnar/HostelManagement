# Dashboard and Room Overview — Change Log

## Dashboard
- Added six summary cards: students, rooms, available beds, pending leave applications, unresolved room issues, and unresolved mess issues.
- Added quick links to the associated rector sections and an Add New Student shortcut.
- Added a compact status snapshot of up to five rooms.
- Added a recent-activity list derived from records already in local state.
- Empty states are shown when no records exist; this change adds no sample records.

## Room Overview
- The existing detailed room search, issue filters, category inspection, room cards, and room detail drill-down remain in this section.
- Updated the page title and subtitle to emphasize detailed room monitoring.

## Testing
The bundled `node_modules` are Windows-specific in this environment, so build/lint could not be fully validated here. On Windows, run `npm install`, `npm run lint`, and `npm run build` and report any errors.
