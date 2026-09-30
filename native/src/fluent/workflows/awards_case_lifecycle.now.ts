/**
 * Awards-case lifecycle flow (Flow Designer, authored in Fluent).
 *
 * Native version of v1's flow: the customer-visible tracking note and the delivery follow-up are
 * plain `comments` / `work_notes` journal updates on the task (activity stream) instead of rows
 * in a custom case_note table, and the pending shipment is a child task (parent = the case) that
 * assignment rules route to the Warehouse group. Validation and stage guard rails live in the
 * business rules; aging is the platform Task SLA, so this flow has no aging step.
 */
import '@servicenow/sdk/global'
import { action, Flow, trigger, wfa } from '@servicenow/sdk/automation'

Flow(
    {
        $id: Now.ID['flow_awards_case_lifecycle'],
        name: 'MAH Native Awards case lifecycle',
        description:
            'Warehouse hand-off (child shipment task), priority-handling activity note and shipped→closed follow-through for awards cases. Validation and stage guard rails live in the business rules; aging is the Task SLA.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['flow_case_trigger'], annotation: 'Stage changed on an active awards case' },
        {
            table: 'x_cog_mah_native_awards_case',
            condition: 'stageCHANGES^active=true',
            run_flow_in: 'background',
            trigger_strategy: 'every',
        }
    ),
    (params) => {
        wfa.flowLogic.if(
            {
                $id: Now.ID['flow_case_if_priority'],
                label: 'Priority handling case',
                condition: `${wfa.dataPill(params.trigger.current.priority_handling, 'boolean')}=true`,
            },
            () => {
                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['flow_case_priority_note'], annotation: 'Customer-visible tracking note (comments journal)' },
                    {
                        table_name: 'x_cog_mah_native_awards_case',
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        values: TemplateValue({
                            comments: 'Priority-handling case advanced to the next fulfilment stage. Tracked for same-day action by the awards team.',
                        }),
                    }
                )
            }
        )
        wfa.flowLogic.if(
            {
                $id: Now.ID['flow_case_if_warehouse'],
                label: 'Entered Warehouse',
                condition: `${wfa.dataPill(params.trigger.current.stage, 'choice')}=warehouse`,
            },
            () => {
                const existing = wfa.action(
                    action.core.lookUpRecords,
                    { $id: Now.ID['flow_case_find_shipment'], annotation: 'Open shipment tasks already on the case' },
                    {
                        table: 'x_cog_mah_native_shipment',
                        conditions: `awards_case=${wfa.dataPill(params.trigger.current.sys_id, 'string')}^active=true`,
                        max_results: 1,
                    }
                )
                wfa.flowLogic.if(
                    {
                        $id: Now.ID['flow_case_if_no_shipment'],
                        label: 'No open shipment yet',
                        condition: `${wfa.dataPill(existing.Count, 'integer')}=0`,
                    },
                    () => {
                        wfa.action(
                            action.core.createRecord,
                            { $id: Now.ID['flow_case_create_shipment'], annotation: 'Pending shipment task for pick/pack (parent = case)' },
                            {
                                table_name: 'x_cog_mah_native_shipment',
                                values: TemplateValue({
                                    awards_case: wfa.dataPill(params.trigger.current, 'reference'),
                                    parent: wfa.dataPill(params.trigger.current, 'reference'),
                                    stage: 'pending',
                                    carrier: 'usps',
                                    ship_to: wfa.dataPill(params.trigger.current.ship_to_name, 'string'),
                                    short_description: `Ship awards case ${wfa.dataPill(params.trigger.current.number, 'string')}`,
                                }),
                            }
                        )
                    }
                )
            }
        )
        wfa.flowLogic.if(
            {
                $id: Now.ID['flow_case_if_shipped'],
                label: 'Entered Shipped',
                condition: `${wfa.dataPill(params.trigger.current.stage, 'choice')}=shipped`,
            },
            () => {
                const wait = wfa.action(
                    action.core.waitForCondition,
                    { $id: Now.ID['flow_case_wait_delivery'], annotation: 'Wait up to 21 days for delivery confirmation' },
                    {
                        table_name: 'x_cog_mah_native_awards_case',
                        record: `${wfa.dataPill(params.trigger.current, 'reference')}`,
                        conditions: 'stage=closed^ORstage=cancelled',
                        timeout_flag: true,
                        timeout_duration: Duration({ days: 21 }),
                    }
                )
                wfa.flowLogic.if(
                    {
                        $id: Now.ID['flow_case_if_delivery_timeout'],
                        label: 'No delivery confirmation in 21 days',
                        condition: `${wfa.dataPill(wait.state, 'string')}=1`,
                    },
                    () => {
                        wfa.action(
                            action.core.updateRecord,
                            { $id: Now.ID['flow_case_timeout_worknote'], annotation: 'Ask the CSR to chase the carrier (work notes)' },
                            {
                                table_name: 'x_cog_mah_native_awards_case',
                                record: wfa.dataPill(params.trigger.current, 'reference'),
                                values: TemplateValue({
                                    work_notes: 'Delivery follow-up required: no carrier confirmation after 21 days in Shipped. Verify carrier tracking and contact the requester.',
                                }),
                            }
                        )
                    }
                )
            }
        )
    }
)
