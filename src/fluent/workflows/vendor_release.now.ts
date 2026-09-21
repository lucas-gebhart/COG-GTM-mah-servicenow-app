/**
 * Vendor-release flow (Flow Designer, authored in Fluent).
 *
 * Replaces the legacy `ReleaseToVendor` agent + the manual follow-up the CSRs did from the
 * "Requests\By Vendor" view. The before rule already locks the header the moment
 * `released_to_vendor` is set; this flow drives the vendor side of the lifecycle:
 *   1. notify the vendor portal contact,
 *   2. wait (5 calendar days) for the vendor to acknowledge — escalate if they do not,
 *   3. when the vendor records a ship date, move the request to Shipped and note it.
 */
import '@servicenow/sdk/global'
import { action, Flow, trigger, wfa } from '@servicenow/sdk/automation'
import { requestReleasedNotification } from '../notifications/notifications.now'

Flow(
    {
        $id: Now.ID['flow_vendor_release'],
        name: 'MAH Heraldry request vendor release',
        description:
            'Vendor notification, 5-day acknowledgement follow-up and ship-date handling once a DD Form 1348-6 request is released to a vendor.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['flow_vendor_trigger'], annotation: 'Request released to vendor' },
        {
            table: 'x_cog_mah_heraldry_request',
            condition: 'released_to_vendorCHANGES^released_to_vendorISNOTEMPTY^vendorISNOTEMPTY',
            run_flow_in: 'background',
            trigger_strategy: 'once',
        }
    ),
    (params) => {
        wfa.action(
            action.core.sendNotification,
            { $id: Now.ID['flow_vendor_notify'], annotation: 'Release notice to the vendor contact' },
            {
                notification: requestReleasedNotification,
                table_name: 'x_cog_mah_heraldry_request',
                record: wfa.dataPill(params.trigger.current, 'reference'),
            }
        )

        const ack = wfa.action(
            action.core.waitForCondition,
            { $id: Now.ID['flow_vendor_wait_ack'], annotation: 'Vendor acknowledgement within 5 days' },
            {
                table_name: 'x_cog_mah_heraldry_request',
                record: `${wfa.dataPill(params.trigger.current, 'reference')}`,
                conditions: 'vendor_acknowledgedISNOTEMPTY^ORstateINcancelled,complete',
                timeout_flag: true,
                timeout_duration: Duration({ days: 5 }),
            }
        )

        wfa.flowLogic.if(
            {
                $id: Now.ID['flow_vendor_if_no_ack'],
                label: 'Vendor has not acknowledged',
                condition: `${wfa.dataPill(ack.state, 'string')}=1`,
            },
            () => {
                wfa.action(
                    action.core.createRecord,
                    { $id: Now.ID['flow_vendor_no_ack_note'] },
                    {
                        table_name: 'x_cog_mah_case_note',
                        values: TemplateValue({
                            heraldry_request: wfa.dataPill(params.trigger.current, 'reference'),
                            note_type: 'system',
                            customer_visible: false,
                            body: 'Vendor has not acknowledged the release within 5 days. Contact the vendor POC and confirm production start.',
                        }),
                    }
                )
                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['flow_vendor_no_ack_worknote'] },
                    {
                        table_name: 'x_cog_mah_heraldry_request',
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        values: TemplateValue({
                            work_notes: 'Vendor acknowledgement overdue (5 days). CSR follow-up required.',
                        }),
                    }
                )
            }
        )

        const shipped = wfa.action(
            action.core.waitForCondition,
            { $id: Now.ID['flow_vendor_wait_ship'], annotation: 'Vendor ship date recorded' },
            {
                table_name: 'x_cog_mah_heraldry_request',
                record: `${wfa.dataPill(params.trigger.current, 'reference')}`,
                conditions: 'vendor_ship_dateISNOTEMPTY^ORstateINshipped,complete,cancelled',
                timeout_flag: false,
            }
        )

        wfa.flowLogic.if(
            {
                $id: Now.ID['flow_vendor_if_shipped'],
                label: 'Ship date recorded while in production',
                condition: `${wfa.dataPill(shipped.state, 'string')}=0^${wfa.dataPill(params.trigger.current.state, 'choice')}INreleased_to_vendor,in_production`,
            },
            () => {
                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['flow_vendor_mark_shipped'], annotation: 'Move the request to Shipped' },
                    {
                        table_name: 'x_cog_mah_heraldry_request',
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        values: TemplateValue({
                            state: 'shipped',
                            work_notes: 'Vendor recorded a ship date; request moved to Shipped by the vendor-release flow.',
                        }),
                    }
                )
            }
        )
    }
)
