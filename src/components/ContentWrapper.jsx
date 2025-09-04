import React from "react";

const ContentWrapper = ({
  children,
  className = "",
  maxWidth = "container-responsive",
}) => {
  return (
    <div className={`${maxWidth} content-wrapper ${className}`}>{children}</div>
  );
};

export default ContentWrapper;
