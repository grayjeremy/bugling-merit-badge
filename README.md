# Bugling Merit Badge Practice

A free, static web app that helps Scouts learn, practice, and track the 15
bugle calls associated with the Scouting America Bugling Merit Badge.

This is an unofficial, fan-made study tool. It is not published by, endorsed
by, or affiliated with Scouting America.

## What it does

* Lists all 15 required bugle calls with a purpose statement and a longer
  "when it is used" explanation.
* Lets a Scout mark each call as "Can play this call" and "Can explain its
  purpose." A call is only "Completed" when both boxes are checked.
* Shows a live progress bar and completion count/percentage.
* Includes a "Practice This Call" button on every card that opens a modal
  window with the sheet music image and the audio recording together, so a
  Scout can look at the music while listening (once you add your own audio
  and image files — see below).
* Includes a one-click "Print Sign-Off Sheet" link in the header that
  produces a clean, one-page, black-and-white summary for the counselor to
  sign — no special "mode" required. Counselor initials are filled in by
  hand on the printed sheet.
* Saves everything in the browser using `localStorage` — no account,
  server, or database required.

## Project structure

```text
bugling-merit-badge/
├── index.html      Main page markup
├── styles.css       All styling (screen + print)
├── app.js           All behavior and the bugle call data
├── audio/           Put your .mp3 recordings here
├── images/          Put your sheet music images here (see below)
└── README.md        This file
```

## How to open it locally

No build step, no npm install, no server required.

1. Download or clone this folder.
2. Double-click `index.html`, or right-click it and choose "Open with" your
   browser.

That's it — the whole app runs from static files.

> Note: some browsers restrict `<audio>` playback of local files opened via
> `file://`. If audio does not play locally, try serving the folder with a
> simple local web server (for example `npx serve` or Python's
> `python -m http.server`) and open it via `http://localhost`.

## How to add audio files

1. Record or obtain bugle call audio you have the right to use (see
   Licensing below).
2. Save each recording as an MP3 (preferred) or WAV file, using the exact
   file name expected by the page. The required base names are listed in
   `audio/README.txt`, for example:
   * `first-call.mp3` (or `first-call.wav`)
   * `reveille.mp3` (or `reveille.wav`)
   * `taps.mp3` (or `taps.wav`)
   * ...and so on for all 15 calls.
3. Copy the files into the `audio/` folder. If both an MP3 and a WAV exist
   for the same call, the MP3 is used automatically.
4. Reload the page — clicking "Practice This Call" on each card will start
   playing that recording in the practice modal automatically. Calls
   without a matching file will keep showing "Audio recording not yet
   available." instead of a broken player.

Only one recording plays at a time; opening a new call's practice modal
automatically pauses any recording that was still playing.

## How to add sheet music images

1. Obtain or create sheet music images you have the right to use (see
   Licensing below).
2. Save each image as a PNG using the same base name as the call, matching
   the audio file names, for example:
   * `first-call.png`
   * `reveille.png`
   * `taps.png`
   * ...and so on for all 15 calls.
3. Copy the files into the `images/` folder.
4. Reload the page — clicking "Practice This Call" on each card will show
   that image inside the practice modal automatically. Calls without a
   matching image will keep showing "Sheet music not yet available."
   instead of a broken image.
5. Re-generate `images/sheet-music-data.js` (requires Python + Pillow:
   `pip install pillow`):
   ```
   python tools/generate-sheet-music-data.py
   ```
   This file is a checked-in, pre-baked copy of every sheet music image
   (as a true-color PNG data URI) that the PDF-download fallback uses —
   see "Printing a sheet music practice packet" below for why it's needed.
   Forgetting this step just means a newly added image won't show up in
   downloaded PDFs (it still displays fine on-screen) until you run it.

## How to publish with GitHub Pages

1. Create a new GitHub repository (or use an existing one) and push the
   contents of this folder to it.
2. In the repository, go to **Settings → Pages**.
3. Under "Build and deployment," choose **Deploy from a branch**.
4. Pick the branch (e.g. `main`) and the root folder (`/`), then save.
5. GitHub Pages will publish the site at a URL like
   `https://<your-username>.github.io/<repository-name>/`.

No build process is required — GitHub Pages serves the static HTML, CSS,
and JavaScript files directly.

## How browser-based saving works

The app uses your browser's `localStorage` to remember:

* Scout name, unit number, counselor name, and date started
* The "Can play" and "Can explain" checkboxes for every call

This data is stored only in the specific browser and device you used to
enter it. **Progress does not sync between devices or browsers**, and
clearing your browser's site data/cache will erase it. Use the "Reset All
Progress" button if you want to intentionally start over (it asks for
confirmation first, since it cannot be undone).

