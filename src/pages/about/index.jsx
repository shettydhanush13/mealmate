import React from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import SiteFooter from "../../components/siteFooter";
import "./styles.scss";

const STEPS = [
  { n: 1, t: "Tell us your requirement", d: "Pick buffet or CaterBox, your meal, headcount, date and area — in a couple of taps." },
  { n: 2, t: "We match a vetted vendor", d: "We assign the right partner kitchen for your menu, scale and locality from our network of quality-checked vendors." },
  { n: 3, t: "The vendor prepares your order", d: "Your assigned, FSSAI-licensed vendor freshly prepares and packs the food to the agreed menu and quantity." },
  { n: 4, t: "Delivered & tracked", d: "Your order is delivered on time, and you can track it and reach support every step of the way." },
];

const CRITERIA = [
  { icon: "📜", t: "Valid FSSAI licence", d: "Every partner must hold and maintain a valid FSSAI licence and comply with food-safety law." },
  { icon: "🧼", t: "Hygiene & kitchen checks", d: "We assess kitchen hygiene, storage, and handling practices before onboarding and on an ongoing basis." },
  { icon: "😋", t: "Taste & quality tasting", d: "Menus are sampled and evaluated for taste, freshness, consistency, and presentation." },
  { icon: "📦", t: "Capacity & reliability", d: "Vendors are vetted for their ability to deliver bulk volumes on time, consistently." },
  { icon: "⭐", t: "Ratings & feedback", d: "We continuously monitor customer feedback and ratings, and act on quality issues." },
  { icon: "🤝", t: "Fair, transparent terms", d: "Clear pricing and accountability — the preparing vendor owns food quality and safety." },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <Wrapper headertext="CaterKart" headerLeftType="back" wide>
      <Helmet>
        <title>About Us | CaterKart</title>
        <meta name="description" content="CaterKart is a Bengaluru catering platform connecting customers with vetted, FSSAI-licensed food vendors for buffets, CaterBox meal boxes and bulk orders." />
      </Helmet>

      <div className="aboutShell">
      <div className="about">
        {/* Hero */}
        <header className="about__hero">
          <span className="about__eyebrow">About CaterKart</span>
          <h1 className="about__title">Great food for every occasion, made simple</h1>
          <p className="about__lead">
            CaterKart is a Bengaluru-based catering platform that connects you with trusted, quality-checked
            food vendors for buffets, CaterBox meal boxes, and bulk orders — so you can plan a meal for 30 or
            500 in minutes.
          </p>
        </header>

        {/* Who we are */}
        <section className="about__section">
          <h2 className="about__h">Who we are</h2>
          <p className="about__p">
            We're an aggregator, not a kitchen. CaterKart brings together a curated network of independent,
            FSSAI-licensed catering vendors and matches each order to the right partner for your menu, scale,
            and locality. You get a single, reliable place to order; our vendors do what they do best — cook
            great food. This focus lets us obsess over discovery, matching, transparency, and service quality.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="about__grid2">
          <div className="about__card">
            <div className="about__cardIcon">🎯</div>
            <h3 className="about__cardTitle">Our mission</h3>
            <p className="about__p">
              To make ordering catering effortless and trustworthy — connecting people with the best local
              vendors, at fair prices, with food they can rely on for every gathering.
            </p>
          </div>
          <div className="about__card">
            <div className="about__cardIcon">🔭</div>
            <h3 className="about__cardTitle">Our vision</h3>
            <p className="about__p">
              To become the most trusted catering network in India — where any host, office, or event can get
              hygienic, delicious food at any scale, delivered on time, every time.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="about__section">
          <h2 className="about__h">How CaterKart works</h2>
          <ol className="about__steps">
            {STEPS.map((s) => (
              <li className="about__step" key={s.n}>
                <span className="about__stepNo">{s.n}</span>
                <div>
                  <div className="about__stepTitle">{s.t}</div>
                  <p className="about__p">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Vendor selection */}
        <section className="about__section">
          <h2 className="about__h">How we choose our vendors</h2>
          <p className="about__p about__p--intro">
            Quality starts with the kitchen. Every vendor on CaterKart goes through a vetting process before
            onboarding, and is reviewed on an ongoing basis:
          </p>
          <div className="about__criteria">
            {CRITERIA.map((c) => (
              <div className="about__criterion" key={c.t}>
                <span className="about__criterionIcon" aria-hidden="true">{c.icon}</span>
                <div>
                  <div className="about__criterionTitle">{c.t}</div>
                  <p className="about__p">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about__cta">
          <div>
            <div className="about__ctaTitle">Ready to plan your next meal?</div>
            <p className="about__ctaSub">Buffet or CaterBox, for 30 to 500 guests — get started in minutes.</p>
          </div>
          <button type="button" className="about__ctaBtn" onClick={() => navigate("/")}>
            Start an order <FaArrowRight />
          </button>
        </section>
      </div>

      <SiteFooter />
      </div>
    </Wrapper>
  );
}
