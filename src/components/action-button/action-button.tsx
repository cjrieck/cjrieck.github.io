import React from "react";
import {Link} from "react-router-dom";
import "../../theme.css"
import "./action-button.css"

type Props = {
  title: string
  routeName: string
}

export default function ActionButton({ title, routeName }: Props) {
  if (routeName.includes("mailto")) {
    return (
      <a
        className="action-button-link"
        href={routeName}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="action-button-content semibold-text">
          {title}
        </div>
      </a>
    )
  }
  return (
    <Link
      className="action-button-link"
      to={routeName}
    >
      <div className="action-button-content semibold-text">
        {title}
      </div>
    </Link>
  )
}
