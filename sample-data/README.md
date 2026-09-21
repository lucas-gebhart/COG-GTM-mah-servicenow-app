# Sample legacy export set

A deterministic miniature of the legacy Domino CSV export that feeds the `x_cog_mah` migration for this modernization reference application.
One file per form in `LEGACY_FORMS` (`src/server/lib/legacyContract.ts`), headers exactly as `csvHeader(form)` writes them, RFC 4180 quoting.
All people, units, addresses and identifiers are synthetic.

Generated with seed `20260901` at fixed clock `2026-09-01T12:00:00Z`. 455 documents, 455 distinct UNIDs.

## Volumes

| File | Legacy form | Rows |
| --- | --- | --- |
| heraldry-Vendor.csv | Vendor | 6 |
| heraldry-HeraldicItem.csv | HeraldicItem | 15 |
| vetmedals-Requester.csv | Requester | 45 |
| heraldry-Requester.csv | Requester | 20 |
| vetmedals-AuthorizationFile.csv | AuthorizationFile | 4 |
| vetmedals-AwardsCase.csv | AwardsCase | 50 |
| vetmedals-AwardLine.csv | AwardLine | 120 |
| vetmedals-EngravingJob.csv | EngravingJob | 15 |
| vetmedals-ShipmentRecord.csv | ShipmentRecord | 40 |
| vetmedals-CaseNote.csv | CaseNote | 30 |
| heraldry-Request.csv | Request | 30 |
| heraldry-RequestLine.csv | RequestLine | 75 |
| heraldry-SESFlagRequest.csv | SESFlagRequest | 5 |

## Intentional defects

Counts below are computed by `auditSampleData()` in `tools/generate-sample-data.ts`, which re-reads the CSV text with the same helpers
the transform uses (`mapLegacyStatus`, `normalizeLegacyDate`, `computeDedupeKey`, `computeAgingFlag`). `tests/sampleData.test.ts` asserts the same numbers.

| Defect | Count | Detail |
| --- | --- | --- |
| Status spellings not in the status map (AuthorizationFile.ImportStatus) | 1 | 3 distinct raw spellings; unmapped: `Loaded - Manual` |
| Status spellings not in the status map (AwardsCase.Stage) | 3 | 19 distinct raw spellings; unmapped: `Assy-QC`, `On Hold` |
| Status spellings not in the status map (AwardLine.LineStatus) | 2 | 16 distinct raw spellings; unmapped: `Hold`, `Pending Pick` |
| Status spellings not in the status map (EngravingJob.JobStatus) | 2 | 9 distinct raw spellings; unmapped: `Awaiting Proof`, `Machine Down` |
| Status spellings not in the status map (ShipmentRecord.ShipStatus) | 2 | 9 distinct raw spellings; unmapped: `Awaiting Pickup`, `Out for Delivery` |
| Status spellings not in the status map (Request.Status) | 2 | 18 distinct raw spellings; unmapped: `Awaiting Funds`, `Pending Vendor Ack` |
| Status spellings not in the status map (RequestLine.LineStatus) | 2 | 14 distinct raw spellings; unmapped: `Awaiting Vendor`, `Partial Ship` |
| Status spellings not in the status map (SESFlagRequest.Status) | 1 | 5 distinct raw spellings; unmapped: `Pending Approval` |
| Mixed date formats (all date columns) | 1864 | iso: 22, us: 366, us_datetime: 1409, notes: 45, compact: 22 |
| Unparseable dates | 3 | AwardsCase.AuthorizationDate = `13/45/2026`, ShipmentRecord.ShippedDate = `N/A`, Request.RequiredDeliveryDate = `2026-02-30` |
| Duplicate requester groups (vetmedals Requester) | 4 | RQ000004/RQ000045 (0 already MergedInto); RQ000001/RQ000041/RQ000042 (1 already MergedInto); RQ000002/RQ000043 (1 already MergedInto); RQ000003/RQ000044 (0 already MergedInto) |
| Orphan rows (AwardLine.ParentUNID -> AwardsCase) | 3 | parent UNID not in parent file |
| Orphan rows (EngravingJob.CaseNumber -> AwardsCase) | 1 | parent business key not in parent file |
| Orphan rows (ShipmentRecord.CaseNumber -> AwardsCase) | 1 | parent business key not in parent file |
| Orphan rows (CaseNote.ParentUNID -> AwardsCase) | 0 | parent UNID not in parent file |
| Orphan rows (RequestLine.ParentUNID -> Request) | 2 | parent UNID not in parent file |
| Envelope ParentUNID != form ParentUNID (AwardLine) | 2 | second ParentUNID header carries a different value |
| Envelope ParentUNID != form ParentUNID (CaseNote) | 0 | second ParentUNID header carries a different value |
| Duplicate business key (AwardsCase.CaseNumber) | 1 | `VMA-2013-000001` |
| Duplicate business key (AwardLine.LineKey) | 1 | `VMA-2024-000001|01` |
| VendorKey absent from heraldry-Vendor.csv (Request) | 1 | `1K7Q3` |
| VendorKey absent from heraldry-Vendor.csv (RequestLine) | 4 | `1K7Q3` |
| Stage=Closed with empty ClosedDate (AwardsCase) | 1 |  |
| ShipStatus=Delivered with empty DeliveredDate (ShipmentRecord) | 1 |  |
| ExtendedPrice != Quantity x UnitPrice (RequestLine) | 1 |  |
| Status=Draft with ReleasedDate set (Request) | 1 |  |
| Quantity above 999 (AwardLine) | 1 |  |
| Non-uppercase EngravingText (AwardLine) | 2 |  |
| Returned shipment (ShipmentRecord) | 1 |  |
| Aging spread of open cases at the clock | 20 | green (<60 days): 8, amber (60-74): 6, red (>=75): 6 |
| Cells with embedded line breaks / quotes / commas | 18 | newline: 18, quote: 41, comma: 457 |

## Regenerate

```sh
npm run gen:sample-data             # rewrite sample-data/*.csv and this README
npm run gen:sample-data -- --check  # fail if the files on disk are stale
```

This file is generated - edit `tools/generate-sample-data.ts` instead.
