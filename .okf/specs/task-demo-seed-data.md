# Task: Seed demo rooms and bookings

## Vision alignment

- Product goal: Let reviewers explore room search, calendars, and bookings with
  useful initial data.
- User-facing or developer-facing outcome: A new database receives 10 rooms and
  70 future bookings for the demo employee and admin accounts.
- Explicitly out of scope: Production data loading, user-account persistence,
  and reseeding on every application restart.

## Scope

In:

- Add an append-only Flyway migration that expands room fixtures and seeds a
  week's worth of future bookings.
- Document the seeded demo data.

Out:

- Editing existing migrations or changing booking APIs/business rules.

## Acceptance criteria

- [x] Existing V1 migration remains unchanged.
- [x] V2 adds six rooms and up to 70 non-overlapping future bookings across ten
  rooms (70 on a fresh database).
- [x] Bookings are owned by the documented demo accounts and use relative dates.
- [x] README explains seed contents and one-time-per-database behavior.

## Affected areas

- API/UI: None.
- Data/migration: Append-only Flyway migration V2.
- Modules/files: Backend migration and README.

## Dependencies and open questions

- Updated backend image must be published and pulled for an existing deployment
  to receive V2.

## Verification

- Manually review that the generated slots are future-dated and non-overlapping.
- The migration will be applied by Flyway when an updated backend image starts;
  no database was reset or reseeded during this code change.

## Done notes

- Implementation: Added six rooms and up to 70 upcoming bookings distributed
  between the employee and admin demo accounts; pre-existing confirmed
  bookings are checked to avoid slot conflicts.
- Checks run and results: No automated tests were run for this change.
