import * as fs from "fs";
import * as convertXML from "xml-js";
import mime from "mime-types";
const path = require("path");
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

const getAllFiles = function (dirPath, arrayOfFiles?: any) {
  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, file));
    }
  });

  return arrayOfFiles;
};

const convertBytes = function (bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes == 0) {
    return "n/a";
  }
  // @ts-ignore
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  if (i == 0) {
    return bytes + " " + sizes[i];
  }

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

export const getTotalSize = function (directoryPath) {
  const arrayOfFiles = getAllFiles(directoryPath);

  let totalSize = 0;

  arrayOfFiles.forEach(function (filePath) {
    totalSize += fs.statSync(filePath).size;
  });

  return convertBytes(totalSize);
};
