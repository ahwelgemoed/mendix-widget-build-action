import * as fs from "fs";
import * as convertXML from "xml-js";
import mime from "mime-types";
import { basename } from "path";

import { PROJECT_PATH, WidgetFolderStructureInterface } from "./constants";

const core = require("@actions/core");

//  Currently Working for MX8 and MX9 widget Structures
export function _widgetFolderStructure(): WidgetFolderStructureInterface {
  const widgetFolderStructure = {
    base: `${PROJECT_PATH}/`,
    src: `${PROJECT_PATH}/src`,
    build: `${PROJECT_PATH}/dist`,
    packageJSON: `${PROJECT_PATH}/package.json`,
    packageXML: `${PROJECT_PATH}/src/package.xml`,
  };
  return widgetFolderStructure;
}

/**
 * TODO - Make this less... Uhm... 💩
 */
export function _xmlVersion(
  rawXML: convertXML.Element | convertXML.ElementCompact
) {
  return rawXML.elements[0].elements[0].attributes.version;
}
/**
 * TODO - Make this less... Uhm... 💩
 */
export function _changeXMLVersion(
  rawXML: convertXML.Element | convertXML.ElementCompact,
  version: string
) {
  let y = rawXML;
  y.elements[0].elements[0].attributes.version = version;
  return y;
}

export const assetData = (path: string) => {
  return {
    fileStream: fs.readFileSync(path),
    name: basename(path),
    contentType: mime.lookup(path) || "application/zip",
  };
};
