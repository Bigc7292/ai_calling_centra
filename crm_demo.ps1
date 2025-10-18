# CRM Integration Demo Script
# This script demonstrates the working CRM integration

Write-Host "=== AI Calling Center - CRM Integration Demo ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. Testing CRM Dashboard Endpoint" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3001/crm/dashboard" -Method GET
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:" 
$response.Content | ConvertFrom-Json | Format-List
Write-Host ""

Write-Host "2. Testing CRM Leads Endpoint" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3001/crm/leads" -Method GET
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:" 
$response.Content | ConvertFrom-Json | Format-List
Write-Host ""

Write-Host "3. Testing CRM Contacts Endpoint" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3001/crm/contacts" -Method GET
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:" 
$response.Content | ConvertFrom-Json | Format-List
Write-Host ""

Write-Host "4. Testing CRM Deals Endpoint" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3001/crm/deals" -Method GET
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:" 
$response.Content | ConvertFrom-Json | Format-List
Write-Host ""

Write-Host "=== CRM Integration Demo Complete ===" -ForegroundColor Green