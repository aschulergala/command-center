param(
    [int]$MaxIterations = 10,
    [int]$SleepSeconds = 2,
    [switch]$SkipPluginSetup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ==========================================
# Plugin Setup (runs once at start)
# ==========================================
if (-not $SkipPluginSetup) {
    Write-Host "Setting up GalaChain plugins..."

    # Add marketplace (idempotent - safe to run if already added)
    & claude -p "/plugin marketplace add aschulergala/claude-plugin-marketplace" 2>&1 | Out-Null

    # Install omni-tool (idempotent - safe to run if already installed)
    & claude -p "/plugin install omni-tool" 2>&1 | Out-Null

    Write-Host "Plugins ready."
    Write-Host ""
}

Write-Host "Starting Ralph - Max $MaxIterations iterations"
Write-Host ""

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host "==========================================="
    Write-Host "  Iteration $i of $MaxIterations"
    Write-Host "==========================================="

    $prompt = @"
You are Ralph, an autonomous coding agent. Do exactly ONE task per iteration.

## Available Tools

You have access to the GalaChain omni-tool plugin with 247 tools:
- Use `/galachain:ask [topic]` to get detailed explanations of GalaChain SDK usage
- Use `/galachain:topics` to see all 41 available teaching topics
- The plugin provides tools for: trading, liquidity, bridging, tokens, analytics, streaming

When implementing GalaChain-related code, use these tools to:
- Look up correct SDK method signatures
- Understand DTO structures and required fields
- Get code examples for specific operations

## Steps

1. Read ISSUES_FIX_PLAN.json and find the highest priority task that is NOT passed. You should decide which task to implement based on the priority and the progress of the other tasks, not just the first one that is not passed.
2. Read progress.txt - check the Learnings section first for patterns from previous iterations.
3. If the task involves GalaChain SDK usage, use `/galachain:ask` to get correct patterns before coding.
4. Implement that ONE task only.
5. Run tests/typecheck to verify it works.

## Critical: Only Complete If Automated Tests Pass

- If automated tests PASS:
  - Update ISSUES_FIX_PLAN.json to mark the task passed
  - If there are manual tests required, add a note to manualTestingRequired.txt
  - Commit your changes with message: feat: [task description]. Do not attribute the commit to claude code.
  - Append what worked to progress.txt

- If automated tests FAIL:
  - Do NOT mark the task complete
  - Do NOT commit broken code
  - Append what went wrong to progress.txt (so next iteration can learn)

## Progress Notes Format

Append to progress.txt using this format:

## Iteration [N] - [Task Name]
- What was implemented
- Files changed
- GalaChain tools used (if any)
- Learnings for future iterations:
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---

## Update AGENTS.md (If Applicable)

If you discover a reusable pattern that future work should know about:
- Check if AGENTS.md exists in the project root
- Add patterns like: 'This codebase uses X for Y' or 'Always do Z when changing W'
- Only add genuinely reusable knowledge, not task-specific details

## End Condition

After completing your task, check PRD.md:
- If ALL tasks are passed, output exactly: <promise>COMPLETE</promise>
- If non-passed tasks remain, just end your response (next iteration will continue)
"@

    # Capture stdout+stderr and preserve newlines for reliable printing + COMPLETE token detection
    $result = (& claude --chrome --dangerously-skip-permissions -p $prompt 2>&1 | Out-String)

    Write-Host $result
    Write-Host ""

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "claude exited with code $LASTEXITCODE (continuing to next iteration)"
    }

    if ($result -match "<promise>COMPLETE</promise>") {
        Write-Host "==========================================="
        Write-Host "  All tasks complete after $i iterations!"
        Write-Host "==========================================="
        exit 0
    }

    Start-Sleep -Seconds $SleepSeconds
}

Write-Host "==========================================="
Write-Host "  Reached max iterations ($MaxIterations)"
Write-Host "==========================================="
exit 1
