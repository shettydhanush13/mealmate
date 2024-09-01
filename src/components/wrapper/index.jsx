import React from "react";
import Header from "../header";
import './styles.scss';

const Wrapper = ({ headertext, children, footer }) => {
  return <section className={!footer ? "wrapper isFooter" : "wrapper"}>
    <Header text={headertext} />
    {children}
  </section>
};

export default Wrapper;
