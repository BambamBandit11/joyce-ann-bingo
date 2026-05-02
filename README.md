# Joyce Ann Bingo 🎉

A fun, shareable bingo game you can play with friends during a live event.

## How to Play

1. Open the game link
2. Enter your name
3. Share the link with friends (everyone gets the same board!)
4. Click squares as events happen
5. Get 5 in a row and call BINGO!

## Deploy to GitHub Pages

1. Push this repo to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/joyce-ann-bingo.git
   git branch -M main
   git push -u origin main
   ```

2. Go to **Settings > Pages** in your GitHub repo

3. Under **Source**, select **Deploy from a branch**

4. Select **main** branch and **/ (root)** folder

5. Click **Save**

6. Your game will be live at:
   ```
   https://YOUR_USERNAME.github.io/joyce-ann-bingo/
   ```

## Sharing

Share the URL with a `?seed=` parameter so everyone plays the same board:
```
https://YOUR_USERNAME.github.io/joyce-ann-bingo/?seed=42
```

Or just use the **Copy Link** button in the app.

## Features

- **Shareable boards** via URL seed parameter
- **No backend needed** — runs entirely in the browser
- **Mobile-first** — large, tappable squares
- **Persistent state** — your marks survive page refreshes
- **Bingo detection** — automatic row/column/diagonal checking
- **Celebration mode** — confetti when you hit BINGO!
