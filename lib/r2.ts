import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

const R2_ENDPOINT = process.env.R2_ACCOUNT_ID
  ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : "";

function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing ${name}. Configure Cloudflare R2 environment variables.`);
  return value;
}

export function isR2Configured() {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ORIGINAL_BUCKET_NAME && process.env.R2_PUBLIC_BUCKET_NAME && process.env.R2_PUBLIC_URL);
}

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: required(R2_ENDPOINT, "R2_ACCOUNT_ID"),
    credentials: {
      accessKeyId: required(process.env.R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID"),
      secretAccessKey: required(process.env.R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function getOriginalBucket() { return required(process.env.R2_ORIGINAL_BUCKET_NAME, "R2_ORIGINAL_BUCKET_NAME"); }
export function getPublicBucket() { return required(process.env.R2_PUBLIC_BUCKET_NAME, "R2_PUBLIC_BUCKET_NAME"); }

export function publicR2Url(key: string) {
  return `${required(process.env.R2_PUBLIC_URL, "R2_PUBLIC_URL").replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function keyFromPublicR2Url(value: string) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return base && value.startsWith(`${base}/`) ? decodeURIComponent(value.slice(base.length + 1)) : null;
}

export function createPhotoKeys(filename: string) {
  const extension = path.extname(filename).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".jpg";
  const id = `${crypto.randomUUID()}${extension}`;
  const base = new Date().toISOString().slice(0, 7).replace("-", "/");
  return { original: `originals/${base}/${id}`, web: `web/${base}/${id.replace(extension, ".jpg")}`, thumbnail: `thumbs/${base}/${id.replace(extension, ".jpg")}` };
}

export async function createUploadUrl(key: string, contentType: string, isPublic = false) {
  const command = new PutObjectCommand({
    Bucket: isPublic ? getPublicBucket() : getOriginalBucket(), Key: key, ContentType: contentType,
    ...(isPublic ? { CacheControl: "public, max-age=31536000, immutable" } : {}),
  });
  return getSignedUrl(getR2Client(), command, { expiresIn: 10 * 60 });
}

export async function createDownloadUrl(key: string, filename: string) {
  return getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: getOriginalBucket(), Key: key, ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}` }), { expiresIn: 60 * 10 });
}

export async function deleteR2Objects(keys: string[], isPublic = false) {
  if (!keys.length) return;
  await getR2Client().send(new DeleteObjectsCommand({ Bucket: isPublic ? getPublicBucket() : getOriginalBucket(), Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }));
}
