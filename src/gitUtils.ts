import * as fs from "fs";
import spawnAsync from "@expo/spawn-async";

import { findBuildFiles } from "./filesystemUtils";
import { assetData } from "./utils";
const core = require("@actions/core");

export async function setGITCred(git) {
  const COMMIT_AUTHOR_NAME = core.getInput("bot_author_name") || "BOTTY";
  const COMMIT_AUTHOR_EMAIL =
    core.getInput("bot_author_email") || "BOT@BOTTY.inc";
  try {
    await git.addConfig("user.name", COMMIT_AUTHOR_NAME);
    await git.addConfig("user.email", COMMIT_AUTHOR_EMAIL);
    return;
  } catch (error) {
    console.log(`error`, error);
  }
}

export async function createRelease(github, context, tag: string) {
  try {
    const { owner, repo } = context.repo;
    const { data } = await github.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
    });

    return data;
  } catch (error) {
    core.error(`Error @ createRelease ${error}`);
  }
}

export async function commitGitChanges(git) {
  const BOT_MESSAGE = core.getInput("bot_commit_message") || "BOT COMMIT";
  const COMMIT_AUTHOR_NAME = core.getInput("bot_author_name") || "BOTTY";
  const COMMIT_AUTHOR_EMAIL =
    core.getInput("bot_author_email") || "BOT@BOTTY.inc";
  const BRANCH_TO_PUSH_TO = core.getInput("branch_to_push_to") || "main";
  try {
    await git.add("./*", (err) => {
      if (err) {
        core.error(`Error @ add ${err}`);
      }
    });
    const x = await git.commit(
      BOT_MESSAGE,
      undefined,
      {
        "--author": `"${COMMIT_AUTHOR_NAME} <${COMMIT_AUTHOR_EMAIL}>"`,
      },
      (err) => {
        if (err) {
          core.error(`Error @ commit ${err}`);
        }
      }
    );
    await git.push("origin", BRANCH_TO_PUSH_TO, ["--force"], (err) => {
      if (err) {
        core.error(`Error @ push ${err}`);
      }
    });
    return;
  } catch (error) {
    core.error(`Error @ commitGitChanges ${error}`);
  }
}

export async function createTagAndPushIt(github, context, sha, tag) {
  const BOT_MESSAGE = core.getInput("bot_commit_message") || "BOT COMMIT";
  try {
    const annotatedTag = await github.git.createTag({
      ...context.repo,
      tag: tag,
      message: BOT_MESSAGE,
      object: sha,
      type: "commit",
    });

    await github.git.createRef({
      ...context.repo,
      ref: `refs/tags/${tag}`,
      sha: annotatedTag ? annotatedTag.data.sha : sha,
    });
    return annotatedTag;
  } catch (error) {
    core.error(`Error @ createTagAndPushIt ${error}`);
  }
}

export async function uploadBuildFolderToRelease(
  github,
  widgetStructure,
  jsonVersion,
  release
) {
  try {
    const FOLDER_WHERE_RELEASE_IS = `${widgetStructure.build}/${jsonVersion}`;
    // All File names in build folder
    const filesArray = await findBuildFiles(FOLDER_WHERE_RELEASE_IS);
    // Loop over all files in Widget Build
    for (const file of filesArray) {
      // Built widget path
      const filePath = `${FOLDER_WHERE_RELEASE_IS}/${file}`;
      const { name, fileStream, contentType } = assetData(filePath);
      // Set Headers for Upload
      const headers = {
        "content-type": contentType,
        "content-length": fs.statSync(filePath).size,
      };
      // Uploads Built to Release
      const uploadAssetResponse = await github.repos.uploadReleaseAsset(
        // @ts-ignore
        {
          url: release.upload_url,
          headers,
          name,
          file: fileStream,
        }
      );
      core.info(`🥊 Uploaded ${file}`);
      return uploadAssetResponse;
    }
  } catch (error) {
    core.error(`Error @ getAllTags ${error}`);
  }
}
