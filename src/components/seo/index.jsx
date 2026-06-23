import { Helmet } from "react-helmet";

// Single source of truth for the canonical host. Everything (canonicals,
// og:url, JSON-LD, social images) is built off this so search engines never
// see www / non-www duplicates. Keep in sync with public/index.html,
// sitemap.xml and robots.txt.
export const SITE_URL = "https://www.caterkart.in";

const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION =
  "CaterKart delivers premium catering in Bangalore — build custom menus, live counters and CaterBox meal boxes for birthdays, house parties, corporate events and more.";

/**
 * Centralised per-route SEO/meta. Sets title, description, canonical and the
 * full Open Graph + Twitter card set (so social shares render correctly), plus
 * optional JSON-LD structured data.
 *
 * Note: this app is client-rendered, so these tags apply for JS-executing
 * crawlers (Googlebot). Non-JS crawlers fall back to the static defaults in
 * public/index.html — keep those sensible too.
 *
 * @param {string}  [title]        Page title; brand suffix is appended automatically.
 * @param {string}  [description]  Meta + OG/Twitter description.
 * @param {string}  [path]         Route path beginning with "/" (used for canonical + og:url).
 * @param {string}  [image]        Absolute social-share image URL.
 * @param {string}  [type]         Open Graph type (default "website").
 * @param {string}  [keywords]     Optional comma-separated keywords.
 * @param {boolean} [noindex]      When true, emits noindex,nofollow (private/transactional pages).
 * @param {object|object[]} [jsonLd] Structured-data object(s) injected as application/ld+json.
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  keywords,
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title
    ? `${title} | CaterKart`
    : "CaterKart — Premium Catering in Bangalore";
  const canonical = `${SITE_URL}${path}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="CaterKart" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="CaterKart — premium event catering in Bangalore" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {blocks.map((block, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
