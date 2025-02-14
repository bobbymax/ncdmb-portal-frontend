import React, { ReactNode } from "react";
import logo from "../../../assets/images/logo.png";

const LetterHeadedPaper = ({
  children,
  tagline,
  code,
  logoPath,
}: {
  children: ReactNode;
  tagline: string;
  code: string;
  logoPath?: string;
}) => {
  return (
    <>
      <div className="paper__header">
        <div className="top__layer">
          <div className="brand__identity">
            <img src={logo} alt="Logo" />
            <div className="brand__name">
              <h1>
                Nigerian Content Development
                <br />
                &amp; Monitoring Board
              </h1>
              <p className="subtxt">{tagline}</p>
            </div>
          </div>
          <div className="claim__identity">
            <img src={logoPath} alt="Claim Logo" />
            <p>{code}</p>
          </div>
        </div>
      </div>
      <div className="paper__content">{children}</div>
    </>
  );
};

export default LetterHeadedPaper;
