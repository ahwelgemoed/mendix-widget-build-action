import * as fs from "fs";
import * as path from "path";
import spawnAsync from "@expo/spawn-async";
import * as convertXML from "xml-js";

const core = require("@actions/core");

import { WidgetFolderStructureInterface } from "./constants";

export async function _readPackageJSON(
  widgetStructure: WidgetFolderStructureInterface
) {
  const rawPackageJSON = await fs.readFileSync(
    path.resolve(widgetStructure.packageJSON),
    "utf8"
  );
  const parsedPackageJSON = JSON.parse(rawPackageJSON);
  return parsedPackageJSON;
}

export async function runBuildCommand(
  widgetStructure: WidgetFolderStructureInterface
) {
  try {
    const { stdout } = await spawnAsync("yarn", [
      "build",
      "--prefix",
      widgetStructure.base,
    ]);

    return stdout;
  } catch (error) {
    console.log(`error`, error);
  }
}
export async function lists(widgetStructure: WidgetFolderStructureInterface) {
  try {
    const { stdout } = await spawnAsync("du", ["-sh", "*"]);

    return stdout;
  } catch (error) {
    console.log(`error`, error);
  }
}

export async function _readFileAsync(packagesPath: string) {
  const foldersArray = await fs.readdirSync(packagesPath, {
    withFileTypes: true,
  });
  return foldersArray;
}

export async function _readPackageXML(
  widgetStructure: WidgetFolderStructureInterface
) {
  const rawPackageXML = await fs.readFileSync(
    path.resolve(widgetStructure.packageXML),
    "utf8"
  );
  var options = { ignoreComment: true, alwaysChildren: true };
  var result = convertXML.xml2js(rawPackageXML, options);
  return result;
}

export async function _writePackageXML(
  widgetStructure: WidgetFolderStructureInterface,
  rawNewPackageXML: convertXML.Element | convertXML.ElementCompact
) {
  const options = { compact: false, ignoreComment: true, spaces: 4 };
  const result = await convertXML.js2xml(rawNewPackageXML, options);

  try {
    await fs.writeFileSync(widgetStructure.packageXML, result);
    return;
  } catch (error) {
    core.error(`Error @ _writePackageXML ${error}`);
  }
}

export async function findBuildFiles(folderPath: string) {
  try {
    const filesArray = await fs.readdirSync(path.resolve(folderPath), "utf8");
    return filesArray;
  } catch (error) {
    core.error(`Error @ findBuildFiles ${error}`);
  }
}
