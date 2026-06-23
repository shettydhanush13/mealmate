import React from "react";
import Seo from "../../components/seo";
import Wrapper from "../../components/wrapper";
import "./styles.scss";

const SUPPORT_EMAIL = "support@caterkart.in";
const SUPPORT_PHONE = "+91 72042 42111";
const UPDATED = "June 2026";

const DOCS = {
  privacy: {
    title: "Privacy Policy",
    numbered: true,
    intro:
      "This Privacy Policy explains how CaterKart (\"we\", \"us\") collects, uses, shares, and protects your information when you use our website and application (the \"Platform\"). CaterKart is a technology platform and aggregator that connects you with independent, third-party food vendors (\"Vendors\"); we do not cook or sell food ourselves. To fulfil an order, we necessarily share your order and contact details with the Vendor and delivery partner assigned to it. By using the Platform, you consent to the practices described here.",
    sections: [
      {
        h: "Information we collect",
        points: [
          "Contact & delivery details you provide when ordering: your name, mobile number, delivery address, locality/area, and pincode.",
          "Order information: the items, combos, meal type, headcount/guests, event type, date/time, dietary preferences (e.g. veg/non-veg), and any notes you add.",
          "Verification data: a one-time password (OTP) is sent to your mobile number to verify it when placing or tracking an order.",
          "Technical data: basic device and usage information (such as browser type and pages visited) needed to operate and secure the Platform. We store your in-progress cart and preferences locally on your device (browser local storage) to improve your experience.",
          "We do NOT collect or store your payment card details on the Platform; payments, where applicable, are handled by third-party payment processors. We do not knowingly collect sensitive personal data beyond what is needed to fulfil an order.",
        ],
      },
      {
        h: "How we use your information",
        points: [
          "To place, process, assign to a Vendor, and fulfil your order, and to arrange delivery.",
          "To verify your identity/mobile number via OTP and to let you track your orders.",
          "To provide customer support, send order-related updates, and respond to your requests.",
          "To operate, secure, troubleshoot, and improve the Platform and our service quality.",
          "To comply with legal, tax, and accounting obligations.",
        ],
      },
      {
        h: "How we share your information (aggregator model)",
        points: [
          "With the assigned Vendor: to prepare and supply your order, we share your name, contact number, delivery address, and order details. The Vendor processes this information to fulfil your order.",
          "With delivery partners: where a third party delivers your order, we share the details needed for delivery (name, address, contact number).",
          "With payment processors: to complete a transaction, the necessary details are shared with the payment gateway.",
          "With service providers: trusted vendors who provide hosting, SMS/OTP, and similar services on our behalf, under confidentiality obligations.",
          "For legal reasons: where required by law, regulation, or valid legal process, or to protect rights, safety, and prevent fraud.",
          "We do NOT sell your personal information, and we do not share it for third-party advertising.",
        ],
      },
      {
        h: "Cookies & local storage",
        p: "We use your browser's local storage to remember your in-progress order and preferences, and minimal cookies/storage strictly necessary to run the Platform. We do not use third-party advertising or cross-site tracking cookies. You can clear this data anytime through your browser settings.",
      },
      {
        h: "Data retention",
        p: "We retain your personal information for as long as needed to provide the service and for a reasonable period thereafter to meet legal, tax, accounting, dispute-resolution, and record-keeping requirements, after which it is deleted or anonymised.",
      },
      {
        h: "Data security",
        p: "We use reasonable technical and organisational measures to protect your information against unauthorised access, loss, or misuse. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      },
      {
        h: "Your rights & choices",
        points: [
          `You may request access to, correction of, or deletion of your personal data by writing to ${SUPPORT_EMAIL}.`,
          "You may withdraw consent or object to certain processing, subject to legal and contractual limits (note that we may be unable to fulfil orders without the necessary details).",
          "You can clear locally stored cart/preference data via your browser at any time.",
          "We will respond to verified requests within the timelines required by applicable law, including the Digital Personal Data Protection Act, 2023.",
        ],
      },
      {
        h: "Third-party links & vendors",
        p: "The Platform may link to or rely on third parties (such as Vendors, payment, and delivery partners). Their handling of your information is governed by their own privacy practices, and we are not responsible for those practices. We encourage you to review them where relevant.",
      },
      {
        h: "Children",
        p: "The Platform is intended for users aged 18 and above. We do not knowingly collect personal data from children. If you believe a child has provided us information, please contact us so we can delete it.",
      },
      {
        h: "Changes to this policy",
        p: "We may update this Privacy Policy from time to time. Material changes will be reflected by updating the \"Last updated\" date above. Your continued use of the Platform after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    numbered: true,
    intro:
      "These Terms & Conditions (\"Terms\") govern your access to and use of the CaterKart website, application, and services (the \"Platform\"). By accessing the Platform or placing an order, you (\"Customer\", \"you\") agree to these Terms. CaterKart operates solely as a technology platform and aggregator that connects Customers with independent, third-party food vendors and caterers (\"Vendors\"). CaterKart does not cook, prepare, manufacture, or sell any food itself. If you do not agree to these Terms, please do not use the Platform.",
    sections: [
      {
        h: "Nature of service — CaterKart is an aggregator, not a food provider",
        points: [
          "CaterKart is a technology platform and online marketplace that connects Customers with independent, third-party Vendors. CaterKart is not a restaurant, cloud kitchen, caterer, food business operator, manufacturer, or seller of food.",
          "CaterKart does not own, operate, manage, supervise, or control any kitchen, and does not cook, prepare, process, package, label, store, handle, or sell any food item. All food is prepared and supplied exclusively by the assigned Vendor.",
          "Based on your requirement (such as meal type, headcount, service area, budget, and preferences), CaterKart assigns or facilitates the selection of a suitable Vendor to fulfil your order. The Vendor is the actual and sole seller and preparer of the food.",
          "The contract for the sale and supply of food is entered into directly between you and the assigned Vendor. CaterKart is not a party to that contract and acts only as a facilitator and, where applicable, a payment collection agent on the Vendor's behalf.",
        ],
      },
      {
        h: "Intermediary status",
        p: "CaterKart functions as an \"intermediary\" within the meaning of the Information Technology Act, 2000 and the rules made thereunder, and as a \"marketplace e-commerce entity\" under the Consumer Protection (E-Commerce) Rules, 2020. CaterKart merely provides the technology that enables a transaction between a Customer and a Vendor and is not responsible for, and does not warrant or guarantee, the acts, omissions, conduct, representations, or offerings of any Vendor.",
      },
      {
        h: "Vendor responsibility for food quality, safety & consequences",
        points: [
          "The assigned Vendor is solely, fully, and exclusively responsible for the sourcing, preparation, cooking, hygiene, quality, taste, freshness, temperature, quantity, packaging, labelling, and safety of the food supplied against your order.",
          "Each Vendor is independently required to hold and maintain a valid FSSAI licence/registration and to comply with the Food Safety and Standards Act, 2006, the rules and regulations thereunder, and all applicable food-safety, health, hygiene, labour, and licensing laws.",
          "The Vendor is solely responsible for the accuracy of all food-related information, including ingredients, allergens, dietary classification (veg/non-veg/contains egg, etc.), portion sizes, and preparation methods.",
          "Any liability, claim, demand, loss, injury, illness, food poisoning, allergic reaction, contamination, spoilage, foreign object, or any other harm or consequence arising out of or relating to the food — including its sourcing, preparation, quality, condition, packaging, delivery temperature, or consumption — rests solely with the Vendor and not with CaterKart.",
          "You acknowledge and agree that CaterKart bears no responsibility or liability whatsoever for the food itself, and that any complaint regarding food quality or safety is a matter between you and the Vendor, which CaterKart will reasonably facilitate but is not obligated to resolve as a principal.",
        ],
      },
      {
        h: "Limitation of CaterKart's liability",
        points: [
          "The Platform and CaterKart's services are provided on an \"as is\" and \"as available\" basis. CaterKart makes no warranty, express or implied, regarding the food supplied by Vendors, including any warranty of merchantability, fitness for a particular purpose, quality, or safety.",
          "To the maximum extent permitted by applicable law, CaterKart shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages arising out of or in connection with the food, its quality, safety, preparation, delivery, or consumption, or the acts or omissions of any Vendor.",
          "CaterKart's total aggregate liability for any matter genuinely and directly attributable to CaterKart's own platform services (for example, a payment-processing error) shall not exceed the platform/convenience fee component actually retained by CaterKart for the relevant order, or INR 1,000, whichever is lower.",
          "Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under applicable law, including the Consumer Protection Act, 2019.",
        ],
      },
      {
        h: "Vendor indemnity",
        p: "Each Vendor, by accepting orders through the Platform, agrees to indemnify, defend, and hold harmless CaterKart, its directors, officers, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to the food supplied by such Vendor, any breach of food-safety or licensing laws, or any act or omission of the Vendor.",
      },
      {
        h: "Orders & vendor assignment",
        points: [
          "All orders are subject to availability, Vendor acceptance, and confirmation. Menu items, prices, portions, and availability may change without notice.",
          "Bulk, corporate, and event orders may require advance notice, a minimum order value, and an advance payment as communicated at the time of booking.",
          "CaterKart may, at its discretion and to fulfil your requirement, assign, re-assign, or substitute a Vendor of comparable standard, including where the originally selected Vendor is unavailable.",
        ],
      },
      {
        h: "Pricing, taxes & payment",
        p: "All prices are in Indian Rupees (INR) and, unless stated otherwise, are shown inclusive or exclusive of applicable taxes at checkout. A platform/convenience and/or delivery fee may apply and will be displayed before you confirm. Where CaterKart collects payment, it does so as a limited payment-collection agent on behalf of the Vendor; the underlying sale consideration belongs to the Vendor.",
      },
      {
        h: "Delivery",
        p: "Delivery may be carried out by the Vendor or by a third-party delivery partner. We aim to deliver within the agreed time window; however, timelines are estimates and may be affected by traffic, weather, demand, or other factors beyond reasonable control. Risk in the food passes on delivery; please inspect items on receipt.",
      },
      {
        h: "Cancellations & refunds",
        p: "Cancellations and refunds are governed by our Refund & Cancellation Policy. Where a refund is due on account of a food-quality issue, CaterKart will facilitate the refund process, but the underlying responsibility and cost for such issue rests with the Vendor.",
      },
      {
        h: "Allergens, dietary requirements & safe consumption",
        p: "Food may contain or come into contact with allergens. You are responsible for informing us of allergies or dietary restrictions and for relying on the Vendor's disclosures. Perishable food should be consumed promptly after delivery and stored appropriately; CaterKart and the Vendor are not responsible for deterioration due to improper handling after delivery.",
      },
      {
        h: "Customer obligations",
        points: [
          "Provide accurate and complete order, contact, and delivery information.",
          "Use the Platform only for lawful purposes and not to place fraudulent, abusive, or speculative orders.",
          "Treat Vendors and delivery personnel with respect and provide safe access for delivery.",
        ],
      },
      {
        h: "Intellectual property",
        p: "The Platform, including its design, software, trademarks, logos, and content (excluding Vendor-supplied content), is owned by or licensed to CaterKart and is protected by applicable laws. You may not copy, modify, or exploit it without prior written permission.",
      },
      {
        h: "Disclaimers",
        p: "CaterKart does not warrant that the Platform will be uninterrupted, error-free, or secure, or that any Vendor, food item, or outcome will meet your expectations. Your use of the Platform and any reliance on Vendor offerings is at your own risk, subject to the protections available to you under applicable consumer law.",
      },
      {
        h: "Grievance redressal",
        p: "In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000, complaints may be addressed to our Grievance Officer (details below). We will acknowledge a complaint within 48 hours and endeavour to resolve it within one month of receipt. For food-quality complaints, we will coordinate with the relevant Vendor, who remains responsible for resolution.",
      },
      {
        h: "Governing law & jurisdiction",
        p: "These Terms are governed by the laws of India. Subject to applicable consumer-protection law, the courts at Bengaluru, Karnataka shall have jurisdiction over disputes arising out of or relating to these Terms or the Platform.",
      },
      {
        h: "Changes to these Terms",
        p: "CaterKart may update these Terms from time to time. Material changes will be reflected by updating the \"Last updated\" date above. Your continued use of the Platform after such changes constitutes acceptance of the revised Terms.",
      },
    ],
  },
  refund: {
    title: "Refund & Cancellation Policy",
    intro:
      "We want you to be happy with every order. This policy covers cancellations and refunds.",
    sections: [
      { h: "Cancellations", p: "Standard orders can be cancelled before they are sent to the kitchen for preparation. Bulk and event orders can be cancelled up to the notice period agreed at the time of booking." },
      { h: "Refunds", p: "Approved refunds are processed to the original payment method within 5–7 business days. Advance amounts for cancelled event orders are refundable as per the agreed notice period." },
      { h: "Quality issues", p: `If something is wrong with your order, contact us within 2 hours of delivery with photos at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}, and we'll make it right with a replacement or refund.` },
      { h: "Non-refundable", p: "Custom-prepared bulk orders already dispatched and add-ons consumed are not refundable except in case of a quality issue." },
    ],
  },
};

const DOC_PATHS = {
  privacy: "/privacy-policy",
  terms: "/terms",
  refund: "/refund-policy",
};

export default function LegalPage({ doc = "privacy" }) {
  const data = DOCS[doc] || DOCS.privacy;

  return (
    <Wrapper headertext="CaterKart" headerLeftType="back" footer>
      <Seo
        title={data.title}
        description={data.intro}
        path={DOC_PATHS[doc] || DOC_PATHS.privacy}
      />

      <article className="legal">
        <h1 className="legal__title">{data.title}</h1>
        <p className="legal__updated">Last updated: {UPDATED}</p>
        <p className="legal__intro">{data.intro}</p>

        {data.sections.map((s, i) => (
          <section className="legal__section" key={s.h}>
            <h2 className="legal__h">{data.numbered ? `${i + 1}. ` : ""}{s.h}</h2>
            {s.p && <p className="legal__p">{s.p}</p>}
            {Array.isArray(s.points) && (
              <ul className="legal__list">
                {s.points.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            )}
          </section>
        ))}

        <section className="legal__section">
          <h2 className="legal__h">{data.numbered ? `${data.sections.length + 1}. ` : ""}Contact us</h2>
          <p className="legal__p">
            Questions? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or call{" "}
            <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}>{SUPPORT_PHONE}</a>.
          </p>
          {doc === "terms" && (
            <p className="legal__p" style={{ marginTop: 8 }}>
              <strong>Grievance Officer:</strong> Grievance Redressal Team, CaterKart<br />
              Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> · Phone:{" "}
              <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}>{SUPPORT_PHONE}</a><br />
              Address: Bengaluru, Karnataka, India
            </p>
          )}
        </section>
      </article>
    </Wrapper>
  );
}
