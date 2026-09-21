import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '2dd75b3d1cf64bf7a030937706b4fc62'
                    }
                    br_authorization_file_before: {
                        table: 'sys_script'
                        id: 'e892e5bb6ae0403b91ab18d1d796b39d'
                    }
                    br_award_line_after: {
                        table: 'sys_script'
                        id: 'e5db3769bee84df99e8bf8cea05b98dc'
                    }
                    br_award_line_before: {
                        table: 'sys_script'
                        id: '2ef416519c654f4db0a0b0633e91aa97'
                    }
                    br_awards_case_after: {
                        table: 'sys_script'
                        id: '5e71151bfb00498385cc9fbd06d87629'
                    }
                    br_awards_case_before: {
                        table: 'sys_script'
                        id: '45d09b0e8af14b62aaebfff6c973f51a'
                    }
                    br_case_note_before: {
                        table: 'sys_script'
                        id: 'ecf5e16433684b9bba45d1451adb83a9'
                    }
                    br_case_note_vendor_query: {
                        table: 'sys_script'
                        id: 'b98242b518cb4c3e9e41bef542065ede'
                    }
                    br_engraving_job_after: {
                        table: 'sys_script'
                        id: 'e79fc7b136f043a0af05aca2947f931a'
                    }
                    br_engraving_job_before: {
                        table: 'sys_script'
                        id: 'b3aa461058e6490a89eb15b1176a6653'
                    }
                    br_heraldic_item_before: {
                        table: 'sys_script'
                        id: '2a720a8ee08f46d98c3c3ea8d5718414'
                    }
                    br_heraldry_request_after: {
                        table: 'sys_script'
                        id: '08a3abd74a7147cb84be8729a1343f61'
                    }
                    br_heraldry_request_before: {
                        table: 'sys_script'
                        id: 'b43d3541b49349afbf37fa8fb15a4cfc'
                    }
                    br_heraldry_request_vendor_query: {
                        table: 'sys_script'
                        id: '27e165a532854811ab48263c7d26633e'
                    }
                    br_request_line_after: {
                        table: 'sys_script'
                        id: 'e626a9438cde440f93b1602c0bf36016'
                    }
                    br_request_line_before: {
                        table: 'sys_script'
                        id: '68eda8901dd846f8b58724572fb7ef93'
                    }
                    br_request_line_vendor_query: {
                        table: 'sys_script'
                        id: '461ca290271c4b0984f615ac96b921e1'
                    }
                    br_requester_after: {
                        table: 'sys_script'
                        id: '31ff43c7eb0c461383e7ee5e76fc872f'
                    }
                    br_requester_before: {
                        table: 'sys_script'
                        id: '07ab87928f1442eb8745b5a086a7a40d'
                    }
                    br_ses_flag_after: {
                        table: 'sys_script'
                        id: '1f2eb892eff54aa09ca391359c50eebc'
                    }
                    br_ses_flag_before: {
                        table: 'sys_script'
                        id: '09470534c3474d33b7592b24cefe001d'
                    }
                    br_shipment_after: {
                        table: 'sys_script'
                        id: '3fac90663e9a4fb49a439dc2b32a0f70'
                    }
                    br_shipment_before: {
                        table: 'sys_script'
                        id: '0da66a5ba049461ab37f3df1068b4a86'
                    }
                    br_vendor_before: {
                        table: 'sys_script'
                        id: 'ce8a854fd42349fc9bf9ca2aaf00d0c9'
                    }
                    br_vendor_query: {
                        table: 'sys_script'
                        id: 'aec4175487af4c2c9b8b87f13bda8694'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '8f7bc9f3144c4e5582d1b1a1c4e968f7'
                    }
                    src_server_jobs_nightlyAging_ts: {
                        table: 'sys_module'
                        id: 'b8f83e2e2d8b4ecfb06609800eb26d72'
                    }
                    src_server_lib_aging_ts: {
                        table: 'sys_module'
                        id: '2442072237054d6a8452bcf4849a26c3'
                    }
                    src_server_lib_authFileParser_ts: {
                        table: 'sys_module'
                        id: 'b6e551591e8148fc9ca79657d09f25db'
                    }
                    src_server_lib_dates_ts: {
                        table: 'sys_module'
                        id: 'aa71690c33c047a2ad9fa88526fbab01'
                    }
                    src_server_lib_dedupe_ts: {
                        table: 'sys_module'
                        id: '5534e4767d66457ebf16dd05ec7c3efa'
                    }
                    src_server_lib_domain_ts: {
                        table: 'sys_module'
                        id: '50307a36f99a4a839304c8f38c935e90'
                    }
                    src_server_lib_logging_ts: {
                        table: 'sys_module'
                        id: '525c1065cb5947f6be36fe67ff0f4de7'
                    }
                    src_server_lib_pricing_ts: {
                        table: 'sys_module'
                        id: 'c554552255a74420aee2a7ccb9d78288'
                    }
                    src_server_lib_stageMachine_ts: {
                        table: 'sys_module'
                        id: '09e2ffae673c4ed09d65deb9b5f7fd47'
                    }
                    src_server_lib_statusMap_ts: {
                        table: 'sys_module'
                        id: 'de47ca1d73b9461d9a41a9abb5823025'
                    }
                    src_server_lib_validators_ts: {
                        table: 'sys_module'
                        id: '2140277860d54e57830314b13f95256c'
                    }
                    src_server_rest_authorizationIntake_ts: {
                        table: 'sys_module'
                        id: 'a4a70a3fac9c4ebf8bf63e3be1137c7f'
                    }
                    src_server_rules_awardLine_ts: {
                        table: 'sys_module'
                        id: '517d257704734fa3b11711f0830e147e'
                    }
                    src_server_rules_awardsCase_ts: {
                        table: 'sys_module'
                        id: '778733e6057b4485a47172ae85002621'
                    }
                    src_server_rules_fulfilment_ts: {
                        table: 'sys_module'
                        id: 'f3c8a0ed00b2443eadd1c82dd6985792'
                    }
                    src_server_rules_glideSupport_ts: {
                        table: 'sys_module'
                        id: 'e45f8df6da8941df894516295035cf56'
                    }
                    src_server_rules_heraldryRequest_ts: {
                        table: 'sys_module'
                        id: '4993a8d7c5014a929c0d2a74661377f2'
                    }
                    src_server_rules_reference_ts: {
                        table: 'sys_module'
                        id: 'abe1bcfc0fce435ebc4d7061d9ca180c'
                    }
                    src_server_rules_requester_ts: {
                        table: 'sys_module'
                        id: '30f722a4ec014daf870ca9b3ad8762be'
                    }
                    src_server_rules_requestLine_ts: {
                        table: 'sys_module'
                        id: 'ff8c858d7d564f88898cd4ba85ae82a6'
                    }
                    src_server_rules_vendorIsolation_ts: {
                        table: 'sys_module'
                        id: '830a0470b78d4e18bff92c835b8a3fbf'
                    }
                }
                composite: [
                    {
                        table: 'sys_choice'
                        id: '00061bee721a409bb64a0d9c06011e0a'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'PG'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '000bac362e6a4bdd8f269c8fffd1753e'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '001b4d91f23f42bbbf182f114ccf5d92'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0039926dca82414987fccab33e00681d'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0076a34350f74ad0a48ee4381aace797'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '00b2a4eaa7ad479fa4964cc0c71e178a'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'portal_user'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0193a73c3356456cb727a39edcaaff1e'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '01d5cbc01bd849ad83673508a8d51e4c'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '01fe6be97576409e90caee77a002bd0e'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'justification'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '028a9d2667c04ddb8918aae1a8c8e558'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'arrowhead'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '028e3fcbffb6463495ee79110b9ba1d8'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'price'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '02af8db4aa454af49943b0cfc8391ce6'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'source_row'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '02d85cdcf40d4f92a7da399bf793c783'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'noncommissioned_officer_professional_development_ribbon'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0338ca7badb54870bbc2445acf5cb7e7'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '034c32577f5f4b25a7dcbba995699758'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'uic'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '03726dc7d0ef4c8cbbd37878e198044d'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '03e190f0add441a6a31067bbf60f2f4b'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                            value: 'fedex'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '04483937527e41a8a80c86449cced7c4'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '04a757bbbecd45b9b0568649fd2d78a2'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '04b2b612f1a94b2b96407ae1aa3aca88'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'submitted_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '04c69247bb4f4530a46d11f36e27f905'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_price'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '04cd51e04f1046d78c937e8474b65477'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '04d7d7c59252481084db2f8a0d7f34fe'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_city'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '04d7f5b3626c4c349b913bc28854a339'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '04ddc80a3974466887255f8e7216bbbc'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0519da4c26244e608001fb39b730760a'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'unit_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '051e3832e86446689a07c2fca5b5ea1a'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'zip'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '05701d436e134734bc227413f65989b6'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'source_table'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '06099d3232944b5aafd077fbdc8cd63b'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '08'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '064493918f41416da8a31612419884bf'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '06492d5f6e15469692f0d8ff61c39886'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0678f6022b2c427d85683bc804f75abb'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '06a5903c69964e349e755f1299896c7a'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '06e31977a3b8473ab9a56c162b5b6369'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '070e63c6d12d40779edf4ed62ae5c648'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '07124241f6dc4cda8448dfa21daa23e6'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'assignment_group'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '07276f712b1347d98eec60d31fb26a57'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'humanitarian_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '078c7acffb664cb6b6f5fad753cf88b0'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '07c026b469d8493ea2ab9130885e6343'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '08902b4b4db747d2b370823c26bb6696'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'vendor'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '08a9bea2c39446739c695bf99e67b163'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '092309230ccd4c19b999d9815328a05e'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '11'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0938136ca4884207b4546954cff26b42'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_address_2'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '094c3a47c5894759a2bf132c4802934f'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0993b435e27d4e2da8856c25dbfd9ffa'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'ship_to'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0a03d53ad7c54fc5ae87a632863816de'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'poc_email'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0a0d4e9087a243c9aedda93a2bbdbd0d'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'submitted_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0a54ab1ef02a48a2a236191c0bb018a7'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0a79944019e54bc9910df218a475b7c0'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requester_poc_email'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0aef58ce0df049d5ac8ae974196474b0'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0b328295983d48eebc5f543ba0e05576'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                            value: 'in_progress'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0beafc9f557a4f669563aa95fc5f9448'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requester_poc_email'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0c114135db6b40a5a4af2a03871aad54'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'military_outstanding_volunteer_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0c60617e512c48278210ba86a60bb795'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0c7ea13b8c0446a3bad5622658f26b8c'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'awards_case'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '0cbcc82e50f74791afdb41187d38e315'
                        key: {
                            category: 'x_cog_mah_requester'
                            prefix: 'MAR'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0d4cb0fd72954a8b887e1337113b7741'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0df4fdd88e6b4bde97f8ae8815fe1487'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'SE'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0e78fe6b54ae4f34ac45fd573e039bd0'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '09'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0f318b59fc40402aba546a01869b5f57'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'vietnam_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0f32f5a44f8040b983a8fe631ed4b55a'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'customer_visible'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0f7a13303bb345f395e03bed91732f35'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0f85ee0028534753861fcde4f5f0e984'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_record_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0f90075e09264451afd14909618b6d7b'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1015d25abdcb4d4499ed19598212445d'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_zip'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '104771403721496abfcd899939ecace2'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1055822cd1304b5c8c840b4b40e1b09b'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'import_set'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '105a149691da4306a265fd2fa8821f45'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'appointment_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '107bc3a8c6c445f9a9c4e2d8cc391b29'
                        key: {
                            name: 'x_cog_mah_award_line'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '10ed561a432f49babe67a797e2dd2424'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '10f9e8db42db473ea5fd356c32c5a0a6'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '10fa4c11e83640cf991ee906c48cddfb'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1103e3484cd24f5ab284b0eede3c9180'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'capabilities'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '110b33b968684833b7172e56520c9b02'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '11b165efeb544d3bab0687853510e435'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'suffix'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '12d583545e894cea994e7af53aee4058'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '07'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '12fd6487fd9e47609493d98ad4ff98fa'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'engraver'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '13162315d0344e649a1a4a63b3dbb7d4'
                        key: {
                            name: 'x_cog_mah_request_line'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '13173cb82d8040819293f1ab8ebf80b0'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1323c8c35e5c4d7d832ddb386d4d8465'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'authorized'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '139d32f98766400f880135bc0e0b79f4'
                        key: {
                            category: 'x_cog_mah_migration_exception'
                            prefix: 'MMX'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '13dd53cafede4e7399d35d39803f7252'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'rejection_reason'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1424b4ba461a4e2eb3982a49d1d4811e'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'text'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1440ca15894f4fba970fa36dc620ff15'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '145518ad029a46d0b6a1bd3d2f0a1f9a'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '145a407714b04d728de1f50f8bfd7a90'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '150e99e0229d443d9cb2f30aae24d6ad'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'cancel_reason'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1519f5eb948d40a0a11aafd02149a76c'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'asiatic_pacific_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '152bf083303c45058a1d8962cd77ebda'
                        key: {
                            name: 'x_cog_mah_vendor'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '15676fb6c0024263b636e3acce6f3ff4'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'lost'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '15815ac2ca0a48cc8f7f3cd6ba0fbdaa'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                            value: 'in_progress'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '15ffc4b545e84c52b35fc1fb40e1410a'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1607018e53fe4cb49d5c7cae1cacb647'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'target_table'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1616d688c9be442f99a5a43aa0787a02'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'short_description'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '1623966d921043d2809fddf44ac67c3b'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1632aad772ed451e8ad043ecfdb1ea17'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'weight_oz'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '165a6ee0fb9d4c99a9aff8f8217b5884'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'submitted_by'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '16eec00e8455490f969286856db4151b'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '16f225e986f341c8a34be96d5972fb35'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'user_group'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '17694a08e0824a30aa8b45277e73c566'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'type'
                            value: 'next_of_kin'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1780a5b6a7904d2ea4a07c0a0d06a6c3'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'email'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '17e33b1153394eb38ec0630b2ef91543'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '17ffc824056b415a91077f3dfd25ab88'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '1894242bae6b49318218c4b3a93e1710'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '18dcba0eb6d74d219d2f8d6ade530ba8'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'author'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '192a496ca8ec497698e7c8a3226110d3'
                        key: {
                            logical_table_name: 'x_cog_mah_heraldic_item'
                            col_name_string: 'stock_number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1999b256bd3e43da8046cf345a116ad2'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'heraldry_request'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '19bd62efaa244bd4b46d90676cc0a9d0'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'intake_channel'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '19e2eac6cdd14a8a812d0a1f9bb46ace'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'dedupe_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '1a007583b3eb4d78841070a2ce1dffda'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1a00eabd3d4d43d286600a2b0faf177f'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1aa6fe83eb75486eab10e79a37475995'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'line_number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1aec34d9519046e9aa3ae64cb10b4cdd'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_status'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '1b915daa174d4c7abb05c9c942723a0d'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1b9b09698b6b4489a086d73d57ea17aa'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'qc_hold'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1be901dd788d464094131041287b8893'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'poc'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1c3bef2da5eb4d0e8fbe18465b5b781a'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_agency'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1c76ed28fe1c4792978775d42bdf9e84'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'invalid_reference'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1c7e5649668e46ddbc8fba527dc3fbe3'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_price'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1c9bba1938c84ca18e7bf60092d29e6a'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1cb74bd309cf4c6dab0c6aa9f2185eec'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                            value: 'accepted'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '1cd2d167255c4f829209598ce7e43318'
                        key: {
                            logical_table_name: 'x_cog_mah_award_line'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1cf374dff11241cdad2c2d2fc82ff3e0'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1d39a8b9cf734459a4b088431455b3f6'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'requester'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1d89d4fe1fe741edba56bd7ba4ebaffc'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'completed'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1dc184121b9b42f5bcfd772958dbd817'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'combat_medical_badge'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1e980bd3ce5342b7a0a7286958b7bb04'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                            value: 'military_block'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1f470413aa2245058d221949a58a5464'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1fafa0d59e5846a9b7d819ef8ab6c66a'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                            value: 'inactive'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1fbdba143fe14eaea9548ebc6e290bb2'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'pieces'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '200ac70371b641bf82b87c9a6259bb56'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '05'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2020bbabdfae475fba56a80227638c4b'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '20a7e7288c3a4ce68f1efc4798f2cd1c'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'position_title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2106651b5d134a7aa91cb48327c94291'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'record_count'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2298a8d1a78e4e1c987082033e3c5729'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'request_line'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '23538ad6ee2b4b5aa4a104df99ad173b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '236138e85cb34d6c818bd9daafbf0fa7'
                        key: {
                            logical_table_name: 'x_cog_mah_vendor'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '239fa1ce52414c0ea293d43f18edd738'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'ship_to'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '23bd0124089c49c5947b1f57778f7034'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '23e27146fcd94863a33187bab052f7bd'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'uei'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '241ee4d9929e4b338b5148fb3c41b49f'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'type'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '248a41d24ac5426ea3b8e49bc44bb353'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'approved_at'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '24b61f4bf2774b66b064dfb0d00b8063'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'air_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '24f22a171ef94b96b9e420da6827f442'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'awards_case'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '25625f86a8f844b89e4aea35ee03cde6'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '267a587c742c4ef4a00550045ae91b00'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'source_agency'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2681dd7e169d420189f76ca2f20bd4ee'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'assigned_to'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '26baee17fbe74c9cbc296047482f8032'
                        key: {
                            logical_table_name: 'x_cog_mah_award_line'
                            col_name_string: 'awards_case'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '26fbbaa9d44542e3882b0ccb32862158'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'army_of_occupation_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2755a6dcf393471f93af5c8770f9af8a'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requester_poc'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '279325383e1f48a8b1cc6e995af2aae9'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'awards_case'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '27d6eec881644074b7f9ac2076a45a2e'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_author'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '280290665961424da1186f5a8c4018b1'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '280cd3ab30bc41e69436aa51971d3957'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2816bfeec4ad47aabb7a0ebdb6565496'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'nomenclature'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '282794b9a3b846b3bcc460cb73ed8ced'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '13'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '288d9da83a824ddd88b2739ce5eaffe6'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '28caa4c1d0bb44f79d050e90e95a0e92'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '291879ef783247508ddc804a2fae473a'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'stock_on_hand'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2967b7c8d50b4949a12927eaea7b58e3'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                            value: 'indoor'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2971779c630c4df1a60eed3136c8f101'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '29aa0f96b9bb42959a2964bf4e70389d'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'accepted_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '29b39d49c6bc4b30a0593d317004175b'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'case_count'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '29b76dc5236242c7b7eb77ce31aa384b'
                        key: {
                            name: 'x_cog_mah_shipment'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2a6866a31ced4b5b90be67b32855733d'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2a8c90d64c304e6780147286995d18e9'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2b3401cb9b4441af881f0b1dfee94b19'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'submitted'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '2bb84ea26a814b0890063852b13209b5'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_agency'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2bbb9b6fbf684664b3bb88bb527f6172'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'requester'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2c83af848d064f6dac6e5725a61784d3'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'duplicate_count'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '2d1005d9e38848c1b4ff1b1bfbfc6720'
                        deleted: true
                        key: {
                            category: 'x_cog_mah_probe'
                            prefix: 'PRB'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2d3026b8c4b94463b400320aa319fb03'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'extended_price'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2d3751d5f0b84f44b29695927fdbd497'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'awards_case'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2d49243ff5b04621803a8892568250d9'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2d7cebd7e8534eeba116a185206bd60f'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'RL'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2dbddbd4b1e34f2cb4f051cce12a2df1'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2ddfa3fac9ef493a9df2b6ff590a84ad'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'heraldic_item'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2e0852ffaa9d45bbba7d01936ef35ee4'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'relationship'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2e8ccb791d3d4fe7a642babd947d9b7a'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'notes'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2ed5fa50f3764e9cb0661274df645d6e'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'authorization_file'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '2ee81a3c321c4fc4822c6edf337f6e0c'
                        key: {
                            name: 'x_cog_mah_status_map'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2f00fe69ec7846a98508ee2890016d70'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'organizational_color'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2f0e0500cb274d69bc143c00e443e6d6'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device_count'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2f3960176ca24f25b2296c53327f3672'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'raw_value'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2f5443f828c542aa92cb7a829855564d'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'ten_year_device'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2f572b9afb514ccca72bcaf300be01b6'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2f5fe120c40f4a41849002daf854f9fd'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2f892a265f504bd28365ce1510a90dff'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'parachutist_badge'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2fc46888fc6241c9b9bd24abc838e86b'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '310d72331cfa41348d5381d098732c20'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'award_line'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '3124f99251614ca88bd21c96c7af22f6'
                        key: {
                            logical_table_name: 'x_cog_mah_requester'
                            col_name_string: 'last_name,first_name'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '31852cce21f146af987b0a2ebcfdf105'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                            value: 'internal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '319e4053f97d4323a6342231bb375dcc'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '31f69d104a2544c798d8e29f7b0ee663'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3216ccf840704fee913b56440632bf9d'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '327772f129c844a1b40b01041a84c8d2'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '33089b5ee6be485fa552c977b79544e0'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '33e20ea63a95491fb5995162489f3fed'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '33e581fd81f24ee1acef9899059a42e4'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'in_progress'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '340da254b80e42188d45f2e178254fb0'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '341480e47f904271a1833977efe4afb8'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '348690d64eb947d4bc7bd8d41a4eacc3'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'line_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '349cc2ecfba040c0b24ff504983209c3'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '361450fe7a784072ab6805b39ecac0bf'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'line_number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '367d290f2d304340a96c72d271eee32c'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'ses_flag_request'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '36a233b013f44c52aa595feb4498edf6'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'EA'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '372eff209b124de39b8cf658b7bf2674'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '373dacbf707f4ff5bf8ed954a1d30b18'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'southwest_asia_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '3769130658484c5081cf8c8860d6deac'
                        key: {
                            category: 'x_cog_mah_heraldry_request'
                            prefix: 'HRQ'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3778fe1729ee4565ab2e723f77fc2bf1'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'ship_to'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '3785fdd4a4254a54aa5d2477a867915b'
                        key: {
                            category: 'x_cog_mah_shipment'
                            prefix: 'MSH'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '37eefe545f52405cb2f70c59b7d43d0c'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '3804627cc0224aaba38f80e2c5e95611'
                        key: {
                            logical_table_name: 'x_cog_mah_engraving_job'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3829ce6458934445a0cc2c1e9ef8fa2d'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                            value: 'triaged'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '385153386ff84ba2bef4dec339f8a5e2'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'cancel_reason'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '387cf942781145e5b785fecca9172deb'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_hash'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '3891033abe274929b766d532dcec5c49'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '38cb4335d5d24674a9bdae6b8f9f221d'
                        key: {
                            logical_table_name: 'x_cog_mah_awards_case'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '38e96d970c5249ae9ba49079fb3cc671'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '39a5ab8d589e4dcd8e09d8da413a2116'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'nomenclature'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '39e693fe80ac4ac78a641af3cecff848'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'quantity'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '39f2e5749cd34c99a849433554a1fbcc'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'type'
                            value: 'unit'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3a00f16117b84147977c5db90c55fd7e'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3a68ae4bb0904c57828dcab84dd666c3'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'silver_service_star'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3ac6978eb50d486989da8f360da478f4'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'authorization_file'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3b85b5ec370142e8a8397e19171705a8'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'suffix'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3b9040b4a54d4d47a0ed7a106a1757b0'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'received'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3bcae522894f4be1993910af2955712f'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3bd4fa3d892844f7832a5b67e0ef03e3'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'streamer'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3bf07785a9d747f4a082d385408e2815'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'field_name'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3c4832e0612543499d6df0c337f74fcd'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                            value: 'ups'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3d2ca73c40ec4a0c8007f2948bf85ae5'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3d3cb3be98d14bed9adc53a05d3cfe2e'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3db96a7d7f544a9188b4e4951bf26c52'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_agency'
                            value: 'nprc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3e0a02286cca44eab719dd54eb084cc2'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'silver_star'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3e55c78e15434cc9aa2ae994f37e0978'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'engraving'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3e8a7c472b224be8b5e0bd7b1bb836cf'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3e969f88b1c140a28f4265e2059e7ea5'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'city'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '404716be511b47d1895634d65d1d4219'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'shipped'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '40733954ec0b4120bffde414e4e68503'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'total_extended_price'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '40b27569cc0948eaac1252756611ad56'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'requester'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '40e12724b44f4e04b5ffb91c0a5c0359'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'total_quantity'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '40f264b777684dbc9dcccb3bfdb9ae70'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '412d27f63ec843c98efcd1cf4a212ae8'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '417024605fe0437586edcaf0dba3a398'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'days_in_stage'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4186523583aa4abb892d45e7619be473'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '41c238d97e5847aebd210f7f06b6ac08'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_agency'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '423b84d084ea4a23a953991a061c3881'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'phone'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4262ab57ac7a477492e5270cedc8a14b'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'guidon'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '430178be87b9477b9432a6ed95e65496'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'engraving_text'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '430b47106fbe4b2882acce8fa15b2592'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'delivered'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '431f9cd8a9f54a12a6fa53f8c6ebd934'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '435f6540a1114cd899103bfdee88f796'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'import_set'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '438aa968adf54b97844966baee375c0b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '43ddd8bf0d2f4fa0be0fbb1beda336c6'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4410b457f30144dca95b8b8360200909'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_notes'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '44747b0dd53f4c3fb139a61356f10255'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'none'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '44f1d82bcaf7438fb26742b4c0360396'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                            value: 'resolved'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4525a3f56ff64d28a9c3efb859bc9610'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '45312a25288049c59d6fdef175ef03bf'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'PR'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '458f4e06c71041959d6c828fdb65871c'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '46169d9cb3ea4df7a92f58e3d945a0c8'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'ses_flag_request'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '463ea9d694cf4010b90ae691f8157d10'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'aging_flag'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '46699a4a95894ba5bb69ef3f330029aa'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '467dded36eee4016a6039417d0c2c547'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'awards_case'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '468ab9b447af49ed900aa2400d78f00c'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'pending'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '46ae32c8f04943b6b5d9cd4e184e13eb'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'email'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '46aeedf568ba4f51af7ad30adb57340d'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_agency'
                            value: 'hrc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4760e10ab6ee42f5938230b566855a39'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '476b9ac32c18483eb0a63d49113e2df7'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'state'
                            value: 'active'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '477ca51096a9406394e365068435a43b'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'description'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '486b2da48a8c4c47b8e1d43999dc2f42'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '486ba17531114b6783e80e916a323560'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '48c585ab47144c1eb1896183652a0ec7'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '49038a2964314392b9749ea305ca9d49'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'resolved_at'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '493c472c627c4c33a5db55a3775b6c65'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'authorization_date'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '493d33ea528441178d35b51ef2cf3366'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4a3302fcd3e542a6830b9992cf0bb3c2'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4a9fe12eaf4548a6a7fd0983f40faef7'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'uei'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4aad117051cf405199da73bd7e45bd9b'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                            value: 'usps'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4aee5e06cf5748c79d521ddf1c0b9bf5'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'approved_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '4af00c6fd2e44751a2d242f47345b395'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4b2255d0e0324acf9fb4f38db52ad714'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'body'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4b2f53fbd87e4d4e9a11a2305a61d977'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4b8e737fc36c41a3a5900b1729045fee'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'line_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4be2513a62e6421189bbfc869bc9f6db'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'type'
                            value: 'veteran'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4c39b951ebb24b06b8b058b66ee8e360'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'quantity'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4c6e08c25426404cbb98b0c7f864a562'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4cc5c1ea262444b7a8e244bffcb2498c'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4cd5780924914e6d91376bc1dd0539f4'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'fund_code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4e840d432dbb4ceeade419a108c679c4'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4ea390db8a6a4e7f80fff1a44daa4ec6'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'preferred_vendor'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4f203513e7c54a22ac87cb44a949ae24'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requester_poc_phone'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4fd39fa4ac0e45738252311f330acec2'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'duplicate_requester'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '4ffc82bdec9b4559aa2056554ccbebeb'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '501c2d8370614787955a14e53dbca8fb'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'priority_handling'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5051f4e2ece340d8983fcbc7c9b6e82a'
                        key: {
                            logical_table_name: 'x_cog_mah_status_map'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5058831d78df44e48c773a75351c07b7'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_address_1'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '50a35b84360644bca0f4036f22ad3253'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'author'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '50b0a9b2902042bf8a382c4f3a42569b'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'days_in_stage'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '50b6cdc6b8324d78b8ffe9ea9c0ebbf1'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'army_achievement_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '50e00142ebee49be955fbfaaf3832227'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'total_quantity'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '50f4afc00871413da35bafff930fccc2'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'expert_infantryman_badge'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '50fdf8625fff4e74ab118ac6d07704fa'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '51113d8a7f7a478ba1fa904e89398cb4'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '513a5f1c0bb44bc2a1b049b18a4c4279'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage_entered_at'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '514d5e8af0a54b3299a4ef9b3f89bedc'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'service_number_last4'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '51704f2bb83b4dfaa4cfcfa15cd45cfe'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'work_notes'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '519a1c9d4f1b4a6f81eb5154cba11d0b'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '51ab4159a890490daeb526c732e3ab49'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '528eb2c5646d4361a7ec163d5dd5a288'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '52b4370b58194722a8bd5888300c6bee'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5300a06290c84ddc888ad5b42910a562'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'positional_color'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '533f1035f98b44d6951b39b36b07a16f'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'delivered_at'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5345922648a241a6924d3107c7b3865b'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'submitted_at'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '53ed4fd569d54b8aa715e8765431ca8e'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '54a5bf2f59c34a6692047176abb46948'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '54dcdf7c919c43c0b1d53bee07b82502'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '54e7a72dba7348dca68dba21b551366e'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'awards_case'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '54f639e383894d008161a7011ae5e48d'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'raw_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '555267d3b0424224b6bf994ab2244ca6'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '557eec78319f499bac55227cbb0977d4'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'middle_initial'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '55ac470ebc3f48b7a3cc48e35853fb2a'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '55b9d5d631d54aafbd0144214a21ffc8'
                        key: {
                            category: 'x_cog_mah_status_map'
                            prefix: 'MSM'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '55fed62e14b24541a3f2c1ebbd058840'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '56f8c234a38a468abe2fceb99dd0130d'
                        key: {
                            logical_table_name: 'x_cog_mah_migration_exception'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5745148aa6d14a5a84ca28b8a52a1b18'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'received'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5760478f575041b5a872d43e8ff48078'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'national_defense_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '579b92f86d91442b8694d8cfd4f509ec'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '579df5c5d4194314bd2c83aa2d1c4f92'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '57a50172404f4221bf007e915cc0eccf'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'body'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '57eb278583434968b84d455083b001a9'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '586a4607d7184f868fc2c11da4fe05eb'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5881d499fa0c4079a0f251001ee95b26'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                            value: 'migrated'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '58de831932e54e22ad7a8d5e230295f0'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '591554c2964745dd99afb08bac6e937a'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'submitted'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '595d48d1bd174baf90effc8ee434a74b'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_agency'
                            value: 'hrc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '595e7ee2b0a148cfb165fa850f75fb9e'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'authorization_file'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '598c6ba03a7d430b9cfe7b491344fa9c'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'poc_email'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5a114f11739340b8b21eb1ffd8c6f7dd'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5a5a9e4880f349469e49ae1edeeca6bd'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'clasp'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5a624fb644bb48e6a92f3233ea3cc3f7'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_record_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5a66e2a21f814daf83495bfe62833a11'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5aa28d3797ed4734a883709a7fdd557a'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5adfbb5de5a84aa58227baa7436457f2'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5b1dc862731149eb820cd491fd452ae6'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'engraving_text'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5b4b4a4f0520492d80a3563e27de5ecc'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5b6928058715454682d4d445126fdf8e'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '5c67c0304ab84ef4b0399b71570a124d'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5cac2eee19264e519f8b2644a761a24a'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5ce38e3ce5c64ace92db09ec5195b741'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5d39d148210f479d8907bb96ff7164f6'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5d42a1edc116437facde774a910c5877'
                        key: {
                            logical_table_name: 'x_cog_mah_heraldic_item'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5db79916f85748178422702a5210ce38'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                            value: 'stage'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5dfb896fb10c4203844ce74df854b628'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5e8fc834a9a64d1899aa306fedf00f9c'
                        key: {
                            logical_table_name: 'x_cog_mah_ses_flag_request'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5ee3f065e8bf44e59a5c3e1e738f1af1'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5eea882f82c74120b50d02d16bf5a013'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5ef872242ee04ed4a9a92bbcf87b6f3b'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'line_count'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5f19503b2444466fb5dcea9beb82e5f2'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5f1cab712b1740faa8133a9c1b55b767'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5f57b5553dd746ef93ba52e50e7d3432'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'silver_oak_leaf_cluster'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5fd5447e0a3749229a3293c3c10977b7'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'kosovo_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5ff8e4c3cc80468097d2be6f22ae8055'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'resolution'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '603f5cee75af4b1eb90503b57daffcc6'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'address_1'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6047ac529b99420090c299af8d0d7063'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6109fccb5e604ed18b5ab94ca63b62a7'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'seeded'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6172c290f9e941a0a90e6eed3c6f6b5f'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'owner'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '61a8233628ce499dbd9e364e7e99b5a7'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6269d3d0e1124373a822461115f1c7fc'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '62bea3181ac64304a6c0037e55b77ffd'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '62d854db26fe48e1a4bcb9fa5ff58d6b'
                        key: {
                            logical_table_name: 'x_cog_mah_case_note'
                            col_name_string: 'awards_case'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '62f06b869ce8479db6c020acff856712'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'PG'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '63219b4d1dc24353af5eea069a1ff2b6'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'priority_handling'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6372e20361994e409b2a3b3cdaecd1af'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'shipment'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '6405980744fd43c396dc47635896bf48'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6418ea20e93c44be97bafe4d3b530600'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'tracking_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6424af38588041dcb9ce5901c8cdf4a2'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'address_state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '645990eb6e9c4f20a4977118d7ba3544'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '648b500eaf9b435f9b0e5688ea0326c5'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '64ae0a41c8d04e299329cc5cd95b93ea'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'nomenclature'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '64d2e386234d4d598bb5ae4d92a9d1e8'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'state'
                            value: 'active'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '64d4130ea8dc42f593ad9a5d9c933b7b'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'presidential_unit_citation'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '64f38698980b43b2b041c02c60ef7227'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'army_service_ribbon'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '653a7e251b124a38a377b0638a932b3b'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'assignment_group'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '65d6ed9a22f24dc38c4b492f07fd7829'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'zip'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6639b09b75bc41cfb5085bbf085e6ac5'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'engraving_job'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6645fe60b39a4675bc4ea58183189ccd'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'shipped_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6686e771b0724997b90176a458f094b1'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '66d52b55b49d497c9258aa4641850e1c'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '66f9043c02324f83bd2cb50cbefeddd8'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'country'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '678dc6ac502640d29f9271801e1665e2'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                            value: 'pending'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '67f6f6255e894840b06e9f3bc3c31ef7'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '68470dc428964953bcf15d54f2aad0b4'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '685596de3abe4e3abc0646e57b678c7b'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6863e9e9322b42ebae43a07d49d0973f'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'korean_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '68cf2f4839c74b6e9255949bc42fb2ee'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'shipped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '68f19c454034412d91f9c7637f65f656'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'owner'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '6948cc659bc24c1882cf4b6a6ad5a12a'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '697daa48a0a34e8ebdeee67d1be0dea3'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'engraving_job'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6a016983fd964000ac8f0640bc6ce1d6'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'm_device'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6a211d72e6f84859bc509ed39a8b72e3'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'distinguishing_flag'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6af9253811d1430f98bf4fcd5488b1a0'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'korea_defense_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6b1e4c15657e48658a1f3ec212304d09'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6b2e2bbae2ea41b3bb1a96f82d769bea'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6b565c2b811d407fb2e549f502f172d6'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6baa5d07e34d4fd79c5eea06858d182d'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6baeb940f85f445eb52865473a7ef2f6'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6bb27b6997ae41b5b64bf275b247ccc4'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'required_delivery_date'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6bdc7a666bef4689b6def4992f1e36b9'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_city'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6c3781e7d78642ce9f09a4e8673cd761'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'resolved_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6c5e6cc331ef4274b5bc531672c883d1'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6d5f0ab4d9cc4ed88474c5137e7b47d0'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6e1221f318614f1aafc2cd54a8127ad3'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6e4c346b83b948b6ae99351080114009'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'submitted_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6e6040690c7249d6bd19ea9e476fe241'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'nsn_or_exception'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6e7914c5ac9f433d81eddee0d67d7c86'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6e996ec2dffb46c999adb2c9da1aac7f'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'shipped'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6eba194070bf4d5b867fac86d3c69485'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6ed9f2e66c054ae18c66142604de4178'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'shipped_by'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '6f15ee8689374f7694d5fb05c0f84327'
                        key: {
                            name: 'x_cog_mah_award_line'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '6f2d3febf7d8458d9ce5080813ab677d'
                        key: {
                            logical_table_name: 'x_cog_mah_authorization_file'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6f73fa9760be4919bea8f00e951906af'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6faf667d741b4a5c9a799e7aa7f1d486'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'EA'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6fcfc24c24a548af92b2dce5374d91e1'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '706658bcc7c847bbbe4c16b529bfa56d'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '706d00ae0f074977ae5411bdff80d2b5'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'middle_initial'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '70d6a6199b1944618d03ab156a82c7d6'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'ship_to'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '70e001af28fe47768be4bcdf2640e113'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'engraving_required'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7181dad286ba4c128fd26a3a44f812a1'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '719eabcb816f41bdab6e35c595bd1a88'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'soldiers_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '71b7466e42084172bb6d99acfabd8720'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'dodaac'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '71d509f9baf34f668673ca39f39d57b3'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'nsn_or_exception'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '71fd2d4ed3ab48e390c95534e61da420'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'received'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '71ff32ba3c0b4f0dbd16781fc6089b09'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7206e68650554fbc94fa4b2e31180dc8'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                            value: 'dhl'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7219e0a569f34582bf77a198da822f76'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'PR'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '725c3f03dfd84a168d8f59f3e0dd690f'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '729a291a1fea4634b0e4565693429c20'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '7308c51317b048d9b7d7d51b38f31a23'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '73339ccfc0ed4066a7a3186423d59235'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'shipped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '734b90b55d334e07819cc580fc8202d0'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'queued'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '736255d2ffe04d948c6d4bf5339931c9'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'phone'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '736b8fbe03b440cfb6ee815f9d6723c4'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '73958feb57984026901ebba4d41b108b'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'target_sys_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '73a9d8c2e81a40edbd405775ab47b7d8'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                            value: 'boat'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '73b6bfbabd7b420da08ee69c6552b8a7'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'awards_case'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '73cba3ab7d204a74bab9497e40792525'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '745bd849107f4f67a932755f5936f6d0'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'in_transit'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '749cbcc78d7440beb63891025d208e25'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '74ec6ed78e994b0f919ca6b350a171bf'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_country'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '753dfdcea6684cba93efdee79f14dbab'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7554fa13ae3247c6b5a6a650e301e28b'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7562e92d07824542909468b35a09eb84'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'merged_into'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '766a76da126e477aa3d56db142ff99ad'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '767b4f666fa646b98a5dad39847bef25'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '769172121a1a4bc5bd4b6731233d3aa6'
                        key: {
                            logical_table_name: 'x_cog_mah_requester'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '76cd5c24d26e44a29a4d29544ae22aba'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'signal_code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '76e68d30e9a94d5e8db829f9803e6faf'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'customer_visible'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7734d59044e34c1dbf3918c8fa793699'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                            value: 'script'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '77f0dd8dfa0841fa95822c4e18639d21'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                            value: 'active'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '77f4fc0e355049a1abb42e2ba616d030'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '780d03221fc049d782554261f0f38fae'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'phone'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '78be3eb3f9e74c92a229c396c24002a0'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '794c23897a4a45ea86e45ddfc9326eac'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'overseas_service_ribbon'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '79983f08ec7d44979288e5bee8a8c582'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '79ce0fdf304449249bf04e1f5774498f'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '79f588a737714c0c909ec679660f2c5e'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'awards_case'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '7a67456466554843a02b1910a457eb2f'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7a789984647b4880acff8a5da36265a4'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'global_war_on_terrorism_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7a97688333f34a0aa58f6fd63549dacc'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '7aaf639e895648259e93357f7bcc2b90'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_agency'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7abb541fda28482aa6443e1b19ff13d3'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'in_review'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7b11b9c0394246bc9f7b269f4ab4aa67'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7b642fdcbac24d5ab72a603335a01128'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '7b8707b1825b4337b0f63ac30b708e6e'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7bf917b68f4a4647a99fb938e2405bfe'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'in_production'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7ca24113d74f4d2a98d4ccbee8b3171d'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7cf271e02d5e4115a61dc5e7fc535a0b'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'heraldic_item'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7cf8793c47e447d89634653642d75d38'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '04'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '7d84e9dedf2a470d98bb1276d9502b92'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7ddc0ecd68f543168ed6640ebe6daf57'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7dffeb72a80546c9b28988ee2afda50a'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7e87ddb46b304e57bec8f341eecb4dd3'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'pieces'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7f2eb6ef55bb4a479e45f0a8f5b1723c'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7f352c2690514a0ea542a0df47c02376'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            value: 'failed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7f376cd8d2be4cb7beb9c58ce74e5a58'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7f3b81444296499aa51069bf66aa4cf1'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requester_poc_phone'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '7f3cddcd6dca432e9fdfed3e9776d895'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7f510766c3794ec48bcbf32582332b1c'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8066c8eae15843b3acee81bc7a9f7565'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'source_agency'
                            value: 'other'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8144f9cc1be9493aa4c84303a8072793'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'engraver'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '81a2b8bba257462f884dc133950c9619'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '81b01dd198874dc88bbecb1fc07e385e'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'vendor_quantity_shipped'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '81bc340003014c1594f19fd914d25616'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'ship_to'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '822a505a64d349acbb42cd8f3cfd6ad9'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'duplicate_count'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '825c04439d3c4ad096800d8b1eba12c9'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'work_notes'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '82e61c72e6a94e7e9a672c07a259678b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'cage_code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '83716935a1884b2093de56067760652c'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '84547d6e38894ca68fab19572e865cae'
                        key: {
                            logical_table_name: 'x_cog_mah_authorization_file'
                            col_name_string: 'source_hash'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '848c0d01614941d3a1472a8aaa28192c'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '849a46563dba40cba23d5746ebb9f8c2'
                        key: {
                            logical_table_name: 'x_cog_mah_vendor'
                            col_name_string: 'cage_code'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '84db67b8948d4f819a3452a637ee2e2f'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '84ef0992ac6d46d582e5935e4c8ffe15'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'format'
                            value: 'delimited'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8512534c78c646049c377296edab3395'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '856129674e41429b9a108ac5401ce66f'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '857a46a9a4734dc5bc81f368fded94f6'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '85a37a0ef15c4a989e120edc3f4af10d'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '85d3c32b9ee24bf588fb5a7f7c8fbe2f'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'aging_flag'
                            value: 'green'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '85d4f6e08ff0422cad0e641b51feda5c'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '861692b8362e4a358efbade964f9ec5b'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'started'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '86a70da2b88245cf9f1fdd46da103ac9'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '06'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '86a71b487b4e40d3b45f42d51ac6b416'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '86ad9e5db5c548d5b6fc930bdaa371de'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'poc'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '86b19a95a1e44be29a8fdcb4a4cea256'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '86cfa0309a114578b019561358a93bfa'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '879ed13fcc914f7eac274479768e6de9'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '889b11ae8b2d4306846fbe781c0b60b3'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '889f1d72099b4c7488a5b06eb16dff06'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'aging_flag'
                            value: 'red'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '88bff5d1a5714e38ab49319b940eb1bf'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'state'
                            value: 'inactive'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '88ccd8043b7940ecbcfc44453aacf7e5'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_acknowledged'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '88d11b0a88774b1fb542c49311652c57'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '896314858b4a4210bb8d8d64488fc2ed'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'required_delivery_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '899f6360e854469eb67ab2a91addeffc'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'uic'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '89f2e27b8f6642a680a9ad6f2398b8dd'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8a818a620f9149b693c99e02b0bef7bf'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '14'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '8a90e923bf0c43cb9edcb338fb4e70ba'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8ac478f3bee84d11aedbc44873ff3f99'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'dob'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8acf35531d1f42dfa72799475ae95797'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8ae90061f03d4baab3efea3e01e9b607'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'submitted_by'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8aeef6f84a534bf185447dfd667e3df1'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'resolution'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8af42625794b4091baf782a992a357d9'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8b496f254e6f4fcca4f244faa1f25a08'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'purple_heart'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8b85ec7f9b4f42ea9c29e13873c01999'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'request_line'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8ba18c12c931449d9acda16c362c6345'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '8bdf94487080461dbe91243f627611ce'
                        key: {
                            category: 'x_cog_mah_awards_case'
                            prefix: 'MAH'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8be8b267bceb4862afdea8777c1ad630'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '8bff913953854f80b74fc8dc28bd1ee1'
                        key: {
                            logical_table_name: 'x_cog_mah_request_line'
                            col_name_string: 'heraldry_request'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '8c0b14312a304662a51a83af8390773d'
                        key: {
                            logical_table_name: 'x_cog_mah_migration_exception'
                            col_name_string: 'exception_type,state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8c5f7e1a857b41a1b627bf0a886c1363'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'email'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8caa28ba82c4454799ea90372ca5c340'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8d16e35f882f461b9a4198ff201fa587'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'aging_flag'
                            value: 'amber'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8d6bef3a8a6c402bb345bde3d6fa491a'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'RL'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8dbc4f8d01b44eb1971e6c97d8c48821'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8dc78419d86940b3a955bddc07aae556'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8e0d454f9e234425ad70e55d676f89c6'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8e581286ead0491f824daf18e7226a84'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_hash'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8e6ac95371e343c7b291a97f4ea07823'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8e8171b891bf41e1befeb7490cdae125'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '8f470b00266042ba8fa23550c943236e'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8f61ceab77a440778314d59b0dd8db0a'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '8fa9626144294abd9728704a61727822'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'iraq_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8fb82bb9f9a74db5b7c548c9521979a0'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_price'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8ff701715a8b431d91cd7f24d7ef735b'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'document_number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8ffc6856e53c4238b15421392bf110bf'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'dob'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '905ed9de364b4fbebc5789aa93674733'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '90efd6ab2f7f4ccbade23740d1f72b0d'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'distinguished_flying_cross'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '9126e200ac2f42c1a604f39f9836669c'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '91792d7bc25c46b3b2a9a9e54afe5c9b'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'batch_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '91832942e4644a47a49952d07e263da2'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'priority_handling'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9185245c4f42413dab857d16a98d9489'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'nomenclature'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '91c2b2c557a340c8b73fd269abe35911'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'meritorious_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '924723c48e6347ad993e7d247ca153e3'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'stock_number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '926afda97933474b88bc63b8bf7f6a77'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                            value: 'automobile'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '938ce71b02034f1dadf4baf56d4c5c37'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'authorization_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9444b56e25f6447288582149968893e5'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'poc_phone'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '949417d73f56491b91564ed525a2f238'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'delivered'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '94c62b4433fb4384b6464290ec1cd6b5'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                            value: 'roman_block'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '94d1e804b0144b999f577df0c4a36014'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '94e6262ede5645c5a665b532b597d618'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '94ee9264653b4f72bafd1f91084c5401'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'position_title'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '94f2bfaff9b24ccbb9f7fffcfd3bd3b8'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_agency'
                            value: 'other'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9540e30dcb9640c2bdd79a12a71b5539'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9551e89cf07b424891b53518b3b28946'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '95780abeef2e468b909fc42bde737114'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'prisoner_of_war_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '958237559f224ab3a042fc68834c7c78'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '95829711e48a4c659fb1ba6ecc6fa798'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '95c8acb567f2457ebb1b51cac89e8eee'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '960278877e7a4544bd40817f1ec99a64'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '967dfc115ddc4b3ab33ee3d47a6c42d0'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '96c1c8feff14481dae8169913dcf7185'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '96f149dc0bf24e88bf1fd57a369b1a03'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'invalid_date'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '970ac24098394541b6d41ac7485b6079'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '971d1e670ce54e2389d0b0b9a520598c'
                        key: {
                            logical_table_name: 'x_cog_mah_shipment'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9720fb28d88b40759ae688a6332eb81f'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9750876404394113a4963b58ff6db8da'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'lead_time_days'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '97513f25da94416b93d6418a8b6b50e6'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'reviewer'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '97f23a85bd2f4a7694b478a1235bc87a'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'completed'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '97f68717e56149de8e36c2a144c99434'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'army_good_conduct_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9853226f99ed40db937074c26e06093c'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '98621356645348f898cf0d5c9fa6b2e3'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '98b7febc8eb345e9927ef9b993ab483c'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'source_table'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '98fcdce2b78442b78040ad8474bde8c0'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'record_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '99abbb5bd13d44b3a6c27b014112035d'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'project_code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9a2039e8abd24b99aaceed98470379bf'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'delivered_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9b23709670fe45cb90a8272d5a25fe0d'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'qc_notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9b80e7c818d14614acf61ed966007d75'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9cac3cde049e434797167d4b6c9e1fb1'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'army_reserve_components_achievement_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9cf7437a7f6848b68de55ec9e76ccba3'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9d4662b90a0b4740a029863ab5c701e6'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'warehouse'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9da739f552dc4d46b36735afba8051fe'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'heraldry_request'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9dfeee9335e042ffa0aea999f1590179'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'approved_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9e1229462cf34fb081e37ecb64d2468f'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'vendor'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9e2007bc6a874c2287a2408a2ddc3e43'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '9e93ee05c64749f7b93e40565cc5f93e'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9ea74ee0197445d09c7930a7d6fc7fe1'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '9ef08b6537324dc69439911529661a3e'
                        key: {
                            logical_table_name: 'x_cog_mah_ses_flag_request'
                            col_name_string: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9f0680d0cb094460a434cd305278a4c2'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'quantity'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9f1d5dcbacf043f9b67f7a5c0efc815e'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9f626e21fbf24340a143bc6bb28469c3'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9f956dce66b54a7a913c17ed4082e709'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '9fa4b9b06a354719b616945f2bf3e85b'
                        key: {
                            logical_table_name: 'x_cog_mah_heraldry_request'
                            col_name_string: 'document_number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9fc99a414d6f468fb65db46f0df0e4f0'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'tracking_number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9fd24331852e43b7b3f78816d4fc92ae'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9fd59d50d3324764a0e1785b5aea1456'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'format'
                            value: 'dxl'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '9fd857f999094a739d6ab09cfe5a26d3'
                        key: {
                            logical_table_name: 'x_cog_mah_engraving_job'
                            col_name_string: 'status,engraver'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9fdf8a930aef4ea39741320e516dc921'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9fe66ad8ea7041238609b8a9cbe80f6f'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9feab0de72ea49b78cac118f2d297725'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'awards_case'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a023bf9ce9804a5eafd4c45985be44dc'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'global_war_on_terrorism_expeditionary_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a02a5d936a224108aa4d0ebd37cfbc29'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'text'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a0357cc67c5e4c1fbb1745651c125772'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                            value: 'outdoor'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a06d2e6fffd849dd87895f76f69d1ebe'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'released_to_vendor'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a0be17d3832642bb81fd20b1b1f8df9b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'address'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a14d6b0971ac43628a46b4018ca7f365'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'accessory'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'a19afd91453e4e83b7dad85ac124a74b'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a19cb898fe3549b8a69470877ff72f2f'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'v_device'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'a1a38aa4fb4d42eabce895716bc2e30e'
                        key: {
                            name: 'x_cog_mah_awards_case'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a1d41f8d110a4f32ad055b478dc681e1'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'american_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a1ef42edaa2246d7afe37ba694a223ea'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'exception_item'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a2026615162c4617ab6ef1fc5527476f'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a2b4b5b838144b5c841f13d283d4e766'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'noted_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a2b9a56233cd4860abcf5775981a8a11'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a30e70bcc293483b8fe37cae3e9487c9'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a31a9a9f8bc3404d9733c4a5ef77363f'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'released_to_vendor'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a348dfbf0dd94ac89f6e6a2e5399651a'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'executive_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a37769df96464fe581064b519a842d1f'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'awards_case'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a3796b4ad469409aa3e887349c59653b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'phone'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a39a56a895934f5394ac60dea5dd8c18'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'poc_phone'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a3be31fbea31404b95c79ffe6b672e33'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a3c0dc190fef4c01a426db36761abeff'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'BX'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a3cb4b367ff749f2a541d7619b51770b'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a3d1ce98b70043d9b04ce4ba3531fecf'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_author'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a3dc4ac947f34d66b62e7c42ef16f610'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a4709487b8694d2abff1bb741b128f01'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a4ac4c8137d645a69cfbcc157dd63a71'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            value: 'partial'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a4c470f7e47c4f21903c07482617fe61'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a4e9cc71687e450d86b24f97e422f04b'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a512607ab65d49fd98aa62b105015108'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a5632dcad4dc4a7691137c32a26b50be'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a57b2d67f0c948cca2ca6431ea190191'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'seeded'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a5d4f95f834841b195af004869e0ddda'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'justification'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a5d874cca8674263a85d5fa2b1808109'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'message'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a5f63697fc0b4a1480f83d6e899ecff6'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a601658d8c714dca9917be25ebd769bf'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a6a924079a6f40d9bb42733ed0ed9246'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'bronze_oak_leaf_cluster'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a6b5c4e0805640febae7b3ef12943012'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'parent'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'a6bbe0d33d3c4847987765dc5260b4e2'
                        key: {
                            logical_table_name: 'x_cog_mah_heraldry_request'
                            col_name_string: 'vendor,state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a6c762aef2634dcd97eef466d54dd0de'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'a702e9b05df84a908302feedd9b358a4'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a7b0deee87de4e5eb395e43926cc4bd0'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'hourglass'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a7c5ef33795049fc98a69b2173e7b6dd'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a81268862e164391bb1511787807895c'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'last_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a83659dea3c94f6ab3d1383984a9cc92'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a905cebe31934cfc9f40b1b9c444bcaa'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'last_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a91ca63c3cd646ba98c84563f0c73510'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'a92c5e70c8d94207a86f56dd31dde368'
                        key: {
                            name: 'x_cog_mah_awards_case'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a939901956404f12b6dc8d00f7fdaeca'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                            value: 'gothic'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a9a2ba19b0e6400794022e2503e6f6fb'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'rejection_reason'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a9fb0b0d94ad4061827eca4062c0f3d6'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'address_1'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'aa8993d21f5d4342af61b042ed491d36'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'draft'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'aaa5768b642c4c2799c2f85555d0cce6'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'aab53e32b5e64724b09149a177f0dd9e'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'award_line'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ab3b28f7e9a3441d96a34cbc5d628db4'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ab56e3c9e69a4ad68452d2fd0fd80199'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'contract_number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ab939e502baa4cf7b27ee35c26c55471'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_agency'
                            value: 'other'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'ac19de910cf74fa9876050951548175d'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'ac4b5ae3427e4e2f829e25d1d9ac3369'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ac52b367c0b84da7843c79703761a2b5'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'ac72ce8441464595bcdd3bc21e0417b6'
                        key: {
                            category: 'x_cog_mah_request_line'
                            prefix: 'HRL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'acc60577d6834b33a9c66634ab5dead7'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'aging_flag'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'acd533ffa0ff45a4abd2185b5da5c5e3'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'requesting_office'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ad277e24a1204ad9aa976d2e55c46283'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'rework_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ad2992ef6a864f98ab580a785851f1dd'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ad41dea9a88841548eeba4c5928bf602'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ad4ea96194854e72869a705fe485b755'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'european_african_middle_eastern_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ad6b575611394ab4b30fcbbae40ce2e1'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'source_agency'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'adc6b41847da425388c837dc2ef224a5'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ae097cc124b34edf9d650be6c605859b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ae98441d07724424ac092a6f2c32cf74'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ae99b492121a4350a0d14b9dbe863bb4'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'numeral'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'aeb56f409a214ddabab398336977b226'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                            value: 'pending'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'af08f79544554727a837427687184a29'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'format'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'af34fbba95c648ec9658b0fa223a8b3f'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'insignia'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'af448665197e4d0392a78a39646e5428'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'meritorious_unit_commendation'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'af54bb02340e4eb4ad29e0b5b2fdb0dc'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'af5a374adbae4f70849877fbf9fe5dbb'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'af7de8a6f13142d4b9c49563758d435c'
                        key: {
                            logical_table_name: 'x_cog_mah_request_line'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'af883acad402405189bf9dd0fe0ce688'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                            value: 'status'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'affc5011b9334f609e48ecb949d2ad01'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'closed_at'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b02a87f2b2124172b05b66367d055ce5'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'unmapped_status'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b051d1185f9f4f0790c844d3f7baed06'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'work_notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b05b5d62e5c04814af677024e6f363b3'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b08325eecd5b4121b6110d584129ca9a'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'parent_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b0a609f1fe9b41d69c2bd5aebb77834b'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'shipment'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b0c3e2d1467643c299a8e5aedbd0e634'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'user_group'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b0d9a196e88742abba77d3c2a303c34a'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'unit_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b0dd36a56bdb4fd19b5600c181d879a4'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'quantity'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b0df444a662e4941bcd0bff34bc3d42c'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'heraldic_item'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b1da2396f81d451a81b119619933218f'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'parent_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b2a09d92789a4050ad38b4e553818d3f'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            value: 'parsed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'b2f3f5d727e545be8776d65a5c5627c5'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b34cddde0ea943dd930b1004df9bdeb1'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b35243315e01440e95bb4905c937ad58'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'dodaac'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b35ac4e4fe9f4463bf0435ea781903d7'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b376150b11f24bf3a37c2a51514481a3'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b417ee70c06c4cc595aa266532d4832e'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b41c5fa6a1cf4ae0b6926760e33a57aa'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'afghanistan_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b41dc79d1a6b4fe1861d837ba467a43d'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_ship_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b4a9d111c91a43928b4e1bcefe917664'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b4b2d6f962e64d1d938883bac5d7ca73'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'rework_count'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b57b655fbdf843669908b98e218f952d'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'b5817a2e0e004859b15cd9b27d6a4617'
                        key: {
                            category: 'x_cog_mah_engraving_job'
                            prefix: 'MEJ'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b5964a4b26644b1bbe1c38c77e919578'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'weight_oz'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'b59858200487408a9bbbdcd836446b3b'
                        key: {
                            category: 'x_cog_mah_authorization_file'
                            prefix: 'MAF'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b5afb092d75a4143a8fd6d97a43dbf18'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'work_notes'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'b60b6efa967249b1bb71f00ec2ebc6d4'
                        key: {
                            name: 'x_cog_mah_case_note'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b613217cb6ce4027bc4fd38113ba47f3'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b61fd63daf664de5a4ce95c95dc3a937'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b62247f53b7a45c59527e80e35b0df22'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'portal_user'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b6284eb0370b47528ae903635970412e'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                            value: 'customer_contact'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b68f6c84a08a454fba53e2611db19c75'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'target_table'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'b6b243c19a594d56860b0086459f6cc6'
                        key: {
                            logical_table_name: 'x_cog_mah_shipment'
                            col_name_string: 'tracking_number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b6b74d6bf9964b3f863eabb7ed1f5c63'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'state'
                            value: 'inactive'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b7118e6166fb43468dd30edbb8e330a1'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '01'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b7789b1d67f243c9a324083568aa2c50'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                            value: 'state'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b7d3a7f783614b0b8f149c4ec3f4f162'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'ship_to'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b7e02c91a182420195614fe1d82a2f60'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b7e3cea16b4642a58c88b15d1edfde98'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'project_code'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b7fe9b03185746ad9dd1ec2731e4cb90'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'intake_channel'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b8ac7afeba1d4bad86aa8882374938b1'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'combat_action_badge'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'b8e90f0ad49e4986a1042012ca4c0225'
                        key: {
                            category: 'x_cog_mah_heraldic_item'
                            prefix: 'HIT'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b93c4504385945e49033ff2fe71656ba'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b97f2e8a0a544fe486758dc153195097'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'approved'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b9f5b45a4f1a4e25898d617080bdba65'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ba1d4720a3ad4cd5a2c6a0f618b37a38'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'line_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ba6da79fbebc488fb3c5bf69ee163676'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bc0f7fbea7d24fd1a39c02b024845a39'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bc323635fe63464a8d93951dca2b4436'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'description'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bccc6436cd2f428dab8c0f07011c4297'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'total_extended_price'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bd2a614c5ec846c8b6d4a0fd43e60667'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'service_level'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bd2a7cf119314e0eb6f2712d846a3f92'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bd587a9f2eb540af99c5501679b5a863'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'address'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bd625e73dba34ad8b656e8d87ed3c801'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bdd6980a04364278b26923d2184091bd'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'be121c393f4d4a119ed9883886aa964a'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'validation'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'be30c9cd8531451582b52404cb903ef1'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_tracking_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'be3a22a3932e4a0e84e45c04cdbfef1e'
                        key: {
                            name: 'x_cog_mah_request_line'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'be86e3e1e9834446968a746eacfacb21'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bece9e4293d44945898b9072806316b6'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bf159aa8c22d4da8acf1a30382026f10'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bf32a762e56d4e93bdeee46c9c8c5549'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'distinguished_service_cross'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bf35f14704c444a99ac8d1b3c2b58893'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bf7fdd7ff03b40ce935b18bf1e82ef0a'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'city'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bf893d8eb0cd4deca41017a77353030d'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'automobile_flag'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bfd2cb7f11dc4895bfd0a9c16d476bce'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bfd377a66b524363857addbec9c7bf84'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c0123e082b6a4fba9daaa4b046a0a19a'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'fund_code'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c0174c18a7514f6e95bf7685037f3fcf'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c0e6fe25e77c4cf1b1db8b79926034d3'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'lead_time_days'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c0f359bec9cc4defa60dde9f70d940cf'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c12949f8d4c94380a8d588ba3ed47023'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_price'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c193229a7b044282a0023b5d33ad2c76'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'batch_id'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'c1f641f90647431ca73338aea3a990e7'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c26f066ba1d8469e85f37af83afac7b7'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c28d9d0977254e52ae50dd9ca2ccd039'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c2e894e48e9a49788fd2ea1172c684e7'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '10'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c30066bab15747349dd880a3f9fd4daa'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c31f79674eed408f886c3c6283c807bf'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                            value: 'merged'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c3d7e5d626b64909ae310a9341486280'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c3f3a27a6f234a85b885698d99679753'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'cancel_reason'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c3f6ec09541f4ecabd64d4c25187339e'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'resolved_by'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c3f81850e7d84b0d8e0f97d144dbcbc5'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c479b912f7314663acdc3dbf56366454'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'drawing_number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c47d63bb04374132941ee4d5752bb5ea'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'file_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c4980e4996f74fe4ba53206461f1bcc7'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c4b7f6f59aca43708e44c06a53ec90a6'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c51b146d7d844e749bb3078fb3d6afc1'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c533c9f2d1e648db81d2d68841e99b22'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'vendor_quantity_shipped'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c5a23e3b2e51433390e4d75ed09c1023'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'inherent_resolve_campaign_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c64242fe426041f88887131d08502364'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'delivered'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'c6cfd96f97734d03a986fe73df210742'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'format'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c6dc67de02d64a22a59a5928fcce94bb'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c70ac43b39e74eafb177068e2fca8700'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            value: 'received'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'c792f792147749de946670e54f7f1eae'
                        key: {
                            name: 'x_cog_mah_vendor'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c798e6ba5afc4875a662317a9d991e91'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'combat_infantryman_badge'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c7fc1e0e3bc647bebce9cb7268e291ff'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c804d56351f14306ba1100c1db088021'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'heraldry_request'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c8efda563d11447a8ad9b6006311c836'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c8f09e019caa4a4f8007a75882815789'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c929f7edaf7b4d2aba23b000e669e4c7'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'returned'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c93b32ee87dc4cd3a4198fae758f4207'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'heraldry_request'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c949d97717d14b628a85fe5b92cc41a1'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'rejected_row'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c98d721dbbea46cbbaa7286b3a5790f4'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c9ceab8bca91446687222fc60f0b2626'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_country'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c9e458d940004d27be810aa24fc90518'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'rejected_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ca3e360979db411890edd493377158cf'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'cage_code'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'ca54fcde3bb444239e04742c6d0e5f03'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ca6b1aca401941208f1763a6e24eb278'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cad76ab6237248479fc118a0549d648b'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'address_state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cb51212c8d274e8f934c64439b2795f3'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_address_2'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cbb48b83803c48d199ae1fb7f4279618'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cbd251102e5b425481cc20a8b081aedb'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'file_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cbeea9328fad49eeb9720bcb8f480f3b'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'contract_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cc166a3967144915acfe057bd47163e8'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'cc539b6ba5cd40168ff311ad5b56a822'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'SE'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'ccbf7d9c718f42de92e465e213b708f8'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'ccd54e788770417c944d183f1815564d'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cd31ed50bbc34156bcc43413536a9948'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'notes'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cd61f512431045dea77a5638a972b33f'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cd797df19a734af18f67e0c1048f06d9'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'drawing_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cdb32b14fab7410a83f10d2768bafd74'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'line_count'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cdb89882d947444eb4eccf927a6410d0'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'source_agency'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'cddddf0907d14c73ad6a875faaa136e4'
                        key: {
                            logical_table_name: 'x_cog_mah_status_map'
                            col_name_string: 'legacy_form,legacy_status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ce0220d916ce45f59fccb9f62b15f5dd'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ceaf07fea59e4ec7aa6998900ca9a225'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cf27b7fb30e44aada2ece19040de42ee'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'cf95cb6ac8ea4ed7b7c189460626f68d'
                        key: {
                            logical_table_name: 'x_cog_mah_awards_case'
                            col_name_string: 'stage,aging_flag'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'cfdcd6e5ec0c4338a47a15be6dc24be5'
                        key: {
                            name: 'x_cog_mah_shipment'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd04f3cf97f824bf18c726f57e2017c65'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd088b967010845d091b872d44a06e3db'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd0995a52a0ed434fa06be68f5627271b'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd0dd4aa899754b5aabd8f780ccc3eabf'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd0ed9485b98042ff89d7e76b86c93c6a'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                            value: 'closed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'd0edbfd571b94288ac4b5053bbddac5c'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd1e36e3f387d4590ab8203cc825b72a7'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd1e94a72cc344370af010e04f3815878'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd215daad6edb4d5b846f07047b1a6d6b'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd3482ee5d28c4ff1baf8907f52ac72b8'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd3802bf3c1b64cf481f59c1b7023e3b5'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd38bf73123024b9a9b3e8a976ab8656c'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'signal_code'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'd39a1acdbd654c4f8621313ce448b0a2'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd3d78a4193574054b0d97a8c616cb92e'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'award_line'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd4d183c2b29d4e35994cb4372c498fd2'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'first_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd505f1a904924f7a81f6955999e2b16f'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'authorization_file'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd5cb738dae724e3f989b28aca7702a81'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'BX'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5dc59834f3546f5bcaf25544ba2ba5e'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5ecdd6314e64ced9afed61e01488ea2'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'qty'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd602475c2c06483e8980c63dfbf470d4'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_zip'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd6456f53d50845b3b84d91d50b213704'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'work_notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd6533aefc898418bab7ed564a9bf8515'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'source_agency'
                            value: 'hrc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd66fee647bb44467ab30d3ed65ea72e1'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                            value: 'parse_status'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd77a8e761ba34f529ce35d1beb4b3b7e'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'draft'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd7afdba44af846eca378a65dbc2bb234'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd828de7f6139426b9c62fa92a12eec4b'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'format'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'd8478137e2b74c73bba3b174f85a063d'
                        key: {
                            logical_table_name: 'x_cog_mah_vendor'
                            col_name_string: 'portal_user'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'd898dc1511c5402cb9b91e92817b3795'
                        key: {
                            category: 'x_cog_mah_ses_flag_request'
                            prefix: 'SES'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd8cfec11a76e4425870b0e2ac1d2c6a4'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'delivered'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd8d22223af3e4a3394dd59200659581f'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'format'
                            value: 'json'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'd8e12aadefa1484a95b0b58fa4fef2da'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd8f3d20677264ace90ded1cef39a4de5'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'received'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd8f51cbde71049b18fcf41a5336a116d'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd9c329e0aa7c4acd813d912b7207b903'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '15'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'da16388d6bb347b99bb9518b891a17e7'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_acknowledged'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'da76c8b6b7624bbab4dc5c64d42617f3'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'db6bd0151e044ff68b472f927d32c491'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'cancel_reason'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'db860782decb47248e1118841e898454'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dbb9abee2685454fb8a251d57b0f6d4d'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'heraldry_request'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dbc25793be3c4af299e9ae0b0dc084aa'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'short_description'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dcbee1edac9f4e0f9cd2c9b746e19475'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'dcc8a0edeebd4f25b967f70b8ac71318'
                        key: {
                            logical_table_name: 'x_cog_mah_requester'
                            col_name_string: 'dedupe_key'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'dce960d64e4d4779b224d4c3f17ae748'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                            value: 'label_created'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'dd27384271024b22956523d54c44c111'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'armed_forces_reserve_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dd7865ac249c4c46b7debaab8eff2572'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'dd97d242b98a40d8a82dd10533018202'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'price'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'de5cb108cc4b409a900d4d70c0c469bb'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_ship_date'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'df0259671df74db7a2056d5be287533f'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'df8376538aa74435aca7df274f52d4f4'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'df9c8861ec06418ca5de0e1e80bd64d6'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'executive_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e02bd4bbfdbf4ed2b473805bcdd87734'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e030c74b9c3a4751be50194d74fc3041'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e0423bf3e5754bc78d0dc54ae4e7a04c'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requester_poc'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e04a16afeebf47c18cac17e6ce2a52a3'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e12bf40b6903481486670080e65ede2d'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e1611bc0872346cda71d638dcdb72c9c'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'quantity'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e1630931eeb7454c839ed9a32a91c094'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'service_level'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e19f99474de04a6da24e8870c79ed4ca'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'c_device'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'e1b784bb771e485e892f57e382fbe1ae'
                        key: {
                            name: 'x_cog_mah_status_map'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e1c740da10f3473dbd2bea5e38b0a98d'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'target_sys_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e1f9a03e3e514bf58772b39582bffef3'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e29449a1776746aca8e2b6512b796e85'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'address_2'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e2a6de31260148dc95a015f412db2e79'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'e2b63bffb7c049b397720ea1c7dff0a6'
                        key: {
                            category: 'x_cog_mah_case_note'
                            prefix: 'MCN'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'e2c3f27c0451499fb5492744714b0eed'
                        key: {
                            category: 'x_cog_mah_award_line'
                            prefix: 'MAL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e302ab8e1a8e4b228c27a818771dc396'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'bronze_star_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e328784351104bf89007ba27351a4b80'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'resolved_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e339b2d862084e91b0ce5b2e0683e959'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e35ba588877b4dec8e3a56c4a5065d82'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e3da1963d979479ca5bd6727f8379b3e'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e40c8fa8eb644df4b39063faac5058f6'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'dedupe_key'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e43546476bac42238aab10c4cfc547ad'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage_entered_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e4c43c3389c64df78f2731de87066275'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e4dd6ef4fa6848a7aef21dbf32eb0118'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e4e395ad04ba43fcb4c21848ff63632c'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_agency'
                            value: 'nprc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e50245b4dc7642dea441260fe47b44f0'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e52cfa21dacf4e78a624a121f7771d5d'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'priority_handling'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e5613bb3add445ec8c815c2aa5ca2d61'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'duplicate_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e57e7288f0164568a3821532755dae8f'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'army_commendation_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e58c56a1c95c43d1bdc20f96d38fd5df'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e5bf587e6d454aecbce48a0b3dcbceba'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'requesting_office'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e5bf5bedb01e4aba8fc1161afc5bdd09'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e5fcef90b956473b98aac26f024480f0'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'document_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e6129e1aa5084a3ebbecebab2fb99b7d'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e633d8472e754e568125c6fafcb179e1'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e66ce5041a2b45418c8c918b254a9f21'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'r_device'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e66d649d32e34756886b864769659ba6'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'device'
                            value: 'bronze_service_star'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e67379508dc2491e967b913631d9d7b8'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'capabilities'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e6b3c604dc5543fd993412536f0ff72f'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'world_war_ii_victory_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e727c571d0674b68b0a12516826e2fc9'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e7c9a2171e954f09899acff763e97368'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            value: 'rework'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'e7f2f14b05cc45f497cd326036dad25e'
                        key: {
                            name: 'x_cog_mah_case_note'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e82bb4100e78486aaed2d11a0575c472'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                            value: 'requester'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e838cbc951de4ed2a0e6c2ca10bbe862'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_log'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e860bff9582c4849b494d16299c00c46'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'state'
                            value: 'cancelled'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e87d1c4662bb4064870711f1a92ad9af'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'reviewer'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e88acef64fff4160b46f5fd7fe773c79'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'engraving_required'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e8f62ade70744ae19ea35c509d1e3278'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'exception_item'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e92efbca861c4fbd88768a60538965bb'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e94b985f469e42d49ab0835a815167fa'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'armed_forces_service_medal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e982a0bcfed54365bcf07cc0ac5c1e05'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'e987b3b09abc4049bf48409e04b9606d'
                        key: {
                            logical_table_name: 'x_cog_mah_migration_exception'
                            col_name_string: 'batch_id'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'e988184dd0444edcb245da226e93ae31'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e9a433c0965340478c49e17a945e5915'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e9b43b6df4f6420188a8a8e994e9f061'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'justification'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e9bb9bc5560f4297980f82cd023d1654'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'ship_to_address_1'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e9c2dae4c33240ee823ce92d8546eb6b'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'approved_by'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e9c5bab2824d4075bfb757904d8cd022'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_status'
                            value: 'parsing'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e9c93c927ecb4cf5994075ce4ffd8682'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'released_by'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'e9fc753f71e04583a7131b80d4415297'
                        key: {
                            logical_table_name: 'x_cog_mah_heraldry_request'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ea236118ea904a56a3847bfd80fef5cb'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ead2afe8a4394d1693bccc9081d15eb9'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'closed_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ead4486fafb94916978e44e1da844612'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'field_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eb3ee29b5d1c42ecaf5ebf6b3e677f00'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'eb6912d495d04f588f2260d5f399d838'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'accepted_count'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'eb80b696f3964778a9bce67b32a3bfd0'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                            value: 'tabard'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eb846da995984b4789bb29c1fa4359f2'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'stock_number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'eba23ae2ffa74e9eb8ab6c39cbb184b4'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'font'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ebf915ea7eaa4dfba4887f98d418e90c'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ec130037c5f548a3964f52f82edf063f'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ec52f90a087a4cc4b0e843d5747103b9'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'released_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ec6b83ee0fb6432f94673e322f025693'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'justification'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ec8293ddb9434a8bb8cf1f2431127d5a'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'line_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'eca0a03309224639b433b21ade826c07'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            value: 'released_to_vendor'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ecabc2d336bf4b4c862ac2bcda56d589'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'started'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ecbbbe5c4a0f43fc82cf27fc64435aca'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'quantity'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ecff1e745162424aa3ab7b61b7bc7392'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requesting_unit'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'ed1197c3db73449baadb28e0eb797a77'
                        deleted: true
                        key: {
                            logical_table_name: 'x_cog_mah_probe'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ed153e6486e54be9891a60604960d0c8'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'qc_notes'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'edc16969ce8e46cba0f46055e5ec1555'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'state'
                            value: 'open'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'edc99cf89e9f42ebb73c2cc5a302fd79'
                        key: {
                            logical_table_name: 'x_cog_mah_awards_case'
                            col_name_string: 'source_agency,source_record_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'edcf88d6b2e44c23b68597d9c8df7659'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'source_agency'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'edd1112eaa3e482aa735f1e6f8b20807'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'match_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'edfc6dab7e274545a16f320fb263f12c'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'category'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eea671eee426412fa79a9d4b6fbbf7dd'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_status_raw'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'eeb11b673d144e4284161d22dafa52a6'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eeddc646f378428abaf119fe88438493'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'duplicate_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'ef28ae4ca3814ab28e0f0679cbaff493'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ef411196330c474a925539608c7b0e1d'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'aging_flag'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ef8681f779c24385b9db1d9e93620c98'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ef936a6307e7477b91112e371ce5b97d'
                        key: {
                            name: 'x_cog_mah_vendor'
                            element: 'email'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ef9a4561e713404ea72eeb8b73c5288e'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'legacy_status_raw'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'efb89eaea01f4ffeb74195fa8d68db41'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'source_row'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'efcc31178dbe456e8fbe3debbb11ab2f'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'first_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f060b76db2d14ac7b0a7f95ae916f4b1'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f09aacfddc4245feaca219e8c44b4c9a'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'appointment_date'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f0efab003a344f70b5d774d23a237c88'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'extended_price'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f0f4c5e57f3a4945bdfecc04a85c83a7'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'case_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'f1226a66cd684d0fa295c20aaf6eb327'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f191a6b7940f468c88beb22d28eceeb3'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'stage'
                            value: 'assembly_qc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f1b924ed518b4308b852b1b481be3d09'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f1bb50e5aaf24c7daf567128450439df'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'noted_at'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f21fb670eee14bba8519c64c5be17c50'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '02'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f260e283954f4acaa63c7837ad4c17ab'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'award_name'
                            value: 'legion_of_merit'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f2dabd6e765c4601a1da4511b4a48627'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'preferred_vendor'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f33a597791694b56a6d4f6748ab19703'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f39fc36c7c224763bdec9a7a17647857'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'award_line'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f3d321e212d142dbb9f7316c42a43471'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f42d9be2e5b34565b956915dc2a13401'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'exception_type'
                            value: 'orphan_parent'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f455fc00aa3b410691358902887ae548'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '03'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f4cc54f1380b4407b51fac874fb1cffc'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'work_notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'f51597e7d3854b94ae99236191ec2940'
                        key: {
                            name: 'x_cog_mah_requester'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f524811f18d344e2baca811255171c78'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'merged_into'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f537772c6b7a421bb2d30bf762f37827'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f650567de7b243f9a2a2eb04a20c0364'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'in_production'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f68a9b9ea5ef49deb7f25ac0a25b9475'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'heraldic_item'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f6c07125e22049068bfe6fb526ffd741'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'source_agency'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f75504348f31488d859bab1c5114de7c'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'legacy_form'
                            value: 'heraldry_request'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f76d0f34d0e643eeaa47d78b6ae0896c'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'relationship'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f77727dfbde840ac9c901d9d6ab4babe'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'source_agency'
                            value: 'nprc'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f81a5af8ff8d4b5c83c358279d5822c7'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'country'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f853ca227a65488091f6d7c5eadeeeeb'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'status'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f8745305ba9a42b5a5619f6febe506aa'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'f8819f196b8847a5b073a53c76c0a22c'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_field'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f8db8102d5254f669a3cffdea35c7767'
                        key: {
                            name: 'x_cog_mah_case_note'
                            element: 'note_type'
                            value: 'system'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f91b9891a38d48f88b5078a373e4728b'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'service_number_last4'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f93d1a6081ff48949b5c62ce832b85b4'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'assigned_to'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f95b6cc70cbd42048d47effb25065856'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'vendor_tracking_number'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'f991480834574f78b85097c50b14155f'
                        key: {
                            name: 'x_cog_mah_requester'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f9922d756b484683a7e1dc241bb59a0b'
                        key: {
                            name: 'x_cog_mah_award_line'
                            element: 'stock_on_hand'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'f9a5efc17c99495c8fc90f325f7a09a4'
                        key: {
                            category: 'x_cog_mah_vendor'
                            prefix: 'VND'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f9bab596667f44a3a0fc045ad8720c54'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'qty'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f9d5743750dc40198ed03104b9fd3ce0'
                        key: {
                            name: 'x_cog_mah_awards_case'
                            element: 'legacy_form'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'f9f286215b2e481a98df4590cffca95e'
                        key: {
                            logical_table_name: 'x_cog_mah_case_note'
                            col_name_string: 'heraldry_request'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fa3b264bedee4445a2f8d4119034b208'
                        key: {
                            name: 'x_cog_mah_heraldic_item'
                            element: 'unit_of_issue'
                            value: 'KT'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fa78485e6b0f479fb197fcf034125164'
                        key: {
                            name: 'x_cog_mah_requester'
                            element: 'address_2'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fa81bba129eb432c906476d89c2931ee'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fa9e4cc1cd854434b14b7e5fd7bff1a4'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'status'
                            value: 'unmapped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fab0bf4ccaf3411b81a110acc2f1b995'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'parent'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'facbd9699ea04a0390342ed35dfb9bc5'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'facd7e404398463db4ddc543a9c019d6'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'fadc2ff4e3664a3f8b31d49b37eb02be'
                        key: {
                            logical_table_name: 'x_cog_mah_case_note'
                            col_name_string: 'legacy_unid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fc624ec929054c1a9f0b0d6b229f9167'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'match_count'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fc791521b80341ab8d81b58236f91fec'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requisition_priority'
                            value: '12'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fcd84656fa18401bb71a2e0664bf02ce'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'requesting_unit'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fd3aa951287e4a97ba9cd4dd0b0a7008'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fd64e8786a6c45f2a5cfb4fdff1734f9'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'flag_type'
                            value: 'desk'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fd9ec48d61ec43008e30d5f8a80a4afd'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'rejected_count'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fdbf8e618096473e8036299be452e4b7'
                        key: {
                            name: 'x_cog_mah_status_map'
                            element: 'target_value'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fe52c3ea2be94eb39aa3e581498949ac'
                        key: {
                            name: 'x_cog_mah_shipment'
                            element: 'carrier'
                            value: 'military_courier'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fece3e36906240d3b4179d99362f39a5'
                        key: {
                            name: 'x_cog_mah_engraving_job'
                            element: 'legacy_unid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ff1d69cec04e43e794bbd8ac999d8ef0'
                        key: {
                            name: 'x_cog_mah_heraldry_request'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ff25a115d2624091bf1a994146fa217d'
                        key: {
                            name: 'x_cog_mah_authorization_file'
                            element: 'parse_log'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ff2a29f93a25434f90d4b0da092e2e92'
                        deleted: true
                        key: {
                            name: 'x_cog_mah_probe'
                            element: 'legacy_last_modified'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ff9eb9dc0f734d49b6b59f41e81f20e2'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'legacy_last_modified'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ffb116da942345b382f3840756436181'
                        key: {
                            name: 'x_cog_mah_migration_exception'
                            element: 'legacy_form'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ffb3db8167d544b6809c287d2476ea1e'
                        key: {
                            name: 'x_cog_mah_ses_flag_request'
                            element: 'state'
                            value: 'rejected'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ffbcea92107b40319ecebff46b82feeb'
                        key: {
                            name: 'x_cog_mah_request_line'
                            element: 'unit_of_issue'
                            value: 'KT'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                ]
            }
        }
    }
}
