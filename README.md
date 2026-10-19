# Mission Timeline: studio console

The back office for the studio: staff manage customer cases here and send each customer a tailored itinerary that appears in their Mission Timeline app.

It's a static site that talks to the backend, [mission-timeline](https://github.com/kevinlinit/mission-timeline). The other pieces:

| Repository | What it is |
| --- | --- |
| [mission-timeline](https://github.com/kevinlinit/mission-timeline) | The backend: the API, sign-in, cases, the questionnaire intake, published missions |
| **mission-timeline-management** (this one) | The studio console for staff |
| [Light-Boat-OfficialSite](https://github.com/kevinlinit/Light-Boat-OfficialSite) | The official site and the Mission Timeline web app for customers |
| [mission-timeline-IOS](https://github.com/kevinlinit/mission-timeline-IOS) | The iPhone app |
| [travel-survey](https://github.com/kevinlinit/travel-survey) | The questionnaire customers fill in first |

## What staff can do

- **Cases** by stage (New inquiry → Planning → Proposal sent → Confirmed → Travelling → Completed, or Cancelled), filtered by planner and priority, with a search across names, emails, places, tags and requests.
- **A case**: customer and trip details, planner and priority, internal notes, and a history of every change, including what the customer marked in their app.
- **The questionnaire**: for cases that came in through travel-survey, a brief with the flags that change bookings, three route ideas from the studio's catalog, and every answer. **Start itinerary from this** drafts a first itinerary.
- **Itineraries**: an editor with a live preview of what the customer sees. Start from a draft, a template, a published trip, a file or another itinerary; **Share** sends it to the customer's app by their email.
- **Staff** (admins): who can sign in, as admin or planner.

## Layout

```
index.html, studio.js, studio.css   the console
editor.js                           the itinerary editor
config.js                           where the backend is (SERVER_URL, API_URL)
css/timeline.css                    the timeline styles shared with the customer app
core/                               the shared timeline logic, copied from mission-timeline/src/core
scripts/serve.mjs                   local static server
scripts/sync-core.mjs               refresh core/ from the backend
test/                               checks that every page, script and import resolves
```

## Run it locally

You need the backend running with sign-in set up (its README, "Sign in with Google" and "Customer cases").

```sh
# in mission-timeline
GOOGLE_WEB_CLIENT_ID=… SESSION_SECRET=… STUDIO_STAFF=admin:you@example.com npm start

# here
SERVER_URL=http://127.0.0.1:8080 npm start     # http://127.0.0.1:5173
npm test
```

Add `http://127.0.0.1:5173` to the Google web client's **Authorized JavaScript origins**, or the Google button won't appear.

## Deploy

The `pages` workflow tests the site, writes `config.js` and publishes it to GitHub Pages on every push to `main`.

1. **Settings → Pages → Source: GitHub Actions**, then re-run the latest `pages` workflow. Until Pages is on, the deploy job fails with "Ensure GitHub Pages has been enabled". GitHub Pages for a **private** repository needs a paid plan (Pro, Team or Enterprise); on the free plan the Pages settings only offer an upgrade. Then either make the repository public (nothing secret lives here: access is enforced by the server) or use another static host.
2. **Settings → Secrets and variables → Actions → Variables**: `SERVER_URL` = the backend's address. Optionally `API_URL` for published missions (default: the backend's static API on GitHub Pages).
3. In Google Cloud, add the console's address (e.g. `https://kevinlinit.github.io`) to the web client's **Authorized JavaScript origins**.

### Another static host

Cloudflare Pages, Netlify and Vercel all serve private repositories for free. Connect the repository, leave the build command empty and the output folder as the repository root, and put the backend's address in `config.js` (commit it, since those hosts don't run the workflow).

## The shared core

`core/` is a copy of `src/core` from the backend, so the console computes times, timelines and summaries exactly as the API and the apps do. `core/VERSION` says which commit it came from. After the core changes in the backend:

```sh
npm run sync-core                        # from GitHub
npm run sync-core -- ../mission-timeline # from a local checkout
```

The deploy workflow warns when `core/` has fallen behind.
