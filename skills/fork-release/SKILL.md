---
name: fork-release
description: Cut a release on a fork by attaching a locally-built CLI tarball as a GitHub Release asset using `gh`. Use when the fork ships its CLI as a pre-built `.tgz` consumed via `releases/latest/download/hyperframes-cli.tgz` instead of publishing to npm. Skip this skill for the upstream npm flow (`scripts/set-version.ts` + `.github/workflows/publish.yml`).
---

# Fork release

Manual GitHub CLI release flow for forks that ship the CLI as a pre-built tarball asset rather than publishing to npm. The asset URL `releases/latest/download/hyperframes-cli.tgz` always resolves to the newest release, so consumers don't need to know the tag.

## Workflow

### 1. Build the CLI tarball

```bash
bun install
bun run build
cd packages/cli && bun pm pack && cd -
mv packages/cli/hyperframes-cli-*.tgz releases/hyperframes-cli.tgz
```

`bun pm pack` writes `hyperframes-cli-<package.json-version>.tgz`. Rename to the stable `hyperframes-cli.tgz` because the consumer URL is fixed.

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
  --title "<tag> — <one-line summary>" \
  --notes "$(cat <<'EOF'
### What changed

- ...

### Asset

`hyperframes-cli.tgz` — install with `npm install -g <url>`.
EOF
)" \
  releases/hyperframes-cli.tgz
```

The tarball goes as a **positional argument** — that's how `gh` attaches assets. Match the prerelease flag (`--prerelease` or omit) to what the prior releases used.

### 4. Verify and clean up

```bash
# Confirm the new release is what `latest` points to
curl -sLI -o /dev/null -w "%{http_code}\n" \
  https://github.com/<owner>/<repo>/releases/latest/download/hyperframes-cli.tgz
# Expect 200

# Drop the rebuilt local binary
git checkout -- releases/hyperframes-cli.tgz
rm -f packages/cli/hyperframes-cli-*.tgz
```

## Things to know

- **Do not commit the rebuilt `releases/hyperframes-cli.tgz`.** The in-repo file is a legacy artifact. The GH Release asset is the canonical source — committing on every release just bloats history with megabytes of binary diff.
- **Do not bump `package.json` versions.** A fork release re-tags the same upstream version with a fork-specific suffix; the actual workspace versions stay pinned to whatever upstream the fork last merged.
- **Do not run `scripts/set-version.ts` or expect `.github/workflows/publish.yml` to do the work.** Those drive the upstream npm publish flow and don't apply here. If `publish.yml` fires on the tag push and fails validation, that's expected — ignore it.
- **Do not skip lefthook** (`--no-verify`) on any commits made during the release. Fix lint/format/typecheck failures instead.
- **Tags are immutable on the remote.** If you need to re-cut, delete the remote tag, the local tag, and the GH Release first, then start over. Never `--force` a tag.
