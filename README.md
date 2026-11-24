# phosphor

Nothing-style dot-matrix UI on a white-phosphor CRT. Static site built with [Zola](https://www.getzola.org/).

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

New post = new `.md` file in `content/posts/` with front matter (`title`, `date`, `description`, `[taxonomies] tags`).

## Quick experiments (all in `:root`)

- `--accent: #d71921;` for Nothing red instead of violet
- `--scanline-opacity: 0;` to turn scanlines off
- `--vignette-strength: 0.3;` for a flatter screen

## Deploying

`.github/workflows/deploy.yml` builds with Zola and publishes to GitHub Pages.
In the repo: Settings → Pages → Source → **GitHub Actions**. Your custom domain
stays configured in the same settings page. Set `base_url` in `config.toml` to
your real domain first.
