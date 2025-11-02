import React from "react";
import "../styles/button.css";
import { useNavigate } from "react-router-dom";

const Button = ({
  children,
  to,
  href,
  target, // e.g. "_blank"
  onClick,
  type = "button",
  className = "",
  ariaLabel,
  disabled = false,
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (disabled) return;

    // Llamamos al onClick si hay uno
    if (onClick) onClick(e);

    // Si el handler previno el default, no navegamos
    if (e?.defaultPrevented) return;

    if (to) {
      navigate(to);
    } else if (href) {
      // navegación externa: si target === '_blank' abrimos en nueva pestaña
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <button
      type={type}
      className={("btn " + className).trim()}
      onClick={handleClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
