# imouto-dev

`imouto-dev` keeps one development workflow consistent across Codex, Claude Code,
notes, and DeepSeek Harness (dsh).

The repository maintains these components:

- Canonical workflow and blackboard rules.
- Generated Codex and Claude Code skills.
- The installed notes blackboard protocol.
- Two dsh bundles for Yuu and blackboard tooling.
- An owned dsh Codex provider for ChatGPT OAuth and Codex models.

## Workflow

The dedicated Yuu profile uses GPT for parent reasoning. Yuu delegates bounded
implementation work through `imouto-driver`. The driver keeps workers on
`deepseek-flash` with thinking enabled. Workers support `low`, `high`, and
`max` effort. The default is `max`.

```text
GPT through openai-codex
  -> Yuu persona and subimouto-dev policy
  -> imouto-driver MCP tools
  -> DeepSeek Flash workers
  -> Yuu review and blackboard updates
```

Codex is the parent model in this flow. It is not a replacement worker.
The supported worker path remains `imouto-driver`. Native dsh subagent tools
are not the supported imouto path.

The blackboard at `C:\Users\Stella\notes\blackboard` is the durable task
record. Native messages only wake participants and announce completed evidence.

## Maintained artifacts

### Canon

[`canon/`](canon/) contains the maintained workflow sources:

- [`protocol.md`](canon/protocol.md) defines blackboard tasks, work items, state changes, and coordination.
- [`subimouto-dev.md`](canon/subimouto-dev.md) defines execution modes, delegation, review, and completion.
- [`imouto-plan.md`](canon/imouto-plan.md) defines Claude's planning workflow.
- [`imouto-dispatch.md`](canon/imouto-dispatch.md) defines Claude's legacy Codex dispatch workflow.
- [`standards/`](canon/standards/) contains shared completion and branch rules.
- [`plugin.json`](canon/plugin.json) defines the generated Codex plugin manifest.

Edit canon files instead of their generated copies.

### Host specifications

[`hosts/`](hosts/) maps canon files into each host:

- [`hosts/codex/host.yaml`](hosts/codex/host.yaml) generates the Codex plugin and skill.
- [`hosts/claude/host.yaml`](hosts/claude/host.yaml) generates both Claude Code skills.
- [`hosts/notes/host.yaml`](hosts/notes/host.yaml) generates the notes protocol.
- [`hosts/dsh/host.yaml`](hosts/dsh/host.yaml) generates both dsh workflow bundles.

The other files under [`hosts/dsh/`](hosts/dsh/) are maintained templates.
They define Yuu's persona, preset, agent composition, bundle patches, and skill headers.

### Generated outputs

[`dist/`](dist/) contains committed generated files:

- `dist/codex/imouto-dev` is the Codex plugin.
- `dist/claude/skills` contains `imouto-plan` and `imouto-dispatch`.
- `dist/notes/PROTOCOL.md` is the generated blackboard protocol.
- `dist/dsh/dsh-imouto-dev-process` provides blackboard tools and process skills.
- `dist/dsh/dsh-imouto-dev` provides the Yuu preset and orchestration skill.

Do not edit these files directly. Run `corepack pnpm generate` after changing
canon or host templates.

[`golden/`](golden/) holds approved compatibility snapshots. Tests compare
canon files with these snapshots. Update them only after an intentional protocol change.

### Codex provider

[`packages/dsh-imouto-codex/`](packages/dsh-imouto-codex/) is the maintained dsh
provider. It registers the `openai-codex` model provider and selects it for the
dedicated Yuu profile layer.

