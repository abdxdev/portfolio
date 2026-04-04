import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FaLink } from "react-icons/fa6";

function icon_string(Icon: React.ComponentType<any>): string {
  return renderToStaticMarkup(createElement(Icon));
}

console.log(icon_string(FaLink));