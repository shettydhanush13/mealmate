import React from "react";
import Header from "../header";
import whatsapp from '../../assets/whatsapp.svg'
import './styles.scss';

const Wrapper = ({ headertext, children, footer }) => {
  return <section className={footer ? "wrapper isFooter" : "wrapper"}>
    <Header text={headertext} />
    {children}
    <div className="chatBot">
      <img onClick={() => window.open('https://wa.me/message/NNNDW6NLLPBZK1', '_blank')} src={whatsapp} alt="" />
      <p>CHAT WITH US</p>
    </div>
  </section>
};

export default Wrapper;
