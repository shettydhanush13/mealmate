import React from "react";
import Header from "../header";
import './styles.scss';

const Wrapper = ({ headertext, children, footer = false, wide = false, headerLeftType='back', headerRightType="whatsapp" }) => {
  // Conditionally assign the className based on the footer / wide props
  const wrapperClass = ["wrapper", footer && "isFooter", wide && "wrapper--wide"].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass}>
      <Header text={headertext} headerLeftType={headerLeftType} headerRightType={headerRightType} />
      <main>{children}</main>
    </div>
  );
};

export default Wrapper;
