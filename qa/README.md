# QA / Test Report — UniFood

This directory contains manual QA and software testing work performed on the UniFood restaurant review platform.

## Scope

Manual functional testing covering the main features of the app:

- Register
- Login
- Profile
- Restaurant (browse, search, add, edit)
- Review
- Admin

## What's Inside

| File | Contents |
| --- | --- |
| `Test_Report.xlsx` | Contains 3 sheets: TS (Test Suites), TC (Test Cases), and Bug Report |

- **TS** — High-level grouping of test cases by feature area
- **TC** — Detailed test cases including test data, steps, expected result, actual result, and status
- **Bug Report** — Defects found during testing, including steps to reproduce, actual vs. expected behavior, and severity

## Summary

- Total test cases: 44
- Passed: 43
- Failed: 1
- Bugs logged: 1 (Medium severity)

Breakdown by screen: Register (7), Login (5), Profile (2), Restaurant (17), Review (8), Admin (5)

## Testing Approach

- Manual functional testing
- Equivalence Partitioning (EP)
- Boundary Value Analysis (BVA)

## Testing Tools

- Web browser (manual testing)
- Microsoft Excel
