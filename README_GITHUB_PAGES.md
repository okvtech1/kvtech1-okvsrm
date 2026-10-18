# GitHub Pages front end

Upload the whole folder to a PUBLIC GitHub repository, then Settings > Pages > Deploy from branch (main, root).
Your site: https://YOUR-USERNAME.github.io/YOUR-REPO/

- index.html: the public landing page. Set GITHUB_REPO near the top (for example 'yourname/yourrepo') so the download buttons point to your installer release.
- app/: the pricing, activation, admin, payment and legal pages, rendered from the Apps Script templates. They talk to Code.gs.
  - On the first visit to any app/ page, paste your Apps Script web app address (it ends in /exec) into the bar at the top and press Connect. It is saved in that browser only.
  - Admin login and the activation and install requests go to Code.gs through the rpc path.
- demo/: the live demo (self-contained, no internet needed once loaded).

Limits: the prices and wording on app/ pages come from the build defaults (120,000 naira). Changing a price in Code.gs does not change the static pages until the pages are rebuilt (build_static.js in 02_Apps_Script_Backend).
