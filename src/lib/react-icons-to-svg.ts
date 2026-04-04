import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FiLink } from "react-icons/fi";

function icon_string(Icon: React.ComponentType<any>): string {
  return renderToStaticMarkup(createElement(Icon));
}

console.log(icon_string(FiLink));