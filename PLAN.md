# QR Vault Upload Plan

## Goal

Support files larger than Vercel Functions' request-body limit by uploading file data directly from the browser to Google Drive through a resumable upload session.

## Current limitation

The current flow is:

```text
Browser → Vercel Function → Google Drive
```

Vercel can reject requests above its request-body limit before the Function receives them. Increasing the application parser limit alone will not solve this.

## Target flow

```text
1. Browser asks the Vercel Function to start an upload.
2. Vercel Function asks Google Drive for a resumable upload session.
3. Vercel Function returns the temporary upload-session URL to the browser.
4. Browser uploads the file directly to Google Drive using that URL.
5. Vercel Function creates the public reader permission for the completed file.
6. Frontend receives the final Google Drive URL and generates the QR code.
```

Detailed request flow:

```text
Browser → Vercel: start upload session
Vercel → Google Drive: create resumable session
Google Drive → Vercel: session URL
Vercel → Browser: session URL
Browser ───────────────→ Google Drive: upload file bytes
Browser → Vercel: complete upload with file ID
Vercel → Google Drive: set anyone-with-link reader permission
Vercel → Browser: public download URL
Browser: render and download QR code
```

## Implementation steps

### 1. Add a start-upload endpoint

Create an endpoint such as:

```text
POST /api/upload/start
```

It should:

- Validate the HTTP method.
- Validate file name, MIME type, and size metadata.
- Authenticate with Google Drive using the existing OAuth refresh token.
- Send a resumable-upload initialization request to Google Drive.
- Include the configured folder ID in the file metadata.
- Return the Google upload-session URL and an upload token/reference.

Do not expose Google OAuth credentials to the browser.

### 2. Add a completion endpoint

Create an endpoint such as:

```text
POST /api/upload/complete
```

It should:

- Receive the completed Google Drive file ID.
- Verify that the file exists and has the expected metadata.
- Create this permission:

```json
{
  "type": "anyone",
  "role": "reader",
  "allowFileDiscovery": false
}
```

- Return the file ID, file name, and public download URL.

### 3. Update the frontend upload flow

Replace the current multipart upload with:

1. Read the selected file's name, MIME type, and size.
2. Call `/api/upload/start` with metadata.
3. Upload the file directly to the returned Google session URL.
4. Track upload progress with `XMLHttpRequest` or `fetch` where supported.
5. Call `/api/upload/complete` with the completed file ID.
6. Set the returned URL as `fileUrl`.
7. Render the existing QR component.

Preserve the existing loading state and disable duplicate uploads while the process is active.

### 4. Expand file validation

Keep an explicit allowlist for common business files, including:

- PDF
- JPG/JPEG
- PNG
- WEBP
- HEIC, if required
- TXT
- CSV
- DOC/DOCX
- XLS/XLSX
- PPT/PPTX
- ZIP, if required

Validate both metadata and maximum file size. Choose a practical application limit, such as 100 MB or 500 MB, based on the client's needs and Google Drive limits.

### 5. Improve failure handling

Handle and display distinct errors for:

- Unsupported file type
- File too large
- Failed session creation
- Failed direct upload
- Expired upload session
- OAuth/token failure
- Google Drive permission failure
- Network interruption

If a resumable upload is interrupted, support retrying or restarting the session.

### 6. Test the complete flow

Test with:

- Small PDF
- JPG/PNG
- DOCX
- XLSX
- CSV
- A file above 4 MB
- An invalid file type
- A mobile connection
- A QR scan without Google login

Confirm that uploaded files appear in the configured `Qr-scanner` Drive folder and that temporary test files are removed after verification.

## Security requirements

- Keep OAuth client ID, client secret, and refresh token server-side.
- Do not place secrets in `VITE_*` variables or browser code.
- Validate file metadata before creating a session.
- Use unguessable references if the completion endpoint needs a server-side upload record.
- Consider adding rate limiting before production use.
- Public QR downloads are intentional; anyone possessing a QR/link can access that file.

## Success criteria

- Files larger than Vercel's request-body limit upload successfully.
- File bytes do not pass through the Vercel Function.
- Upload progress remains visible in the UI.
- Google Drive receives the file in the configured folder.
- The file is publicly readable without Google login.
- The app generates a QR code from the final public download URL.
- Existing small-file behavior remains functional.
