# Agent instructions

## The digitaltwin.care website

- **Live link:** https://jasper-n1.github.io/digitaltwin-care/
- **Source folder:** `digitaltwin-care/`
- This folder holds the final website. Make all website changes here.

### Deploy

GitHub Pages builds this repo from `main` (folder `/`). A push to `main` is a deploy.

1. Commit your change in `digitaltwin-care/`.
2. Push to `main`.
3. Wait about one minute for the Pages build.
4. Check the build: `gh api repos/Jasper-N1/Jasper-N1.github.io/pages/builds/latest --jq .status` must return `built`.
5. Open the live link and check your change.

### Rules

- Do not make new versioned folders (`digitaltwin-care-10`, `latest-docs/...`). The link above stays the same for every release.
- Do not edit `latest-docs/digitaltwin-care-9/`. It holds only redirect pages to the live link, so old links keep working.
- The other files at the repo root are not part of the digitaltwin.care website.
- The repo uses a sparse checkout. If `digitaltwin-care/` is missing, run `git sparse-checkout add digitaltwin-care`.
