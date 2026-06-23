import React from "react";
import Seo, { SITE_URL } from "../../components/seo";
import Wrapper from "../../components/wrapper";
import SiteFooter from "../../components/siteFooter";
import "./styles.scss";

// Auto-load every image in assets/kitchen at build time. Dropping a new
// photo into that folder adds it to the gallery — no code changes needed.
const ctx = require.context("../../assets/kitchen", false, /\.(jpe?g|png|webp)$/i);

// "food_production_area.jpeg" -> "Food Production Area"
const titleFromFile = (path) =>
  path
    .replace(/^.*\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const GALLERY = ctx
  .keys()
  .map((key) => ({ src: ctx(key), title: titleFromFile(key) }))
  .sort((a, b) => a.title.localeCompare(b.title));

export default function KitchenPage() {
  return (
    <Wrapper headertext="CaterKart" headerLeftType="back" wide>
      <Seo
        title="Our Kitchen"
        description="Take a look inside the FSSAI-licensed partner kitchens behind CaterKart — hygienic food-production, prep and cleaning areas, RO water and more."
        path="/our-kitchen"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "CaterKart",
          url: `${SITE_URL}/`,
          description:
            "A look inside the hygienic, FSSAI-licensed partner kitchens behind CaterKart.",
        }}
      />

      <div className="kitchenShell">
        <div className="kitchen">
          <header className="kitchen__hero">
            <span className="kitchen__eyebrow">Behind the food</span>
            <h1 className="kitchen__title">A look inside our kitchen</h1>
            <p className="kitchen__lead">
              Every CaterKart order is prepared in clean, FSSAI-licensed partner kitchens.
              Here&apos;s a transparent look at the spaces where your food is made.
            </p>
          </header>

          <section className="kitchen__gallery" aria-label="Kitchen photos">
            {GALLERY.map((img) => (
              <figure className="kitchen__card" key={img.title}>
                <div className="kitchen__media">
                  <img src={img.src} alt={img.title} loading="lazy" />
                </div>
                <figcaption className="kitchen__caption">{img.title}</figcaption>
              </figure>
            ))}
          </section>
        </div>

        <SiteFooter />
      </div>
    </Wrapper>
  );
}
