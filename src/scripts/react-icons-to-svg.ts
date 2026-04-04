import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import { IoGlobe  } from "react-icons/io5";
function icon_string(Icon: React.ComponentType<any>): string {
  return renderToStaticMarkup(createElement(Icon));
}

fs.writeFileSync("public/assets/icons/portfolio.svg", icon_string(IoGlobe ));