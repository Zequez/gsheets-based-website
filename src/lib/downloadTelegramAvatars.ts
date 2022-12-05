import { parse } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";
import { Axios } from "axios";

const axios = new Axios();

const avatarsCachePath = path.join(
  process.cwd(),
  "public/.cache/telegram-avatars"
);

const avatarPath = (username: string) => {
  return path.join(avatarsCachePath, `${username}.jpg`);
};

export function cleanUsername(username: string) {
  return username.toLowerCase().replace(/^@/, "");
}

export async function downloadTelegramAvatars(
  maybeUsernames: string[],
  forceDownload: boolean = false
) {
  const usernames = maybeUsernames.map(cleanUsername);
  const usernamesToFetch: string[] = forceDownload
    ? usernames
    : usernames.reduce((all, username) => {
        if (!fs.existsSync(avatarPath(username))) {
          all.push(username);
        }
        return all;
      }, [] as string[]);

  console.log("Fetchin Telegram avatars", usernamesToFetch);

  const urls = await Promise.all(
    usernamesToFetch.map((username) => fetchTelegramAvatarUrl(username))
  );

  const usernamesAvatarsUrls = urls.reduce((all, url, i) => {
    if (url) {
      all[usernamesToFetch[i]] = url;
    }
    return all;
  }, {} as { [key: string]: string });

  Object.entries(usernamesAvatarsUrls).map(async ([username, url]) => {
    console.log(`Downloading avatar for ${username} from ${url}`);
    const imagePath = avatarPath(username);
    const writer = fs.createWriteStream(imagePath);

    axios
      .get(url, {
        responseType: "stream",
      })
      .then(
        (response) =>
          new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error: any = null;
            writer.on("error", (err) => {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on("close", () => {
              if (!error) {
                resolve(true);
              }
              //no need to call the reject here, as it will have been called in the
              //'error' stream;
            });
          })
      )
      .catch((e) => {
        console.log("Axios error", e);
      });
  });
}

export async function fetchTelegramAvatarUrl(maybeUsername: string) {
  const username = cleanUsername(maybeUsername);
  const response = await fetch(`https://t.me/${username}`);
  const htmlPage = await response.text();
  const dom = parse(htmlPage);
  const avatarImg = dom.querySelector(
    ".tgme_page_photo_image"
  ) as HTMLImageElement | null;
  const src = avatarImg && avatarImg.getAttribute("src");
  return src;
}
