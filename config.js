/**
 * Where this console finds the Mission Timeline backend (github.com/kevinlinit/mission-timeline).
 *
 * SERVER_URL  the Node server: staff sign-in and the studio API. Required.
 * API_URL     the published missions (the static API on GitHub Pages, or the server itself),
 *             offered as starting points in the itinerary editor.
 *
 * The deploy workflow writes both from the repository variables SERVER_URL and API_URL
 * (Settings → Secrets and variables → Actions → Variables). Locally: SERVER_URL=… npm start.
 */
export const SERVER_URL = "";
export const API_URL = "https://kevinlinit.github.io/mission-timeline/";
