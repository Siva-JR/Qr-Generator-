import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import QRDisplay from "./QRDisplay";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      toast.success("File selected successfully");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFileUrl(response.data.fileUrl);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
          ${
            isDragActive
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
        >
          <input {...getInputProps()} />

          <FiUploadCloud className="mx-auto text-blue-600" size={60} />

          <h2 className="text-xl font-semibold mt-4">
            Drag & Drop your file
          </h2>

          <p className="text-gray-500 mt-2">
            or click here to browse
          </p>

          {selectedFile && (
            <p className="mt-4 font-medium text-green-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <button
          onClick={uploadFile}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {fileUrl && <QRDisplay fileUrl={fileUrl} />}
      </div>
    </>
  );
}

export default FileUpload;