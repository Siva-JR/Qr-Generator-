import { QRCodeCanvas } from "qrcode.react";
import { FiCopy, FiExternalLink, FiDownload } from "react-icons/fi";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { useRef } from "react";

function QRDisplay({ fileUrl }) {
  const qrRef = useRef(null);

  const copyLink = async () => {
    await navigator.clipboard.writeText(fileUrl);
    toast.success("Link copied to clipboard!");
  };

  const downloadQR = async () => {
    const canvas = await html2canvas(qrRef.current);

    const link = document.createElement("a");
    link.download = "quickqr-code.png";
    link.href = canvas.toDataURL();
    link.click();

    toast.success("QR Code downloaded!");
  };

  return (
    <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Your QR Code
      </h2>

      <div
        ref={qrRef}
        className="flex justify-center bg-white p-6 rounded-2xl"
      >
        <QRCodeCanvas value={fileUrl} size={220} />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500 break-all">
        {fileUrl}
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
        >
          <FiCopy />
          Copy Link
        </button>

        <button
          onClick={downloadQR}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
        >
          <FiDownload />
          Download QR
        </button>

        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
        >
          <FiExternalLink />
          Open File
        </a>
      </div>
    </div>
  );
}

export default QRDisplay;