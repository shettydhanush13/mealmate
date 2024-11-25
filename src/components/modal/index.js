import React from "react";
import './styles.scss';

const Modal = ({ showModal, title, content, type }) => {
  return showModal ? <section className="ModalContainer">
    <section className="Modal">
        <h4>{title}</h4>
        <p>{content}</p>
    </section>
  </section> : <></>
};

export default Modal;
