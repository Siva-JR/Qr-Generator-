import { google } from "googleapis";
import formidable from "formidable";
import fs from "node:fs";

export const config = { api: { bodyParser: false } };
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/vnd.rar",
  "video/mp4",
]);

function getDriveClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error("Google OAuth credentials are not configured");
  }
  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.drive({ version: "v3", auth });
}

function parseForm(request) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE, keepExtensions: true });
    form.parse(request, (error, fields, files) => error ? reject(error) : resolve({ fields, files }));
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { files } = await parseForm(request);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return response.status(400).json({ message: "A file is required" });
    if (!ALLOWED_TYPES.has(file.mimetype)) return response.status(415).json({ message: "This file type is not supported" });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) throw new Error("Google Drive folder is not configured");
    const drive = getDriveClient();
    const uploaded = await drive.files.create({
      requestBody: { name: file.originalFilename || "uploaded-file", parents: [folderId] },
      media: { mimeType: file.mimetype, body: fs.createReadStream(file.filepath) },
      fields: "id,name,mimeType,size",
    });
    const fileId = uploaded.data.id;
    await drive.permissions.create({ fileId, requestBody: { type: "anyone", role: "reader", allowFileDiscovery: false } });
    return response.status(201).json({ fileName: uploaded.data.name, fileId, fileUrl: `https://drive.google.com/uc?export=download&id=${fileId}` });
  } catch (error) {
    console.error("Google Drive upload failed", error);
    const message = error.code === 413 ? "File is too large (maximum 4 MB)" : error.message?.includes("credentials") ? error.message : "Upload failed";
    return response.status(error.code === 413 ? 413 : 500).json({ message });
  }
}
