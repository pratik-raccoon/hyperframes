---
name: fork-release
description: Cut a release on the Raccoon fork by building the Studio in sandbox mode, packing the CLI as a tarball, and attaching it to a GitHub Release via `gh`. Use when the fork ships its CLI as a pre-built `.tgz` consumed via `releases/latest/download/hyperframes-cli.tgz` instead of publishing to npm. Skip this skill for the upstream npm flow (`scripts/set-version.ts` + `.github/workflows/publish.yml`).
---

# Fork release

Manual `gh` release flow for the Raccoon fork. The released CLI bundles the **Sandbox build** of the Studio (`vite build --mode sandbox`) so the iframe served from `releases/latest/download/hyperframes-cli.tgz` is the locked-down preview surface — no Capture, no Renders, no left sidebar. The asset URL `releases/latest/download/hyperframes-cli.tgz` always resolves to the newest release, so consumers don't need to know the tag.

## Workflow

### 1. Build the Studio in sandbox mode, then build the CLI

The Studio's `vite build` defaults to the **Full build**. The Raccoon fork release needs the **Sandbox build**, so the studio step is run explicitly with `--mode sandbox` before the CLI is packed:

```bash
bun install
# Build deps the Studio + CLI need (skip the default studio build — we'll
# rebuild it in sandbox mode immediately after).
bun run --filter @hyperframes/core build
bun run --filter '@hyperframes/{engine,producer,player,shader-transitions}' build
# Studio in sandbox mode — loads packages/studio/.env.sandbox and turns on
# all SANDBOX_HIDES_* gates derived from VITE_STUDIO_SANDBOX.
bun run --cwd packages/studio build --mode sandbox
# CLI build copies the just-built studio/dist into its own dist/.
bun run --filter @hyperframes/cli build
# Pack the tarball.
cd packages/cli && bun pm pack && cd -
mv packages/cli/hyperframes-cli-*.tgz /tmp/hyperframes-cli.tgz
```

`bun pm pack` writes `hyperframes-cli-<package.json-version>.tgz`. Move it out of the worktree (we attach it to the GH Release directly — never commit the binary, see Things to know below).

Quick sanity check that the bundled studio is the sandbox build:

```bash
unzip -p /tmp/hyperframes-cli.tgz package/dist/studio/index.html | grep -q "Geist" \
  && echo "ok: theme bundled" \
  || echo "FAIL: studio dist looks wrong"
```

### 2. Tag and push

```bash
git tag <tag>
git push origin <tag>
```

Pick the next tag by checking the existing ones:

```bash
gh release list --limit 5
```

Stay consistent with the fork's existing tag scheme — don't invent a new format.

### 3. Create the GitHub Release with the tarball attached

```bash
gh release create <tag> \
  --repo pratik-raccoon/hyperframes \
  --title "<tag> — <one-line summary>" \
  --notes "$(cat <<'EOF'
### What changed

- ...

### Asset

`hyperframes-cli.tgz` — install with `npm install -g <url>`.
EOF
)" \
  /tmp/hyperframes-cli.tgz
```

The tarball goes as a **positional argument** — that's how `gh` attaches assets. Match the prerelease flag (`--prerelease` or omit) to what the prior releases used.

**Always pass `--repo pratik-raccoon/hyperframes` explicitly.** This repo carries an `heygen` remote pointing at the upstream. Without `--repo`, `gh` may resolve to upstream and reject the release with `tag exists locally but has not been pushed to <upstream>`. Use `git remote -v` to confirm — the release targets the fork (origin), not upstream (heygen).

### 4. Verify and clean up

```bash
# Confirm the new release is what `latest` points to
curl -sLI -o /dev/null -w "%{http_code}\n" \
  https://github.com/pratik-raccoon/hyperframes/releases/latest/download/hyperframes-cli.tgz
# Expect 200

# Remove the local tarball
rm -f /tmp/hyperframes-cli.tgz
# Step 1's `mv` already cleared packages/cli/hyperframes-cli-*.tgz; if anything
# is left over, remove it without failing on no-match (zsh aborts otherwise):
find packages/cli -maxdepth 1 -name 'hyperframes-cli-*.tgz' -delete 2>/dev/null || true
```

## Things to know

- **The released Studio is the Sandbox build.** Capture, Renders, the left sidebar, composition thumbnails, the header logo and the preview-zoom HUD are all gated off via the `SANDBOX_HIDES_*` constants in `packages/studio/src/sandbox.ts`. Do not skip the `--mode sandbox` step or the iframe will ship the Full build by mistake.
- **Do not commit the tarball.** The GH Release asset is the canonical source — committing on every release just bloats history with megabytes of binary diff. Keep it under `/tmp/` or another out-of-tree location.
- **Do not bump `package.json` versions.** A fork release re-tags the same upstream version with a fork-specific suffix; the actual workspace versions stay pinned to whatever upstream the fork last merged.
- **Do not run `scripts/set-version.ts` or expect `.github/workflows/publish.yml` to do the work.** Those drive the upstream npm publish flow and don't apply here. If `publish.yml` fires on the tag push and fails validation, that's expected — ignore it.
- **Do not skip lefthook** (`--no-verify`) on any commits made during the release. Fix lint/format/typecheck failures instead.
- **Tags are immutable on the remote.** If you need to re-cut, delete the remote tag, the local tag, and the GH Release first, then start over. Never `--force` a tag.
