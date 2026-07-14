# Upload this project to GitHub

## Easiest method: GitHub website

1. Sign in at <https://github.com>.
2. Click **New repository**.
3. Use a public repository name such as `spider-verse-developer`.
4. Do **not** add another README, `.gitignore` or license; they already exist here.
5. Create the repository.
6. On the empty repository page, click **uploading an existing file**.
7. Extract the ZIP and drag **the contents inside the folder**, not the outer folder itself.
8. Commit the files to the `main` branch.
9. Open **Settings → Pages**.
10. Under **Build and deployment → Source**, select **GitHub Actions**.
11. Open the **Actions** tab and wait for “Deploy to GitHub Pages” to finish.

Your public URL will normally be:

```text
https://YOUR-USERNAME.github.io/spider-verse-developer/
```

## Alternative: terminal commands

Create an empty repository on GitHub first, then run from this project folder:

```bash
git init
git add .
git commit -m "Initial Spider-Verse landing"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/spider-verse-developer.git
git push -u origin main
```

Then select **GitHub Actions** in **Settings → Pages**.

## Before applying for the job

Replace these three remaining placeholders in `index.html`:

- `[GITHUB URL]`
- `[LINKEDIN URL]`
- `[EMAIL ADDRESS]`

Also replace `public/screenshot-placeholder.svg` with a real screenshot or GIF and update the image path in `README.md`.
