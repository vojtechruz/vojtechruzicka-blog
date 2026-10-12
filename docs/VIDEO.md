# Videos

Short silent screen recordings, the successors of the animated GIFs the posts used to have, embedded with the
`{% video %}` shortcode (`config/shortcodes/video.js`). Guarded by `tests/shortcodes.test.js` (markup, and that every
video a post embeds has both files) and `tests/video-autoplay-script.test.js` (the autoplay script).

## Adding a video

1. Convert the recording into **two files with the same base name**, a WebM (VP9) and an MP4 (H.264), under
   `src/static/videos/<post-slug>/` — they are copied to `/videos/<post-slug>/` on the site.
2. Embed it by the base name, without an extension:

   ```njk
   {% video "/videos/<post-slug>/<name>", "What the clip shows" %}
   ```

Width and height are read from the file at build time with `ffprobe` (`ffprobe-static`, nothing to install), so the
player reserves its space and the page does not shift. A missing file only logs a warning; the video then renders
without dimensions.

### Converting with ffmpeg

`_tools/convert-video.ps1` does this for every GIF under `src/posts` (it re-encodes only changed ones; set the ffmpeg
path at its top). For a single file, the same settings by hand:

```bash
# Even dimensions (yuv420p requires them), at most 900 px wide
VF="crop=trunc(iw/2)*2:trunc(ih/2)*2,scale='min(900,iw)':-2:flags=lanczos"

# MP4 / H.264 — plays everywhere; +faststart moves the index to the front so playback starts before the download ends
ffmpeg -i in.gif -vf "$VF,format=yuv420p" -c:v libx264 -crf 23 -preset veryslow -pix_fmt yuv420p \
  -movflags +faststart -an name.mp4

# WebM / VP9 — smaller, listed first so browsers that support it pick it
ffmpeg -i in.gif -vf "$VF" -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -tile-columns 2 -an name.webm
```

`-an` drops audio: the clips are silent, and an audio track would only add bytes. A screen recording (`.mov`, `.mkv`)
works as input the same way as a GIF.

The script also writes `<name>-poster.jpg`, but no embed passes a poster: with `preload="metadata"` the browser shows
the first frame on its own.

## Options

```njk
{% video src, title = "Video", poster = "", showCaption = false, animated = true %}
```

| Argument      | Meaning                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src`         | Base path (`/videos/x/name` → `name.webm` + `name.mp4`), or one file; `.mp4`/`.webm` adds the other format       |
| `title`       | Accessible name of the player (`title` attribute) and the analytics label. Describe what the clip shows          |
| `poster`      | Optional poster image URL                                                                                        |
| `showCaption` | `true` shows the title as a visible `<figcaption>` and names the player by it (`aria-labelledby`) instead        |
| `animated`    | `true` (default): behaves like an animated GIF, see below. `false` for a real film (sound, no autoplay, no loop) |

Leaving `title` at its default makes every clip on the page an indistinguishable "Video" for screen readers: give each
one a short description.

## GIF behaviour (`animated`)

An animated video is rendered `muted loop data-autoplay`, with the normal controls. `src/scripts/video-autoplay.js`,
loaded only by posts that contain one (`post.njk`), then:

- plays a clip while at least half of it is in view and pauses it once scrolled away, so a page with seven clips only
  ever runs the visible ones;
- leaves every clip as a plain player when the reader prefers reduced motion (and stops running ones when that setting
  is switched on);
- keeps a clip the reader paused paused, until they play it again;
- tolerates a refused autoplay (data saver, browser settings): the controls remain.

Without JavaScript, the clips are ordinary players. `muted` is what lets browsers autoplay at all; the controls are what
keeps a loop longer than five seconds pausable (WCAG 2.2.2).

The autoplay marks its own plays with `data-autoplaying` for the duration of the `play` event, and `analytics.js` skips
those: the `Video Playback` event counts only plays a reader started.

## Elsewhere

- **Fallback link:** browsers without `<video>` support (and feed readers that drop the element but keep its content)
  get a "download the video" link to the MP4, the one format every OS can open on its own.
- **Print:** the figure carries `data-print-url` (the MP4); print styles replace the player with that URL. See
  docs/PRINT.md.
- **Caching and CSP:** `/videos/*` is cached for a day (`src/static/_headers`); the CSP allows `media-src 'self'`.
- **Feeds:** `feedContent` passes the `<video>` element through unchanged; a reader that drops it is left with the
  fallback link above.
