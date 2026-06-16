import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets the window scroll position to the top on every route change. */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
