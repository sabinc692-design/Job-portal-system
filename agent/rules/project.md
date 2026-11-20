# Job Portal Application Rules and Conventions

These rules apply to all work in the job portal repository, including the backend and frontend. Follow them for new features, fixes, refactors, and generated code.

## 1. Architecture and implementation

- Use TypeScript for both backend and frontend application code. Do not add new JavaScript application files when the surrounding code is TypeScript.
- Follow the architecture, naming, formatting, and established patterns already present in the relevant application. Inspect nearby code before making structural decisions.
- Organize code by feature/module where the existing architecture supports it. Keep a feature's related routes/pages, components, schemas, types, and business logic together; avoid growing generic folders with feature-specific code.
- Keep backend and frontend code separate. Do not import runtime code across those application boundaries unless the repository already has an intentional shared package for it.
- Put code that is genuinely reused by multiple features in the appropriate application's shared area (for example, the backend's `src/lib` or `src/types`, and the frontend's `src/components` or `src/lib`, following existing conventions). Do not create duplicate helpers or components; check for and reuse existing ones first.
- Reuse existing UI components, utilities, and dependencies before creating replacements. Add a library only when the task cannot reasonably be implemented with the current dependencies; keep the addition focused and explain why it is needed.
- Keep modules cohesive, with clear responsibilities and explicit types. Avoid `any`, unnecessary abstraction, and unrelated refactoring.
- Preserve existing public behavior and interfaces unless the requested feature requires a change. Update all affected callers when changing an interface.

## 2. Database and migrations

- Do not change the database schema, Prisma models, SQL schema, or database constraints without first informing the project owner and receiving explicit approval.
- If a feature appears to require a schema change, stop before editing schema or migration files. Explain the proposed change and wait for approval; continue only with work that does not depend on that change.
- Never delete, rewrite, or otherwise alter existing migration files or database data unless the project owner explicitly requests that exact action.
- Do not run commands that apply migrations, reset/seed/clear a database, or modify persisted data unless explicitly requested.
- Keep queries and data access consistent with the current schema and existing data-access patterns.

## 3. Secrets and environment configuration

- Never write real credentials, tokens, private keys, or other secrets into source code, documentation, logs, screenshots, or committed environment files.
- Treat `.env` and other files containing real environment values as sensitive. Do not print or copy their secret values into output or tracked files.
- If documenting required environment variables, use a safe example file (such as `.env.example`) with names and non-secret placeholders only. Never put working credentials in example files.
- Read secrets from the existing environment/configuration mechanism. Do not expose server-only secrets to frontend code, browser bundles, API responses, or client-visible logs.

## 4. Change workflow

- Before editing, inspect the relevant feature and its neighboring implementation so changes fit the current project structure.
- Make the smallest coherent change that fulfills the request. Do not remove unrelated code, data, or files.
- Keep validation, authorization, and error handling consistent with the existing application patterns; do not bypass them to make a feature work.
- When work is complete, summarize the files and behavior changed and report any checks performed. Do not claim checks that were not run.
