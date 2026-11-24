# songbird

Nothing-style dot-matrix UI with a terminal edge. Static site built with [Zola](https://www.getzola.org/).

## Run it

```bash
zola serve        # http://127.0.0.1:1111, live reload
zola build        # output in ./public
```

## Where things live

| You want to change...          | Edit                                   |
| ------------------------------ | -------------------------------------- |
| colours, fonts, glow, scanlines | `:root` at the top of `static/style.css` |
| site title / tagline / domain   | `config.toml`                          |
| the layout of a page type       | `templates/*.html`                     |
| the post card                   | `templates/partials/card.html`         |
| posts                           | `content/posts/*.md`                   |
| tools cheat sheet               | `content/tools/*.md` (one file per section, `##` = subsection, each code block = one command) |
| search / CRT toggle behaviour   | `static/site.js`                       |
| tag playground physics          | `static/tagfield.js`                   |
| about-page terminal             | `content/about.md` (`## name.txt` = a file you can `cat`), commands in `static/term.js` |
| code colours                    | `.z-*` rules in `static/style.css`     |
| prompt names (guest@tty1)       | `prompt_*` in `config.toml`            |
| link-preview image              | `static/og.png` (site-wide); per post: `[extra] image = "posts/x/card.png"` |
| keyboard shortcuts              | bottom of `static/site.js` (press `?` on the site) |
| CRT strength                    | `--crt-*` in `:root` of `static/style.css` |

New post = new `.md` file in `content/posts/` with front matter (`title`, `date`, `description`, `[taxonomies] tags`).

## Quick experiments (all in `:root`)

- `--accent: #b08cf0; --accent-rgb: 176, 140, 240;` to go back to violet
- `--scanline-opacity: 0;` to turn scanlines off
- `--grid-dot: transparent;` to drop the background dot grid

## Deploying

`.github/workflows/deploy.yml` builds with Zola and publishes to GitHub Pages.
In the repo: Settings → Pages → Source → **GitHub Actions**. Your custom domain
stays configured in the same settings page. Set `base_url` in `config.toml` to
your real domain first.
