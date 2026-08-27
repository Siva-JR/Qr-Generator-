import Header from "../components/layout/Header";
import FileUpload from "../components/FileUpload";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <FileUpload />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;