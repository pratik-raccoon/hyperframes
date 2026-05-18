---
name: sync-upstream
description: Sync the `raccoon` fork branch with `heygen/main` (upstream). Audits the fork's patches against the merge base, fetches upstream, merges with `--no-ff`, resolves conflicts while preserving the raccoon-host bridge / sandbox feature gates / theme tokens, and verifies the fork's invariants survived. Run this before a `raccoon-skills/release.md` cut whenever `heygen/main` has moved.
---

# Sync upstream

This skill keeps `raccoon` current with `heygen/main` while protecting the patches that make the fork the fork. The fork's value lives almost entirely inside `packages/studio` — everything else should track upstream verbatim.

## Why the fork exists (read first)

The Raccoon web app embeds the Studio inside an iframe ("motion preview"). That iframe is a remote lightweight sandbox: **no Chromium/Puppeteer/FFmpeg-driven rendering can run inside it.** The fork's patches enforce that constraint and dress the Studio to match the Raccoon shell. Five ideology buckets, in order of how often they collide with upstream:

1. **Sandbox feature gates** — `packages/studio/src/raccoon.ts` exports `IS_RACCOON_BUILD` (driven by `VITE_STUDIO_RACCOON` from `packages/studio/.env.raccoon`) and the `RACCOON_HIDES_*` constants for Capture, Export, left sidebar, composition thumbnails, and header logo. The Raccoon build is what we ship; the Full build still works for upstream.
2. **Host bridge** — `packages/studio/src/hooks/useRaccoonHostBridge.ts` defines the postMessage protocol between iframe and host page:
   - `RACCOON_MOTION_STUDIO_READY` (studio → host) — ping after the listener is live. Without it, hosts that reply on iframe `load` race the React mount.
   - `RACCOON_MOTION_HOST_HELLO` (host → studio) — flips `isRaccoonHost` true.
   - `RACCOON_EXPORT_REQUESTED` (studio → host) — header Export delegates to the host; the iframe can't encode video.
   - `RACCOON_AGENT_PROMPT_SUBMITTED` / `RACCOON_AGENT_PROMPT_ACK` — inline Ask-Agent composer routes prompts up to the host.
3. **Trimmed UI** — `App.tsx`, `StudioHeader.tsx`, `StudioRightPanel.tsx`, `PropertyPanel.tsx` carry conditional renders driven by the gates above. `App.tsx` has ~13 raccoon touchpoints and is the highest-conflict file in any sync.
4. **Theme alignment** — Geist fonts + raccoon-neutral palette + light/dark tokens live in `packages/studio/index.html`, `packages/studio/src/styles/studio.css`, and `packages/studio/tailwind.config.js`.
5. **Inspector Ask-Agent composer** — `packages/studio/src/components/raccoon/` houses the composer mounted in `PropertyPanel.tsx` only when `IS_RACCOON_BUILD`.

A merge that quietly breaks one of these is a regression — re-resolve, don't let it ship.

## Workflow

### 1. Audit our patches before fetching

Know what you're defending before you start merging:

```bash
git fetch heygen --quiet

# Commits raccoon adds on top of upstream
git log --oneline heygen/main..raccoon

# Files our patches touch (the conflict surface)
git diff --stat heygen/main...raccoon -- packages/studio

# Sanity: raccoon patches should only touch packages/studio, .filesize-allowlist,
# raccoon-host-test.html, and skills/. Anything else is unexpected.
git diff --stat heygen/main...raccoon -- ':!packages/studio' ':!packages/producer/dist'
```

The three-dot `...` form diffs against the merge base — the listing contains _our_ changes only, not upstream's.

### 2. Check what's coming in

```bash
git log --oneline heygen/main ^raccoon
```

Empty output ⇒ already up to date, stop. Otherwise scan every subject. Flag commits that touch:

