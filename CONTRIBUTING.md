# Contributing

Thanks for your interest in improving **shotlist-forge**. Contributions of all
sizes are welcome — especially new shot patterns.

## Getting started

```bash
git clone https://github.com/thoxakihiko/shotlist-forge.git
cd shotlist-forge
npm install     # pulls in seedance-prompt-forge
npm test        # runs the smoke tests
node src/cli.js --subject "a test" --pattern ad --shots 4
```

Plain Node.js (18+) ES modules. The only runtime dependency is
[`seedance-prompt-forge`](https://github.com/thoxakihiko/seedance-prompt-forge),
which does the per-shot prompt assembly.

## Adding a pattern

Patterns live in [`src/patterns.js`](src/patterns.js). Each is an ordered list of
shot sizes plus a matching list of camera movements:

```js
myPattern: {
  label: "My pattern — what it's for",
  shots:     ["wide", "medium", "close-up"],
  movements: ["slow-push", "static", "slow-pull"]
}
```

Shot and movement keys are the ones from `seedance-prompt-forge` (run
`npx seedance-prompt-forge options` to see them all). Sequences cycle if the user
asks for more shots than the pattern defines.

## Pull requests

1. Fork and create a branch.
2. Make your change and run `npm test` — all checks must pass.
3. Add a `CHANGELOG.md` entry.
4. Open a PR with a clear description of what and why.

Issues and suggestions are welcome too.
