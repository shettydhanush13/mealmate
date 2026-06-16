import React from "react";
import { Link } from "react-router-dom";
import "./styles.scss";

const WHATSAPP_URL = "https://wa.me/message/NNNDW6NLLPBZK1";
const PHONE = "+917204242111";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <div className="site-footer__logo">CaterKart</div>
          <p>Buffet, CaterBox &amp; bulk catering across Bengaluru — food, live counters &amp; more.</p>
        </div>

        <div className="site-footer__cols">
          <nav className="site-footer__group" aria-label="Quick links">
            <span className="site-footer__heading">Company</span>
            <Link to="/about">About us</Link>
            <Link to="/track-order">Track order</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp us</a>
            <a href={`tel:${PHONE}`}>Call us</a>
          </nav>

          <nav className="site-footer__group" aria-label="Legal">
            <span className="site-footer__heading">Legal</span>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <Link to="/refund-policy">Refunds &amp; Cancellation</Link>
          </nav>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© {year} CaterKart. All rights reserved.</span>
        <span className="site-footer__fssai">Food prepared &amp; supplied by FSSAI-licensed partner vendors.</span>
      </div>
    </footer>
  );
}
