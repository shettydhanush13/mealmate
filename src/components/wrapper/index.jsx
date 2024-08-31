import React from "react";
import Header from "../header";
import './styles.scss';

const Wrapper = ({ headertext, children }) => {
  return <section className="wrapper">
    <Header text={headertext} />
    {children}
  </section>
};

export default Wrapper;
