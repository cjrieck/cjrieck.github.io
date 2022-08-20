import React from "react";
import {Link} from "react-router-dom";
import "../../theme.css"
import "./action-button.css"

type Props = {
  title: string
  routeName: string
  fontSize?: string | number
}

export default function ActionButton({ title, routeName, fontSize }: Props) {
  return (
    <Link
      className="action-button-link"
      to={routeName}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="action-button-content semibold-text" style={{fontSize}}>
        {title}
      </div>
    </Link>
  )
}
