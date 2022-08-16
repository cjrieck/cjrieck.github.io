import React from "react";
import "./brands-list.css"
import weworkLogo from "../../img/brand-logos/wework.png"
import soundcloudLogo from "../../img/brand-logos/soundcloud.png"
import nbcLogo from "../../img/brand-logos/nbc.png"
import nickelodeonLogo from "../../img/brand-logos/nickelodeon.png"
import credijustoLogo from "../../img/brand-logos/credijusto.png"

export default function BrandsList() {
  return (
    <div className="brands-list-container">
      <img src={soundcloudLogo} className="brand-logo soundcloud-logo" alt="brand-logo"/>
      <img src={nbcLogo} className="brand-logo nbc-logo" alt="brand-logo"/>
      <img src={weworkLogo} className="brand-logo wework-logo" alt="brand-logo"/>
      <img src={nickelodeonLogo} className="brand-logo nickelodeon-logo" alt="brand-logo"/>
      <img src={credijustoLogo} className="brand-logo credijusto-logo" alt="brand-logo"/>
    </div>
  )
}
