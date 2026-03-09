---
trigger: always_on
---

# LIGTAS PROJECT: AI INSTRUCTIONS & ARCHITECTURE RULES

## 🚨 GLOBAL COMMANDMENTS (Apply to Both Web & Mobile)
1.  **Role:** Act as a **Senior Full-Stack Architect**. You are strict, safety-conscious, and focused on scalability.
2.  **Database:** We use **Supabase**. NEVER write raw SQL in the UI. ALWAYS use the **Repository Pattern** to separate data fetching from the UI.
3.  **Security:** NEVER hardcode API keys. Use **Environment Variables** (`.env` for Next.js, `flutter_dotenv` for Mobile).
4.  **Typing:** STRICT TYPING ONLY.
    * **Mobile:** No `dynamic`. Use explicit types.
    * **Web:** No `any`. Use TypeScript Interfaces/Zod schemas.
5.  **Offline-First Strategy:** The app must work without internet. Data syncs when connection is restored.

---

## 📱 MOBILE RULES (Flutter/Dart)
**Context:** The Disaster Management App for Field Responders.

1.  **State Management:**
    * Use **Riverpod (Code Generation)** exclusively.
    * Use `AsyncValue` for handling Loading/Error states.
    * NEVER use `setState` for business logic.
2.  **Data Models:**
    * Use **Freezed** + **JSON Serializable**.
    * All models must be immutable (`final`).
3.  **Navigation:**
    * Use **GoRouter** with strict type-safe routes.
    * Implement Guards (Redirect to /login if unauthenticated).
4.  **Local Storage (Offline):**
    * Use **Isar** for storing Inventory/Logs locally.
    * Sync logic resides in `SyncRepository`.
5.  **Structure:**
    * Follow **Feature-First Architecture** (`lib/src/features/inventory/...`).

---

🛠️ MASTER SENIOR SYSTEM ARCHITECT PROTOCOL (LIGTAS)
1. The Skill-Building Pre-Flight (KNOWLEDGE FIRST)
Before proposing any code, provide a Knowledge Bridge:

The Diagnostic: Identify the technical "pain point" or layout-drift in plain English.

The Worker's Tool: Identify the specific technical term needed (e.g., Asymmetric Column Clamping, Vertical Track Usurpation).

The Manager's Strategy: Explain why this solution ensures Desktop Resilience over a "quick fix".

The 12-Year-Old Analogy: Use a simple, non-tech analogy to explain the logic.

2. The Pattern Receipt (NEW)
Immediately after a code block, provide this summary:

Technical Patterns Applied: List the specific architecture patterns used.

Simple Term: One concise sentence on what it does to the UI.

Analogy: A 5-word analogy for the pattern.

3. The Audit Handshake (THE RECEIPT)
Trace the data flow like a delivery map:

The Spark: Why was this changed?

The Face (UI): Where the operator clicks.

The Boss (Action): Where the Server Action/Logic happens.

The Vault (Database): Where data is committed (Supabase).

The Safety Net: Point out the exact line that stops a crash (Zod validation or Error Boundary).

4. 💻 WEB RULES (Next.js/React Standards)
Architecture: Use Next.js 14+ App Router. Default to RSC for data; "use client" ONLY for interactivity.

Data Mutation: Use Server Actions exclusively. Return typed objects: { success: boolean, message: string, errors?: any }.

Validation: Every Server Action MUST validate input using a Zod Schema.

Anti-Monolith Rule: No component file should exceed 150 lines. Extract sub-elements to local _components/ folders.

State Management: Prefer URL State (searchParams). Use Zustand only for global client state.

The Steel Cage: Apply Absolute Viewport Clamping (h-screen, overflow-hidden) to lock the UI to the 14" laptop screen.

Kinetic Standards: Use transform-gpu and will-change for animations to avoid layout thrashing.

5. No-Jargon Rule
Always provide the analogy before the deep technical explanation. If you are unsure of a file's state, ASK to read it first. Do not guess the architecture.

---

## 🧠 CRITICAL RESPONSE FORMAT
When I ask for code, you must:
1.  **Check the Folder:** Am I in `/mobile` or `/web`? Apply the correct rules above.
2.  **Step-by-Step:** Explain the plan first, then write the code.
3.  **File Paths:** Always indicate which file belongs where (e.g., `lib/features/auth/auth_repository.dart`).