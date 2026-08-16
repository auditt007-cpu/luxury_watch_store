import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { ROOT, loadEnv, requireEnv } from "./env.mjs";

loadEnv(ROOT);
requireEnv(["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]);

const CONCURRENCY = Number(process.env.R2_UPLOAD_CONCURRENCY || 12);
const LOCAL_DIR = path.join(ROOT, "public", "uploads", "goods");
const PREFIX = "uploads/goods/";

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
};

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (stat.isFile() && name !== ".gitkeep") files.push(full);
  }
  return files;
}

function toKey(file) {
  const rel = path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/");
  return rel;
}

async function existingKeys(client, bucket) {
  const keys = new Set();
  const paginator = paginateListObjectsV2(
    { client },
    { Bucket: bucket, Prefix: PREFIX },
  );
  for await (const page of paginator) {
    for (const item of page.Contents || []) {
      if (item.Key) keys.add(item.Key);
    }
  }
  return keys;
}

async function runPool(items, limit, worker) {
  let cursor = 0;
  let failed = 0;
  async function next() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        await worker(items[index], index);
      } catch (error) {
        failed += 1;
        console.error(`失败 ${items[index]}`, error.message || error);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
  return failed;
}

async function putWithRetry(client, params, retries = 3) {
  let last;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.send(new PutObjectCommand(params));
      return;
    } catch (error) {
      last = error;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw last;
}

async function main() {
  const bucket = process.env.R2_BUCKET_NAME;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const files = walk(LOCAL_DIR);
  console.log(`本地图片 ${files.length} 张，并发 ${CONCURRENCY}`);
  if (!files.length) {
    console.log("没有可上传的文件。");
    return;
  }

  console.log("正在列出 R2 已有对象...");
  const remote = await existingKeys(client, bucket);
  const pending = files.filter((file) => !remote.has(toKey(file)));
  console.log(`已存在 ${files.length - pending.length}，待上传 ${pending.length}`);

  let done = 0;
  const started = Date.now();
  const failed = await runPool(pending, CONCURRENCY, async (file) => {
    const key = toKey(file);
    const body = fs.readFileSync(file);
    await putWithRetry(client, {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    });
    done += 1;
    if (done % 50 === 0 || done === pending.length) {
      const sec = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`进度 ${done}/${pending.length}  (${sec}s)`);
    }
  });

  console.log(`上传结束：成功 ${pending.length - failed}，失败 ${failed}`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
