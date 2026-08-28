import { FiShield, FiUploadCloud } from "react-icons/fi";

function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl">
            <FiShield size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">TN QR</h1>
            <p className="text-blue-100 text-sm">
              Secure QR-Based File Sharing
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
          <FiUploadCloud />
          <span>Upload • Scan • Share</span>
        </div>
      </div>
    </header>
  );
}

export default Header;