The package preserves Apache-2.0 attribution for imported work from
[`Yan-Zero/dsh-codex`](https://github.com/Yan-Zero/dsh-codex) at commit
`b726c295dde2490dc2c8df0ff95bead99a3646ed`.
See [`UPSTREAM.md`](packages/dsh-imouto-codex/UPSTREAM.md) and
[`LICENSE`](packages/dsh-imouto-codex/LICENSE) for provenance and license terms.

The provider owns ChatGPT OAuth storage, Codex model access, streaming, tools,
usage reporting, account settings, and its optional provider features. It never
commits credentials or reads Codex CLI credentials as part of normal setup.

See the package [`INSTALL.md`](packages/dsh-imouto-codex/INSTALL.md) for the
complete provider runbook and credential safety rules.

### Blackboard tools

[`tools/blackboard/`](tools/blackboard/) implements validation and controlled
task transitions. [`tools/dsh-plugin.ts`](tools/dsh-plugin.ts) exposes those
operations to Yuu as `blackboard_validate` and `blackboard_transition`.

The CLI accepts these forms:

```powershell
corepack pnpm bb validate C:\absolute\path\to\task.md
corepack pnpm bb transition C:\absolute\path\to\task.md `
  --to implementing `
  --owner Sherry `
  --next "Implement the approved plan."
```

## Requirements

- Node.js 24 or newer.
- Corepack with pnpm 11.10.0.
- A sibling DeepSeek Harness checkout at `C:\Users\Stella\deepseek-harness`.
- A sibling `imouto-driver` checkout at `C:\Users\Stella\imouto-driver` for Yuu workers.

The repository and CI pin DeepSeek Harness commit
`ddefc45fbc7f8e46dd73185e68295696d1297887`, which corresponds to the tested
`0.1.6-alpha.2` surfaces.

Install dependencies from the repository root:

```powershell
corepack pnpm install --frozen-lockfile
```

## Install generated skills and notes

Preview differences without changing installed files:

```powershell
corepack pnpm install-outputs
```

Apply the generated Codex, Claude Code, and notes outputs:

```powershell
corepack pnpm install-outputs --apply
```

The installer backs up replaced files under
`C:\Users\Stella\.imouto-dev-backups`. The dsh bundles have no direct install
targets because dsh manages them through profiles.

## Install the dsh profile plugins

Build and generate current outputs first:

```powershell
corepack pnpm generate
corepack pnpm --filter dsh-imouto-codex build
```

From `C:\Users\Stella\deepseek-harness`, create or inspect the profile:

```powershell
pnpm dsh --profile imouto-yuu --from-default-profile web --dump-config
```

Install local bundles with absolute paths:

```powershell
pnpm dsh plugin --profile imouto-yuu add `
  "C:/Users/Stella/imouto-dev/dist/dsh/dsh-imouto-dev-process" `
  "C:/Users/Stella/imouto-dev/dist/dsh/dsh-imouto-dev" `
  "link:C:/Users/Stella/imouto-dev/packages/dsh-imouto-codex"
```

Custom source profiles also need the Harness peer packages linked:

```powershell
pnpm dsh plugin --profile imouto-yuu add `
  "C:/Users/Stella/deepseek-harness/packages/core/tools" `
  "C:/Users/Stella/deepseek-harness/vendor/cordis"
```

Inspect the effective composition before launch:

```powershell
pnpm dsh --profile imouto-yuu --dump-config
```

The composition must include both workflow bundles and the Codex provider.
It must select provider `openai-codex` for the dedicated Yuu profile layer.

Start the profile:

```powershell
pnpm dsh --profile imouto-yuu
```

## Sign in with ChatGPT

Use one supported login path after the provider is installed.

In Web, open **Settings**, select **OpenAI Codex**, then choose
**Sign in with ChatGPT**.

Check CLI status from the Harness checkout:

```powershell
pnpm dsh plugin --profile imouto-yuu exec dsh-imouto-codex status
```

Start interactive login only when status reports signed out:

```powershell
pnpm dsh plugin --profile imouto-yuu exec dsh-imouto-codex login
```

Use `login --device-code` when the dsh host cannot open a browser. See
[`packages/dsh-imouto-codex/INSTALL.md`](packages/dsh-imouto-codex/INSTALL.md)
for the complete procedure.
OAuth approval belongs to the user. Never paste tokens into chat or commit the
provider credential file.

After login, create a new session with the Yuu preset. Confirm that Yuu uses a
Codex model while worker dispatches still use the `mcp__imouto__*` tools.

## Development commands

Run repository checks from the root:

```powershell
corepack pnpm typecheck
corepack pnpm test
corepack pnpm check
```

`check` regenerates into a temporary directory. It fails when committed
`dist/` files differ from current sources.

Run the dsh bundle checks when dsh templates, tools, or packages change:

```powershell
corepack pnpm tsx scripts/dsh-smoke.ts --static
corepack pnpm tsx scripts/dsh-smoke.ts --live
```

The live smoke needs `DEEPSEEK_API_KEY` in `C:\Users\Stella\imouto-driver\.env`.
It uses temporary dsh and imouto state directories.

Run provider checks from the repository root when provider code changes:

```powershell
corepack pnpm --filter dsh-imouto-codex typecheck
corepack pnpm --filter dsh-imouto-codex test
corepack pnpm --filter dsh-imouto-codex build
```

The GitHub Actions workflow runs dependency installation, root typecheck, root
tests, and generated-output checks on Ubuntu and Windows.

## Update procedure

For canon, host, or blackboard changes:

1. Edit files under `canon/`, `hosts/`, `tools/`, or `scripts/`.
2. Run `corepack pnpm generate` when generated inputs change.
3. Run root typecheck, tests, and `check`.
4. Run the applicable static and live dsh smokes.
5. Preview installation with `corepack pnpm install-outputs`.
6. Apply installation only after review.

For provider changes:

1. Edit `packages/dsh-imouto-codex`.
2. Preserve its Apache-2.0 attribution and source record.
3. Run the package typecheck, tests, and build.
4. Run root checks and the dsh static smoke.
5. Repeat the local absolute-path plugin add command.
6. Restart dsh, check login status, and inspect the effective composition.

Never edit installed skills or `dist/` as the source of a change.

## Repository layout

```text
imouto-dev/
|-- canon/                         maintained workflow sources
|-- hosts/                         host mappings and dsh templates
|-- packages/dsh-imouto-codex/     owned Codex provider
|-- tools/blackboard/              validator and transition implementation
|-- tools/dsh-plugin.ts            dsh blackboard plugin source
|-- scripts/                       generation, installation, and smoke checks
|-- dist/                          committed generated outputs
|-- golden/                        approved compatibility snapshots
|-- .github/workflows/ci.yml       Ubuntu and Windows checks
|-- package.json                   root commands and tool dependencies
`-- pnpm-workspace.yaml            pnpm workspace definition
```

Current source, tests, and executed checks outrank project memory. Use
[`MEMORY.md`](MEMORY.md) for durable project facts and known pitfalls.
