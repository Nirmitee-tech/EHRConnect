#!/bin/bash

# Clinical Reports
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/clinical/{encounter,timeline,referral,lab-radiology,results,medication-orders,care-pathway,vitals,chronic-disease,population-health}

# Provider & Operational
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/provider/{encounter-summary,productivity,specialty-workload,appointment-utilization,wait-time,clinic-slot,bed-occupancy,equipment,ot-schedule}

# Financial & Billing
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/financial/{claims-submission,payment-posting,denial-management,ar-aging,charge-lag,patient-balance,department-revenue,service-profitability,payer-mix}

# Regulatory & Compliance
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/regulatory/{meaningful-use,interface-logs,immunization,user-access,break-glass,failed-login,consent,advance-directive}

# Patient Engagement
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/patient-engagement/{portal-usage,message-volume,telehealth,feedback,survey-results,response-time}

# Analytics
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/analytics/{disease-registry,outbreak,risk-stratification,readmission-risk,length-of-stay,high-risk,hedis,care-gap,benchmarking}

# Technical & Integration
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/technical/{fhir-api,adt-messages,interface-uptime,data-validation,sync-failure,batch-jobs}

# Administrative
mkdir -p /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/reports/administrative/{user-roles,access-usage,master-data,insurance-master,report-builder}

echo "Report directories created successfully!"
