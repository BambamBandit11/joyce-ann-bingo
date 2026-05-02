# Joyce Ann Bingo

A fun, shareable bingo game for friends. Pure HTML/CSS/JS with no frameworks.

## How It Works

- Every game has a **seed** in the URL (`?seed=12345`).
- Anyone who opens the same link gets the **same board layout**.
- Each player marks squares independently (stored in their browser).
- The app detects bingo across rows, columns, and diagonals.

## Playing

1. Open `index.html` (or the deployed URL).
2. Enter your name when prompted.
3. Click squares as events happen.
4. Hit **Call Bingo!** when you win, or the app will detect it automatically.
5. Share the link with friends so everyone plays on the same board.

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `joyce-ann-bingo`).
2. Push these files to the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/joyce-ann-bingo.git
   git push -u origin main
   ```

3. Go to **Settings > Pages** in your repository.
4. Under **Source**, select **Deploy from a branch**.
5. Choose `main` branch and `/ (root)` folder, then click **Save**.
6. After a minute or two your site will be live at:

   ```
   https://YOUR_USERNAME.github.io/joyce-ann-bingo/
   ```

7. Share the link. To start a specific game, append `?seed=12345` (any number).

## Files

| File         | Purpose                        |
|--------------|--------------------------------|
| `index.html` | Page structure and modals     |
| `style.css`  | All styling (mobile-first)    |
| `app.js`     | Game logic, PRNG, persistence |
| `README.md`  | This file                     |
