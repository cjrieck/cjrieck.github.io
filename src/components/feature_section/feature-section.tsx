import React from "react";
import "../../theme.css"
import "./feature-section.css"
import { useMediaQuery } from 'react-responsive'
import ActionButton from "../action-button/action-button";

type DetailRouteInfo = {
  buttonTitle: string
  routeName: string
}

type Props = {
  id: number
  title: string
  description: string
  artworkSource: string
  detailRoute?: DetailRouteInfo
}

export default function FeatureSection(props: Props) {
  const renderSeeMoreButton = (data: DetailRouteInfo) => {
    return (
      <ActionButton title={data.buttonTitle} routeName={data.routeName} />
    )
  }

  const isMobile = useMediaQuery({ query: "screen and (max-device-width: 480px)" })
  const backgroundColor = props.id % 2 === 0 ? "#302D3F" : "#2A2736"
  let containerClass = "feature-container container-content"
  if (isMobile) {
    containerClass = containerClass + " " + "feature-container-reverse"
  }
  else {
    containerClass = props.id % 2 === 0 ? containerClass : containerClass + " " + "feature-container-reverse"
  }
  return (
    <div className={containerClass} style={{backgroundColor}}>
      <div className="feature-text">
        <div className="feature-title bold-text">
          {props.title}
        </div>
        <div className="feature-description regular-text">
          {props.description}
        </div>
        {props.detailRoute ? renderSeeMoreButton(props.detailRoute) : null}
      </div>
      <img src={props.artworkSource} className="feature-art" alt="feature-art"/>
    </div>
  )
}
