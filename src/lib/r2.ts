import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function getUploadUrl(key: string, contentType: string, contentLength: number) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 300 });
}

async function deleteObject(key: string) {
  await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Best-effort cleanup: never throws. Callers use this after a DB delete has
 * already committed, so a transient R2 failure should never block the rest
 * of the operation — at worst it leaves an orphaned (invisible) R2 object,
 * never a DB row pointing at a file that no longer exists.
 */
export async function deleteObjects(keys: string[]) {
  const results = await Promise.allSettled(keys.map(deleteObject));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete R2 object ${keys[index]}`, result.reason);
    }
  });
}

export function getPublicUrl(key: string) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
