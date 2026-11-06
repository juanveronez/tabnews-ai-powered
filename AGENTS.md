## What this is

Re-implementation of https://tabnews.com.br (Brazilian tech community: posts, comments, TabCoins, etc.) built with AI assistance. Personal project of Juan Monteiro Veronez.

## Language

- The user writes in Portuguese (pt-BR); reply in Portuguese unless asked otherwise.
- The product is Brazilian: user-facing UI text should be pt-BR.
- Code and identifiers are in English. Commit messages are in English and follow Conventional Commits (`feat:`, `chore:`, ...).

## Stack

- Next.js (App Router, `app/` at repo root), React, TypeScript, npm. The Node version is in `.nvmrc`.
- These versions are newer than much of what models remember. Check `package.json` and the installed package (`node_modules/next`, its docs/types) before relying on memory for framework APIs and behavior.

## Commands

```
npm run dev     # next dev
npm run build   # next build
npm run start   # next start (needs a prior build)
```

- Check the `package.json` scripts for anything else. Typecheck with `npx tsc --noEmit`.
- Don't claim tests pass or lint is clean unless you actually ran them.
- Ask before adding new tooling or major dependencies.

## Code style

- Default exports, function components, 2-space indent, double quotes, semicolons.
- Use relative imports unless a path alias is configured in `tsconfig.json`.

## Git

- Default branch is `main`. Don't commit straight to `main` for feature work; branch first.
- Only commit/push when the user asks.
- Never commit credentials. Make sure `.env*` is in `.gitignore` before introducing any secrets or database URLs.
