import { useState } from "react";
import { Sliders, Printer, Type, Ruler, Store, Tag, Hash } from "lucide-react";

function App() {
  const [form, setForm] = useState({
    perfume_name: "",
    shop_name: "",
    price: "",
    multiplier: "",
    copies: 1,
    label_width: 40, // cm
    label_height: 40,
    corner_radius: 8,
    font_perfume_size: 12,
    font_shop_size: 10,
    font_price_size: 10,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = async () => {
    try {
      const res = await fetch("https://perfume-label-backend.onrender.com/generate_label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("فشل الاتصال بالخادم");

      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (err) {
      alert("⚠️ حدث خطأ أثناء الطباعة: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#3a2a1a] flex flex-col items-center justify-center p-4 text-white font-[Cairo]">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-amber-400 mb-6">🎨 مولّد ملصقات العطور</h1>

        {/* 🏷️ اسم العطر */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-1"><Tag size={18}/> اسم العطر</label>
          <input
            name="perfume_name"
            className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
            placeholder="أدخل اسم العطر"
            value={form.perfume_name}
            onChange={handleChange}
          />
        </div>

        {/* 🏪 اسم المحل */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-1"><Store size={18}/> اسم المحل</label>
          <input
            name="shop_name"
            className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
            placeholder="أدخل اسم المحل"
            value={form.shop_name}
            onChange={handleChange}
          />
        </div>

        {/* 💰 السعر و × الكمية */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 mb-1"><Type size={18}/> السعر (DA)</label>
            <input
              name="price"
              type="number"
              min="0"
              className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
              placeholder="مثال: 1500"
              value={form.price}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 mb-1"><Hash size={18}/> × الكمية</label>
            <input
              name="multiplier"
              type="number"
              min="1"
              className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
              placeholder="مثال: 2"
              value={form.multiplier}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 🔢 عدد النسخ */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-1"><Printer size={18}/> عدد النسخ</label>
          <input
            name="copies"
            type="number"
            min="1"
            max="35"
            className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
            value={form.copies}
            onChange={handleChange}
          />
        </div>

        {/* 📏 الأبعاد */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 mb-1"><Ruler size={18}/> العرض (mm)</label>
            <input
              name="label_width"
              type="number"
              className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.label_width}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 mb-1"><Ruler size={18}/> الارتفاع (mm)</label>
            <input
              name="label_height"
              type="number"
              className="w-full p-2 rounded-lg bg-transparent border border-amber-400/50 text-white text-center focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.label_height}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ✏️ إعدادات الخط */}
        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2"><Sliders size={18}/> إعدادات الخط</label>
          <div className="flex gap-2">
            <input name="font_perfume_size" type="number" placeholder="عطر" className="flex-1 p-2 rounded-lg text-center bg-transparent border border-amber-400/50" value={form.font_perfume_size} onChange={handleChange}/>
            <input name="font_shop_size" type="number" placeholder="محل" className="flex-1 p-2 rounded-lg text-center bg-transparent border border-amber-400/50" value={form.font_shop_size} onChange={handleChange}/>
            <input name="font_price_size" type="number" placeholder="سعر" className="flex-1 p-2 rounded-lg text-center bg-transparent border border-amber-400/50" value={form.font_price_size} onChange={handleChange}/>
          </div>
        </div>

        {/* 🔘 زاوية الإطار */}
        <div className="mb-6">
          <label className="flex items-center gap-2 mb-1"><Sliders size={18}/> زاوية الإطار</label>
          <input
            type="range"
            name="corner_radius"
            min="0"
            max="20"
            value={form.corner_radius}
            onChange={handleChange}
            className="w-full accent-amber-400"
          />
        </div>

        {/* 🖨️ زر الطباعة */}
        <button
          onClick={handlePrint}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-full shadow-lg transition-all"
        >
          🖨️ طباعة
        </button>
      </div>
    </div>
  );
}

export default App;