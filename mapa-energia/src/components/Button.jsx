import React from 'react';
import styled from 'styled-components';

const Button = ({text, onClick, icon}) => {
  return (
    <StyledWrapper>
      <button className="cta" onClick={onClick}>
        <span className="hover-underline-animation">{text}</span>
        {icon}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .cta {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Exo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    font-weight: 600;
  }

  .cta span {
    letter-spacing: 1px;
    font-size: 18px;
    padding-right: 15px;
    padding-bottom: 3px;
  }

  .cta svg,
  .cta img {
    transform: translateX(-8px);
    transition: all 0.3s ease;
  }

  .cta:hover svg,
  .cta:hover img {
    transform: translateX(0);
  }

  .cta:active svg,
  .cta:active img {
    transform: scale(0.9);
  }

  .hover-underline-animation {
    position: relative;
    color: white;

  }

  .hover-underline-animation:after {
    content: "";
    position: absolute;
    width: 95%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #fff;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  .cta:hover .hover-underline-animation:after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }`;

export default Button;
