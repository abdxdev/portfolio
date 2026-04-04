import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import { HiOutlineExternalLink } from "react-icons/hi";

function icon_string(Icon: React.ComponentType<any>): string {
  return renderToStaticMarkup(createElement(Icon));
}

fs.writeFileSync("public/assets/icons/external-link.svg", icon_string(HiOutlineExternalLink));