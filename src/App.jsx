import { useState } from "react";

function App() {
  const [perfume, setPerfume] = useState("");
  const [shop, setShop] = useState("");

  const handlePrint = async () => {
  if (!perfume || !shop) {
    alert("الرجاء إدخال اسم العطر واسم المحل");
    return;
  }

  try {
    const res = await fetch(
      "https://perfume-label-backend.onrender.com/generate_label?" +
        new URLSearchParams({
          perfume_name: perfume,
          shop_name: shop,
        })
    );

    if (!res.ok) {
      throw new Error(`خطأ في الاتصال: ${res.status}`);
    }

    const blob = await res.blob();
    const fileURL = window.URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = fileURL;
    document.body.appendChild(iframe);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء الطباعة، تأكد من تشغيل الطابعة.");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#3a2a1a] flex flex-col items-center justify-center text-white font-[Cairo]">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/20 w-[90%] max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-amber-400 drop-shadow-lg">
          Amine Perfume
        </h1>

        <input
          className="border border-amber-400/60 bg-transparent text-white placeholder:text-gray-300 p-3 rounded-lg w-full mb-4 text-center focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          placeholder="اسم العطر"
          value={perfume}
          onChange={(e) => setPerfume(e.target.value)}
        />

        <input
          className="border border-amber-400/60 bg-transparent text-white placeholder:text-gray-300 p-3 rounded-lg w-full mb-6 text-center focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          placeholder="اسم المحل"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
        />

        <button
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          🖨️ طباعة
        </button>

        <p className="mt-6 text-gray-300 text-sm">
          Amine Parfume 💫
        </p>
      </div>
    </div>
  );
}

export default App;