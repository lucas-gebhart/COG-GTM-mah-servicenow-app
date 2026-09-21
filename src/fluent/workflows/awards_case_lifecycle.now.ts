/**
 * Awards-case lifecycle flow (Flow Designer, authored in Fluent).
 *
 * Replaces the orchestration half of the legacy `CaseStageChanged` agent. The before/after
 * business rules stay authoritative for validation, stage guard rails and event firing;
 * this flow owns the *long-running* work that a business rule should not do:
 *   - warehouse hand-off: create the pending shipment record the pick/pack team works from
 *   - priority handling (congressional / funeral): leave a customer-visible tracking note
 *   - shipped: wait (up to 21 days) for the carrier to confirm delivery, then close the case
 *     or leave a system note so the CSR chases the carrier.
 */
import '@servicenow/sdk/global'
import { action, Flow, trigger, wfa } from '@servicenow/sdk/automation'

Flow(
    {
        $id: Now.ID['flow_awards_case_lifecycle'],
        name: 'MAH Awards case lifecycle',
        description:
            'Warehouse hand-off, priority-handling notes and shipped→closed follow-through for awards cases. Validation and stage guard rails live in the business rules.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['flow_case_trigger'], annotation: 'Stage changed on an active awards case' },
        {
            table: 'x_cog_mah_awards_case',
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
                    action.core.createRecord,
                    { $id: Now.ID['flow_case_priority_note'], annotation: 'Customer-visible tracking note' },
                    {
                        table_name: 'x_cog_mah_case_note',
                        values: TemplateValue({
                            awards_case: wfa.dataPill(params.trigger.current, 'reference'),
                            note_type: 'system',
                            customer_visible: true,
                            body: 'Priority-handling case advanced to the next fulfilment stage. Tracked for same-day action by the awards team.',
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
                    { $id: Now.ID['flow_case_find_shipment'], annotation: 'Open shipments already on the case' },
                    {
                        table: 'x_cog_mah_shipment',
                        conditions: `awards_case=${wfa.dataPill(params.trigger.current.sys_id, 'string')}^statusINpending,label_created,in_transit`,
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
                            { $id: Now.ID['flow_case_create_shipment'], annotation: 'Pending shipment for pick/pack' },
                            {
                                table_name: 'x_cog_mah_shipment',
                                values: TemplateValue({
                                    awards_case: wfa.dataPill(params.trigger.current, 'reference'),
                                    status: 'pending',
                                    carrier: 'usps',
                                    ship_to: wfa.dataPill(params.trigger.current.ship_to_name, 'string'),
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
                        table_name: 'x_cog_mah_awards_case',
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
                            action.core.createRecord,
                            { $id: Now.ID['flow_case_timeout_note'], annotation: 'Ask the CSR to chase the carrier' },
                            {
                                table_name: 'x_cog_mah_case_note',
                                values: TemplateValue({
                                    awards_case: wfa.dataPill(params.trigger.current, 'reference'),
                                    note_type: 'system',
                                    customer_visible: false,
                                    body: 'Shipment has not been confirmed delivered within 21 days. Verify carrier tracking and contact the requester.',
                                }),
                            }
                        )
                        wfa.action(
                            action.core.updateRecord,
                            { $id: Now.ID['flow_case_timeout_worknote'] },
                            {
                                table_name: 'x_cog_mah_awards_case',
                                record: wfa.dataPill(params.trigger.current, 'reference'),
                                values: TemplateValue({
                                    work_notes: 'Delivery follow-up required: no carrier confirmation after 21 days in Shipped.',
                                }),
                            }
                        )
                    }
                )
            }
        )
    }
)
