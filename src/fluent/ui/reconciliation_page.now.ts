/**
 * Operator-facing reconciliation report, rendered server-side. The application module links here
 * rather than to the Scripted REST route because a browser session cannot call the REST layer
 * without a user token ("User is not authenticated"); the page and the route share
 * `buildReconciliationReport()` and the same role gate.
 */
import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

export const RECONCILIATION_PAGE_ENDPOINT = 'x_cog_mah_reconciliation.do'

export const reconciliationPage = UiPage({
    $id: Now.ID['ui_page_reconciliation'],
    endpoint: RECONCILIATION_PAGE_ENDPOINT,
    category: 'general',
    direct: true,
    description: 'Migration reconciliation report: rows per table, legacy UNID coverage, quantity and price totals, orphans, merges, unmapped statuses, work queues.',
    html: Now.include('../../server/pages/reconciliation.html'),
})
