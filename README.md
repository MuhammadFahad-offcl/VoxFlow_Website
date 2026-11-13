# VoxFlow website

Marketing site for VoxFlow AI Solutions, an AI automation agency based in Lahore.
It is a static site: plain HTML, one stylesheet and one script. There is no build step, no framework and no backend.

## Structure

```
index.html              Home page (all sections)
404.html                Not-found page, served by Vercel for unknown URLs
assets/
  css/styles.css        All styles. Design tokens are at the top, in :root
  js/main.js            Chat demo, industry tabs, scroll story, calculator, audit link
  fonts/                Geist variable font, self-hosted (SIL Open Font License)
  img/                  Favicon, app icons, share image, tick icons
favicon.ico             Fallback favicon
robots.txt              Allows all crawlers, points to the sitemap
sitemap.xml             One URL: the home page
site.webmanifest        Name, colours and icons for "add to home screen"
vercel.json             Security headers, cache rules, clean URLs
```

## Run it locally

Paths are root-relative (`/assets/...`), so open it through a local server, not by double-clicking the file.

```bash
npx serve .
# or
python3 -m http.server 3000
```

## Deploy on Vercel

1. Go to vercel.com, choose **Add New > Project** and import this repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Deploy. Every push to `main` redeploys.
4. Add the domain under **Project > Settings > Domains**.

The site assumes it lives at `https://voxflow.agency`. If the final address is different, replace that address in:

- `index.html` (canonical link, `og:url`, `og:image`, `twitter:image`, and the JSON-LD block)
- `sitemap.xml`
- `robots.txt`

After the domain is live, add it in Google Search Console and submit `https://voxflow.agency/sitemap.xml`.

## Where the form data goes

Nothing a visitor types is sent to or stored on a server. The site has no backend and no database.

- **Audit booking form.** The business type and the optional note are placed into a WhatsApp message. When the visitor taps the button, WhatsApp opens with that message addressed to +92 304 4782376, and it is delivered only if the visitor presses send. The lead then lives in that WhatsApp chat.
- **Savings calculator.** The sum runs in the visitor's browser. The numbers never leave the page.
- **Chat demo.** A scripted demo in the browser. It is not connected to a live agent.

There is no analytics, tracking or cookie on the site.

To also record leads in a sheet or CRM later, the audit form would need to post to a server endpoint (for example an n8n webhook behind a Vercel function) with validation, rate limiting and spam protection, and `connect-src` in `vercel.json` would need that endpoint added.

## Things to edit

| What | Where |
|---|---|
| WhatsApp number | Search for `923044782376` in `index.html` and `assets/js/main.js` |
| Email, LinkedIn | Contact block near the end of `index.html` |
| Colours, spacing, type sizes | `:root` in `assets/css/styles.css` |
| Industries and what they automate | The `#industries` section in `index.html` |
| Demo conversation text | `COPY` in `assets/js/main.js` |
| FAQ | The `#faq` block in `index.html`, and the matching `FAQPage` entries in the JSON-LD block in the page head |

## Security

`vercel.json` sends these headers on every response:

- **Content-Security-Policy**: scripts, styles, fonts and images load only from this site. No inline scripts or inline styles are used, so the policy needs no `unsafe-inline`.
- **Strict-Transport-Security**: HTTPS only, for two years, including subdomains.
- **X-Content-Type-Options**, **X-Frame-Options**, **Referrer-Policy**, **Permissions-Policy**, **Cross-Origin-Opener-Policy**.

The site loads nothing from third parties. The only outbound links are to WhatsApp, LinkedIn and the founder's portfolio.

If you add a third-party script, font or embed later, the Content-Security-Policy will block it until its origin is added in `vercel.json`.

## Accessibility and browser support

Semantic HTML, a skip link, visible focus styles, keyboard-operable tabs and reduced-motion support. The scroll-in animations and the progress bar use CSS scroll-driven animations; browsers without support show the content without the animation.

## Licences

The Geist typeface is used under the SIL Open Font License 1.1. See `assets/fonts/LICENSE.txt`.