## Printing or saving the sign-off sheet as a PDF

Click the **"Print Sign-Off Sheet"** link in the header at any time — no
special mode needs to be turned on first. It opens your browser's normal
print dialog with a clean, black-and-white, one-page sheet listing Scout
information and every bugle call's played/explained status, with a blank
column for the counselor to write in their initials by hand.

* To get a PDF file, choose **"Save as PDF"** (or "Microsoft Print to PDF")
  as the destination/printer in that dialog instead of a physical printer.
* To get a paper copy, just choose your printer as usual.
* **iOS/iPadOS exception:** Apple only allows Safari itself to open the
  print dialog — Edge, Chrome, Firefox, and other browsers on iOS/iPadOS
  cannot, even though they display the same web page. The app detects this
  automatically and swaps the button to **"Download Sign-Off Sheet
  (PDF)"**, which generates and downloads a PDF directly (using the
  [jsPDF](https://github.com/parallax/jsPDF) library, loaded from a CDN
  only when needed) instead of opening a print dialog.

## Printing a sheet music practice packet

Click the **"Print Sheet Music (Currently Shown Calls)"** button near the
filter and search controls to print (or save as a PDF) a packet containing
the sheet music image for every call that currently matches your active
filter and search — so a Scout can print just the calls they're working on,
or clear the filter/search first to print all 15.

* Each call in the packet shows its name and purpose above the sheet music
  image, using the same PNG image logic as the
  on-screen cards and the practice modal.
* If a call doesn't have a sheet music image yet, the packet prints a
  friendly "Sheet music not yet available for this call" message instead of
  a broken image.
* If no calls match the current filter/search, the button shows an alert
  instead of printing an empty page.
* **iOS/iPadOS exception:** same as the sign-off sheet above — on
  non-Safari iOS/iPadOS browsers this button automatically downloads a
  multi-page PDF packet (multiple calls flow onto the same page where they
  fit) instead of opening a print dialog.
* The downloaded PDF gets its images from `images/sheet-music-data.js`
  (see "How to add sheet music images" above) rather than loading the PNG
  files directly. This is required for two reasons: (1) the source PNGs
  are saved in a palette/indexed-color format that browsers' PDF-building
  libraries can render as solid black blocks, and (2) when this site is
  opened directly from disk (`file://` instead of a web server), browsers
  block the page from reading an image's pixels back out at all. Baking
  each image into a plain `.js` file sidesteps both issues.

## Licensing for audio recordings

Do not embed, download, or distribute copyrighted bugle call recordings
without permission. Before adding a recording to the `audio/` folder, make
sure it is one of the following:

* **Public domain** — many official military bugle call recordings are in
  the public domain.
* **Original** — recorded by you, your unit, or someone who has given you
  permission to use and redistribute it.
* **Properly licensed** — you have documented permission or a license that
  allows redistribution on a public website.

If you are not sure whether a recording is safe to use, it's best to record
your own or leave that call's audio file out — the site handles missing
audio gracefully.

## Credits

The footer includes a "Made with GitHub Copilot" badge using the "Copilot"
icon from GitHub's open-source [Primer Octicons](https://github.com/primer/octicons)
set, which is available under the MIT License. GitHub's Copilot brand
artwork and trademarks are not reproduced here; see
[GitHub's brand guidelines](https://brand.github.com/brand-identity/copilot)
for details on GitHub's official Copilot branding.

The same rules apply to sheet music images added to the `images/` folder:
only use public domain, original, or properly licensed sheet music.

## How to edit the bugle call descriptions

All 15 bugle calls are defined in a single array near the top of `app.js`,
called `BUGLE_CALLS`. Each entry looks like this:

```js
{
  id: "first-call",       // Used for the audio file name and storage key
  number: 1,               // Display order / call number
  name: "First Call",      // Display name
  purpose: "Warns that an assembly, formation, or scheduled activity will begin soon.",
  usage: "Played a few minutes before Assembly to give everyone a heads-up..."
}
```

To change wording, edit the `purpose` or `usage` text. To add or reorder
calls, add/edit entries in this array — the page automatically regenerates
all cards, the progress bar, and the print sheet from this one array.
Avoid changing an existing call's `id` if Scouts already have saved
progress, since progress is keyed by `id`.

## Accessibility

The page uses semantic HTML, labeled form fields, visible keyboard focus
states, ARIA attributes where useful, and respects the
`prefers-reduced-motion` setting. Status is always shown as text (not color
alone), for example "Completed," "In Progress," or "Not Started."
