# Admitguard: High-Performance Admission Walkthrough
**Project: Admitguard | Date: February 28, 2026**

## 🏁 Executive Summary
This walkthrough demonstrates the core functionality of **Admitguard**, a system designed to eliminate data entry errors and compliance risk in student onboarding workflows.

## 🛠️ Architecture Overview
Admitguard follows a 3-layer decoupled architecture:
1. **Presentation Layer**: A dedicated login guard leading to a tabbed interface for Data Entry, Registry View, and Audit Logs.
2. **Logic Engine**: A centralized `validator.js` that consumes rules from `config/rules.json`, enabling "hot-swappable" eligibility criteria.
3. **Persistence Layer**: A Node.js backend with SQLite, featuring a specific `admitguard_audit_log` for tracking soft-rule exceptions.

## 🚶 Step-by-Step Demo Flow

### 1. The Entry Point (Security)
- **Login**: Users are greeted with a high-fidelity login page featuring IIT Gandhinagar campus imagery.
- **Persistence**: Switched from `localStorage` to `sessionStorage` for authentication, ensuring that every new browser session (tab close) requires a fresh login.

### 2. Standard Data Entry
- **Field Logic**: Form utilizes native HTML5 date pickers for DOB and custom dropdowns for Graduation Year (2015–2025) and Interview Status.
- **Success Case**: Enter a clean candidate (e.g., Age 20, CGPA 8.5). The system provides immediate positive feedback and adds them to the registry.

### 3. The "Soft Rule" Exception Flow
- **Scenario**: A student has a CGPA of 6.5 (passing score is 7.0).
- **Behavior**: The system turns the CGPA field amber and prompts for a **"Mandatory Rationale"**.
- **Constraint**: The rationale must be at least 30 characters and include keywords like "Exception" or "Justification" to pass.

### 4. The "Manager Review" Flag
- **Scenario**: A candidate has multiple soft failures (e.g., both Age and Score are outside standard limits).
- **Behavior**: The system allows the submission but attaches a **"Manager Review Required"** system flag, visible in the Audit Log and statistical dashboard.

### 5. Audit & Oversight
- **Audit View**: Every field, timestamp, and rationale is logged.
- **Formatting**: Logs are color-coded (Clean/Exception/Flagged) for rapid internal review.

---
**Build Status**: `V1.0 Stable` | **Lead Developer**: Avik Chatterjee
