import React from "react";
import {Link} from "react-router-dom";
import "../../theme.css"
import "./action-button.css"

type Props = {
  title: string
  routeName: string
}

export default function ActionButton({ title, routeName }: Props) {
  return (
    <Link
      className="action-button-link"
      to={routeName}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="action-button-content semibold-text">
        {title}
      </div>
    </Link>
  )
}
