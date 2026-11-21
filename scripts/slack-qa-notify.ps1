<#
.SYNOPSIS
    Lightweight zero-dependency Slack QA notification dispatcher for Antigravity QA Engineer.
.DESCRIPTION
    Dispatches formatted test execution results, defect reports, and release status to Slack Incoming Webhooks.
    Works natively on Windows PowerShell without requiring external node_modules or heavy background daemons.
.PARAMETER WebhookUrl
    Slack Incoming Webhook URL. Falls back to $env:SLACK_WEBHOOK_URL if omitted.
.PARAMETER Title
    Header title for the notification.
.PARAMETER Status
    PASSED | FAILED | WARNING | INFO
.PARAMETER Summary
    Brief execution metrics (e.g., "18 passed, 0 failed, duration 4.2s").
.PARAMETER Details
    Optional multiline defect breakdown, stack trace, or reproduction steps.
.PARAMETER JiraKey
    Optional JIRA issue key (e.g., "QA-104").
#>

param(
    [string]$WebhookUrl = $env:SLACK_WEBHOOK_URL,
    [Parameter(Mandatory=$true)]
    [string]$Title,
    [ValidateSet("PASSED", "FAILED", "WARNING", "INFO")]
    [string]$Status = "INFO",
    [Parameter(Mandatory=$true)]
    [string]$Summary,
    [string]$Details = "",
    [string]$JiraKey = ""
)

if (-not $WebhookUrl) {
    Write-Warning "SLACK_WEBHOOK_URL is not set. Set it via `$env:SLACK_WEBHOOK_URL or pass -WebhookUrl parameter."
    exit 0
}

$colorMap = @{
    "PASSED"  = "#2eb886"  # Green
    "FAILED"  = "#a30200"  # Red
    "WARNING" = "#daa038"  # Amber
    "INFO"    = "#439fe0"  # Blue
}

$emojiMap = @{
    "PASSED"  = "✅"
    "FAILED"  = "🚨"
    "WARNING" = "⚠️"
    "INFO"    = "ℹ️"
}

$statusColor = $colorMap[$Status]
$statusEmoji = $emojiMap[$Status]

$fields = @(
    @{
        title = "Status"
        value = "$statusEmoji $Status"
        short = $true
    },
    @{
        title = "Timestamp"
        value = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        short = $true
    }
)

if ($JiraKey) {
    $fields += @{
        title = "JIRA Issue"
        value = $JiraKey
        short = $true
    }
}

$fields += @{
    title = "Summary"
    value = $Summary
    short = $false
}

if ($Details) {
    # Truncate details if excessively long to prevent Slack message drop
    $safeDetails = if ($Details.Length -gt 1500) { $Details.Substring(0, 1500) + "... [truncated]" } else { $Details }
    $codeBlock = '```' + "`n" + $safeDetails + "`n" + '```'
    $fields += @{
        title = "Details / Trace"
        value = $codeBlock
        short = $false
    }
}

$attachment = @{
    color = $statusColor
    title = $Title
    fields = $fields
    footer = "Antigravity QA Sentinel (Autonomous SDET)"
}

$payloadObj = @{
    attachments = @($attachment)
}

$jsonPayload = $payloadObj | ConvertTo-Json -Depth 4

try {
    $response = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $jsonPayload -ContentType 'application/json' -TimeoutSec 10
    Write-Host "Slack notification dispatched successfully ($response)."
} catch {
    Write-Error "Failed to dispatch Slack notification: $($_.Exception.Message)"
}
