# Theodore King IV · Portfolio

A static, no-build portfolio site: plain HTML, CSS and JavaScript. Open `index.html` in a browser or deploy the folder anywhere that serves static files.

## Structure

```text
index.html     Page markup (all copy lives here)
styles.css     Design tokens (light + dark) and layout
main.js        Theme toggle, nav highlight, copy email, booking form, photo reel, lightbox, clock
photos.js      The photography list: edit this to add or reorder photos
assets/        Portrait, project media (Tide + ClearBill recordings), Temple photo, résumé PDF
photos/        Full-size photography (~1800px long edge)
photos/thumbs/ Smaller copies used in the reel and film strip (~760px)
```

## Add a photo

1. Put the full image in `photos/` and a smaller copy in `photos/thumbs/` with the same file name.
2. Add an entry to `window.PHOTOS` in `photos.js` with `src`, `thumb`, `width`, `height`, `caption`, `place` and `alt`.

## Deploy on Vercel

Create a new Vercel project from this repository and set **Root Directory** to `portfolio`. Leave the framework preset on **Other**, with no build command and no output directory. Vercel serves the folder as-is.

## Booking form

"Book a shoot" composes an email to theok1384@gmail.com in the visitor's mail app (a `mailto:` link). To collect bookings without email, point the form at a service such as Formspree or swap the button for a Cal.com link.
