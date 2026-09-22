# Instance screenshots

Captured on `dev399979` during the live verification pass (install9 of `x_cog_mah`, sample data loaded with
`npm run migrate`). Every PNG is a full-screen capture that was inspected visually before being recorded here;
"PASS" means the described state was seen on screen, not inferred from DOM text or HTTP status.

Recordings (attached to PR #3): the end-to-end walkthrough `mah-final-walkthrough-edited.mp4` and the
reconciliation supplement `mah-reconciliation-supplement-edited.mp4` (recorded after install9 fixed the UI Page).

## Coverage limits

- The reconciliation page shows target-side counts and legacy-UNID coverage; the source-vs-target comparison is
  `npm run reconcile` (`reports/`), not the page. Live totals (471 target rows, quantity 1134, price 70540.00) exceed
  the seeded totals because the walkthrough itself created records (HRQ0001092, SES0001017, MAH0001156 via REST).
- The DD Form 1348-6 record producer was rendered but the request lifecycle was exercised through the classic form;
  the status inquiry and SES producers were actually submitted.
- `MAH Nightly Aging` ran successfully (26 scanned, 14 red, 3 amber, 9 green, 0 updated): it proves execution and
  logging against already-classified cases, not a fresh threshold crossing.
- The server-side release lock was verified independently with a REST PATCH on HRQ0001091 (HTTP 403, record
  unchanged); the screenshot shows the form-side lock message.
- `sn_appauthor.all_company_keys` on the PDI still reads `2226893,cog` (needed for the `cog` vendor prefix); the
  property belongs to the private *Scoped App Author* application and could not be restored (43-property-read-only.png).

## Application menu and lists

| Screenshot | Result | Visible evidence |
|---|---|---|
| [01-app-menu.png](screens/01-app-menu.png) | PASS | MAH Case Management navigator expanded |
| [02-awards-cases.png](screens/02-awards-cases.png) | PASS | Populated Awards Cases list |
| [03-award-lines.png](screens/03-award-lines.png) | PASS | Populated Award Lines list |
| [04-requesters.png](screens/04-requesters.png) | PASS | Populated Requesters list |
| [05-authorization-files.png](screens/05-authorization-files.png) | PASS | Populated Authorization Files list |
| [06-engraving-jobs.png](screens/06-engraving-jobs.png) | PASS | Populated Engraving Jobs list |
| [07-shipments.png](screens/07-shipments.png) | PASS | Populated Shipments list |
| [08-heraldry-requests.png](screens/08-heraldry-requests.png) | PASS | Populated Heraldry Requests list |
| [09-request-lines.png](screens/09-request-lines.png) | PASS | Populated Request Lines list |
| [10-heraldic-items.png](screens/10-heraldic-items.png) | PASS | Populated Heraldic Items list |
| [11-ses-flag-requests.png](screens/11-ses-flag-requests.png) | PASS | Populated SES Flag Requests list |
| [12-vendors.png](screens/12-vendors.png) | PASS | Populated Vendors list |
| [13-case-notes.png](screens/13-case-notes.png) | PASS | Populated Case Notes list |
| [14-legacy-status-map.png](screens/14-legacy-status-map.png) | PASS | Populated Number values MSM000xxxx |
| [15-migration-exceptions.png](screens/15-migration-exceptions.png) | PASS | Populated migration exceptions |

## Awards case form and related lists

| Screenshot | Result | Visible evidence |
|---|---|---|
| [16-awards-case-top.png](screens/16-awards-case-top.png) | PASS | MAH0001103 populated fields and Award Lines |
| [17-related-award-lines.png](screens/17-related-award-lines.png) | PASS | Four child Award Lines |
| [17-related-shipments.png](screens/17-related-shipments.png) | PASS | Two child Shipments |
| [17-related-notes.png](screens/17-related-notes.png) | PASS | One child Case Note |

## DD Form 1348-6 lifecycle: validation, submit, review, release, release lock

| Screenshot | Result | Visible evidence |
|---|---|---|
| [18-dd-validation-errors.png](screens/18-dd-validation-errors.png) | PASS | Invalid insert; document number, DODAAC, UIC validation errors |
| [19-dd-draft.png](screens/19-dd-draft.png) | PASS | Corrected HRQ0001092 saved Draft |
| [20-request-line-price.png](screens/20-request-line-price.png) | PASS | Quantity 2, unit price 204.75, extended price 409.5 |
| [21-dd-submitted.png](screens/21-dd-submitted.png) | PASS | HRQ0001092 Submitted |
| [22-dd-in-review.png](screens/22-dd-in-review.png) | PASS | HRQ0001092 In Review |
| [23-dd-released.png](screens/23-dd-released.png) | PASS | HRQ0001092 Released to Vendor |
| [23-dd-release-date.png](screens/23-dd-release-date.png) | PASS | Clearfield vendor and release date 2026-09-21 |
| [24-dd-release-lock.png](screens/24-dd-release-lock.png) | PASS | Request has been released to vendor and may not be modified |

## Record producers (status inquiry, DD Form 1348-6, SES flag)

| Screenshot | Result | Visible evidence |
|---|---|---|
| [25-awards-producer.png](screens/25-awards-producer.png) | PASS | Status inquiry producer renders |
| [25-status-negative.png](screens/25-status-negative.png) | PASS | Generic no-case-matched response |
| [25-status-success.png](screens/25-status-success.png) | PASS | MAH0001154 Authorized; items on case 2 |
| [26-dd-producer.png](screens/26-dd-producer.png) | PASS | DD Form 1348-6 catalog producer form renders |
| [27-ses-producer.png](screens/27-ses-producer.png) | PASS | SES catalog producer filled with plausible values |
| [28-ses-confirmation.png](screens/28-ses-confirmation.png) | PASS | SES submission confirmation |
| [28-ses-created-list.png](screens/28-ses-created-list.png) | PASS | SES0001017 with submitted office, executive, position and quantity 1 |

## MAH Operations workspace

| Screenshot | Result | Visible evidence |
|---|---|---|
| [29-workspace-dashboard.png](screens/29-workspace-dashboard.png) | PASS | Scoped workspace counters/charts show real data |
| [30-workspace-queues.png](screens/30-workspace-queues.png) | PASS | Five List - Simple widgets rendered real rows, no Unknown error regions |

## Reconciliation report (UI Page, install9)

| Screenshot | Result | Visible evidence |
|---|---|---|
| [33-reconciliation-report.png](screens/33-reconciliation-report.png) | PASS | Install9: seven numeric cards, all 12 target-table rows and exceptions |
| [33b-reconciliation-vendor-denied.png](screens/33b-reconciliation-vendor-denied.png) | PASS | Install9: generic unauthorized message and Reference ID, no report data |
| [33d-reconciliation-distributions.png](screens/33d-reconciliation-distributions.png) | PASS | Install9: populated case stages, aging flags and request states |
| [33e-reconciliation-queues-json.png](screens/33e-reconciliation-queues-json.png) | PASS | Install9: five work queues and populated Raw JSON |

## Vendor-role isolation (impersonating mah.vendor.clearfield)

| Screenshot | Result | Visible evidence |
|---|---|---|
| [34-vendor-requests.png](screens/34-vendor-requests.png) | PASS | Five released Clearfield requests only |
| [35-vendor-lines.png](screens/35-vendor-lines.png) | PASS | Seven matching child lines only |
| [36-vendor-awards-denied.png](screens/36-vendor-awards-denied.png) | PASS | Awards Cases access denied while impersonating vendor |
| [36-vendor-identity.png](screens/36-vendor-identity.png) | PASS | Evelyn Fortenbury impersonation identity |

## Scripted REST intake

| Screenshot | Result | Visible evidence |
|---|---|---|
| [37-rest-results.png](screens/37-rest-results.png) | PASS | Health 200, positive status 200, invalid status 404, intake 201 |
| [38-rest-created-case-list.png](screens/38-rest-created-case-list.png) | PASS | MAH0001156 appears in Awards Cases list |
| [38-rest-created-case.png](screens/38-rest-created-case.png) | PASS | New case, unique source ID, linked file, two award lines |
| [39-rest-authorization-file.png](screens/39-rest-authorization-file.png) | PASS | MAF0001018 Parsed; accepted 1, rejected/duplicates 0 |

## MAH Nightly Aging

| Screenshot | Result | Visible evidence |
|---|---|---|
| [40-nightly-aging-job.png](screens/40-nightly-aging-job.png) | PASS | Active MAH Nightly Aging job with Execute Now |
| [41-nightly-aging-success.png](screens/41-nightly-aging-success.png) | PASS | New system job_run outcome success at 2026-09-21T22:44:45.788Z |
| [42-aging-flags.png](screens/42-aging-flags.png) | PASS | Seventeen cases: three Amber and fourteen Red |

## Instance cleanup

| Screenshot | Result | Visible evidence |
|---|---|---|
| [43-property-read-only.png](screens/43-property-read-only.png) | BLOCKED | Private Scoped App Author property cannot be edited |
