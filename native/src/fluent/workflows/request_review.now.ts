/**
 * Heraldry-request review flow — native approval engine replaces v1's hand-written supervisor
 * review / rollback business rules.
 *
 * Trigger: a DD Form 1348-6 request moves to Submitted. The flow puts it In Review, asks the
 * TACOM Awards Staff group for approval (sysapproval_approver rows appear on the form's Approvers
 * related list and in "My Approvals"), then either stamps approved_at and notes the approval in the
 * activity stream, or rolls the request back to Draft with the rejection in work notes so the
 * requester can correct and resubmit. Releasing to the vendor stays a deliberate UI action.
 */
import '@servicenow/sdk/global'
import { action, Flow, trigger, wfa } from '@servicenow/sdk/automation'

Flow(
    {
        $id: Now.ID['flow_request_review'],
        name: 'MAH Native Heraldry request review approval',
        description: 'Submitted DD Form 1348-6 requests go In Review and are approved or rejected by the TACOM Awards Staff group through the native approval engine.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['flow_review_trigger'], annotation: 'Request submitted' },
        {
            table: 'x_cog_mah_native_heraldry_request',
            condition: 'stageCHANGESTOsubmitted^active=true',
            run_flow_in: 'background',
            trigger_strategy: 'every',
        }
    ),
    (params) => {
        wfa.action(
            action.core.updateRecord,
            { $id: Now.ID['flow_review_set_in_review'], annotation: 'Move to In Review' },
            {
                table_name: 'x_cog_mah_native_heraldry_request',
                record: wfa.dataPill(params.trigger.current, 'reference'),
                values: TemplateValue({
                    stage: 'in_review',
                    work_notes: 'Submitted for review; approval requested from TACOM Awards Staff.',
                }),
            }
        )
        const approval = wfa.action(
            action.core.askForApproval,
            { $id: Now.ID['flow_review_ask_approval'], annotation: 'Ask TACOM Awards Staff for approval' },
            {
                table: 'x_cog_mah_native_heraldry_request',
                record: wfa.dataPill(params.trigger.current, 'reference'),
                approval_reason: 'DD Form 1348-6 heraldry request review',
                approval_field: 'approval',
                approval_conditions: wfa.approvalRules({
                    conditionType: 'OR',
                    ruleSets: [
                        {
                            action: 'Approves',
                            conditionType: 'AND',
                            rules: [[{ ruleType: 'Any', users: [], groups: ['e053d6c34c37418a9f80fa53e9e40230'], manual: false }]], // group_tacom (generated/keys.ts)
                        },
                        {
                            action: 'Rejects',
                            conditionType: 'AND',
                            rules: [[{ ruleType: 'Any', users: [], groups: ['e053d6c34c37418a9f80fa53e9e40230'], manual: false }]],
                        },
                    ],
                }),
            }
        )
        wfa.flowLogic.if(
            {
                $id: Now.ID['flow_review_if_approved'],
                label: 'Approved',
                condition: `${wfa.dataPill(approval.approval_state, 'string')}=approved`,
            },
            () => {
                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['flow_review_mark_approved'], annotation: 'Stamp approval; ready to release' },
                    {
                        table_name: 'x_cog_mah_native_heraldry_request',
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        values: TemplateValue({
                            approved_at: wfa.dataPill(params.trigger.current.sys_updated_on, 'glide_date_time'),
                            work_notes: 'Approved by TACOM Awards Staff. Use "Release to Vendor" to hand the request to the vendor company.',
                        }),
                    }
                )
            }
        )
        wfa.flowLogic.else(
            { $id: Now.ID['flow_review_else_rejected'], annotation: 'Rejected or cancelled' },
            () => {
                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['flow_review_rollback'], annotation: 'Rejected: send back to Submitted' },
                    {
                        table_name: 'x_cog_mah_native_heraldry_request',
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        values: TemplateValue({
                            stage: 'submitted',
                            work_notes: 'Rejected in review by TACOM Awards Staff; sent back to Submitted for correction (the stage machine only allows in_review → submitted).',
                        }),
                    }
                )
            }
        )
    }
)