- `packages/studio/src/App.tsx` (allowlisted for size in `.filesize-allowlist`)
- `packages/studio/src/components/StudioHeader.tsx`, `StudioRightPanel.tsx`
- `packages/studio/src/components/editor/PropertyPanel.tsx`
- `packages/studio/src/hooks/usePanelLayout.ts`, `useRenderClipContent.ts`
- Anything under `packages/studio/src/styles/`, `packages/studio/tailwind.config.js`, `packages/studio/index.html`

Those files are where upstream churn most often collides with our patches. Also read upstream `chore: release vX.Y.Z` commits — they bump every `package.json` version, take them verbatim.

### 3. Merge

```bash
git checkout raccoon
git merge heygen/main --no-ff -m "chore: merge heygen main into raccoon"
```

**Always a merge commit, never a rebase.** Rebasing rewrites our patches' SHAs and forces a `--force-with-lease` to `origin/raccoon`, which is the shared integration branch. The history anchors (`b30719d0`-style "merge heygen main" commits) are also load-bearing for diff archaeology — don't lose them.

### 4. Resolve conflicts with the ideology in mind

For each conflicted file:

- **Keep the `IS_RACCOON_BUILD` / `RACCOON_HIDES_*` gate.** Where one wraps a render, the wrapper stays. If upstream refactored the wrapped block, port the refactor _inside_ the wrapper.
- **Keep the `useRaccoonHostBridge` wiring.** `App.tsx` initialises the hook and threads `raccoonHost.isRaccoonHost` / `requestExport` / `submitAgentPrompt` through. If upstream rewrote the same plumbing, fold our threading in.
- **Keep the theme tokens.** Upstream palette tweaks should land _under_ the raccoon palette overrides in `studio.css` / `tailwind.config.js`, not replace them.
- **Keep the Raccoon composer mount.** `PropertyPanel.tsx` mounts `<RaccoonAskAgentComposer>` only when `IS_RACCOON_BUILD`. If upstream removes a surrounding API (e.g. dropping `onResetManualEdits`, as happened in the last sync), adapt — don't restore the upstream-removed surface to keep the diff small.
- **Files under `packages/studio/src/components/raccoon/`, `useRaccoonHostBridge.ts`, `raccoon.ts`, `.env.raccoon`** are raccoon-only. A conflict here means upstream added a clashing path — investigate before resolving.
- **`packages/producer/dist/` is tracked on purpose.** `96f42d0c` reverts an earlier attempt to drop it. If upstream's tree disagrees, prefer ours.
- **`bun.lock` conflicts** — accept the merge result and re-run `bun install`. Don't hand-edit.

### 5. Verify

```bash
bun install
bun run build
bun run --cwd packages/studio build --mode raccoon
bun run --filter @hyperframes/studio test
bunx oxlint packages/studio/src
bunx oxfmt --check packages/studio/src
```

The `--mode raccoon` Studio build is the one we actually ship — if it fails, the fork is broken even if the Full build still compiles.

### 6. Push

```bash
git push origin raccoon
```

**Never force-push `raccoon`.** If the merge needs to be redone, revert the merge commit (`git revert -m 1 <merge-sha>`) and re-merge — don't rewrite.

## Things to know

- **Don't rebase the fork onto upstream.** Merge commits give us a real history of when each upstream sync landed; rebasing destroys that.
- **`.filesize-allowlist` includes `App.tsx`** because the raccoon-host bridge wiring crossed the 500-line gate. Don't remove the entry "to clean up" — you'll re-trip the pre-commit hook on the next sync.
- **`packages/studio/dist/`, `packages/cli/dist/`, etc. are not tracked.** Reject any upstream commit that starts tracking them — that's noise from a publish flow, not real content.
- **After a successful sync, the next step is usually a release.** See `skills/raccoon-skills/release.md`. Never tag mid-sync.
- **Don't skip lefthook** (`--no-verify`) on the merge commit. Fix lint/format/typecheck failures instead.
