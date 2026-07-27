# Hikaru Nishiyama — GitHub Pages site

## Publish
1. Create a repository named `YOUR_GITHUB_USERNAME.github.io`.
2. Copy the contents of this folder to the repository root.
3. Push to `main`.
4. Open GitHub **Settings → Pages**.
5. Select **Deploy from a branch**, `main`, and `/ (root)`.

## Update publications
Edit `publications.bib`. The page reads the BibTeX file in the browser.

Supported categories:
- `journal`
- `international`
- `domestic`
- `talk`

## Update links
Edit `PROFILE_LINKS` in `assets/site.js`. Current links are Google Scholar, Researchmap, and AIST CPSEC.

## Local preview
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.
