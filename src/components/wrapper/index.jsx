import React from "react";
import Header from "../header";
import './styles.scss';

const Wrapper = ({ headertext, children, footer = false }) => {
  // Conditionally assign the className based on the footer prop
  const wrapperClass = footer ? "wrapper isFooter" : "wrapper";

  return (
    <section className={wrapperClass}>
      <Header text={headertext} />
      {children}
    </section>
  );
};

export default Wrapper;
