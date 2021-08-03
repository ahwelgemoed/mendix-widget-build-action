import simpleGit from "simple-git";
import { getOctokit, context } from "@actions/github";
import { PROJECT_PATH, baseDir } from "./constants";
import {
  setGITCred,
  createTagAndPushIt,
  createRelease,
  commitGitChanges,
  uploadBuildFolderToRelease,
} from "./gitUtils";

import {
  _readPackageJSON,
  runBuildCommand,
  _readFileAsync,
  _readPackageXML,
  _writePackageXML,
  lists,
} from "./filesystemUtils";

import {
  _widgetFolderStructure,
  _xmlVersion,
  getTotalSize,
  _changeXMLVersion,
} from "./utils";

const core = require("@actions/core");
const git = simpleGit({ baseDir });

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const github = getOctokit(process.env.GITHUB_TOKEN || GITHUB_TOKEN);
const { GITHUB_SHA } = process.env;

async function run() {
  const packagesFolders = await _readFileAsync(PROJECT_PATH);
  if (!packagesFolders) {
    return core.error("No Files Found");
  }
  const widgetStructure = _widgetFolderStructure();

  const packageJSON = await _readPackageJSON(widgetStructure);

  // Gets Version in Package.json
  const jsonVersion = packageJSON.version;
  // Gets Name in Package.json
  const packagePackageName = packageJSON.name;
  // Reads package.xml
  const packageXML = await _readPackageXML(widgetStructure);
  // Parses .xml and and Returns package.xml Version
  const xmlVersion = _xmlVersion(packageXML);
  console.log("🔥");

  if (xmlVersion !== jsonVersion) {
    //  Inits Git
    await git.init();
    // Set Git Credentials
    await setGITCred(git);
    // Update XML to match Package.json and
    const newRawPackageXML = await _changeXMLVersion(packageXML, jsonVersion);
    //  Converts Js back to xml and writes xml file to disk
    await _writePackageXML(widgetStructure, newRawPackageXML);
    // Build New Version
    const build = await runBuildCommand(widgetStructure);
    await delay(10000);
    // Construct New Version Name
    const newTagName = `v${jsonVersion}`;
    await createTagAndPushIt(github, context, GITHUB_SHA, newTagName);
    // Commit and Push Code
    await commitGitChanges(git);
    // Changes Tag to Release
    const release = await createRelease(github, context, newTagName);

    if (!release) {
      return core.error("No Release Found");
    }
    console.log(`jsonVersion`, `${widgetStructure.build}/${jsonVersion}`);
    console.log(`build`, build);
    setTimeout(async () => {
      const x = getTotalSize(`${widgetStructure.build}`);
      const xx = getTotalSize(`${widgetStructure.build}/${jsonVersion}`);

      console.log(`x,xx`, x, xx);

      // await lists(widgetStructure);
      // Folder name where Widget is Build
      // const upload = await uploadBuildFolderToRelease(
      //   github,
      //   widgetStructure,
      //   jsonVersion,
      //   release
      // );
      // return upload;
    }, 10000);
  }
}

run();
export function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
