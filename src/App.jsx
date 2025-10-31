import { useState } from "react";

function App() {
  const [settings, setSettings] = useState({
    perfume_name: "",
    shop_name: "",
    price: "",
    multiplier: "",
    copies: 1,
    label_width: 113.39,
    label_height: 113.39,
    font_perfume: 10,
    font_shop: 8,
    font_price: 9,
    font_family_perfume: "Helvetica-Bold",
    font_family_shop: "Times-Italic",
    extra_fields: [],
  });

  const fontFamilies = [
    "Helvetica",
    "Helvetica-Bold",
    "Helvetica-Oblique",
    "Times-Roman",
    "Times-Bold",
    "Times-Italic",
    "Courier",
  ];

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const generatePDF = async () => {
    const response = await fetch("https://perfume-label-backend.onrender.com/generate_label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "labels.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("❌ حدث خطأ أثناء إنشاء PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-4 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-xl font-bold text-center mb-4">🎨 إعدادات ملصق العطور</h1>

        {/* معلومات النصوص */}
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="اسم العطر"
            value={settings.perfume_name}
            onChange={(e) => handleChange("perfume_name", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="اسم المحل"
            value={settings.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="السعر"
            value={settings.price}
            onChange={(e) => handleChange("price", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="الكمية (×)"
            value={settings.multiplier}
            onChange={(e) => handleChange("multiplier", e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="عدد النسخ"
            value={settings.copies}
            onChange={(e) => handleChange("copies", parseInt(e.target.value))}
          />
        </div>

        {/* ⚙️ التحكم في حجم الملصق */}
        <h2 className="mt-5 font-semibold">📏 أبعاد الملصق (مم)</h2>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="العرض"
            value={settings.label_width}
            onChange={(e) => handleChange("label_width", parseFloat(e.target.value))}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="الارتفاع"
            value={settings.label_height}
            onChange={(e) => handleChange("label_height", parseFloat(e.target.value))}
          />
        </div>

        {/* 🖋️ التحكم في الخط */}
        <h2 className="mt-5 font-semibold">🖋️ إعدادات الخط</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>اسم العطر:</span>
            <input
              type="number"
              className="border w-16 text-center rounded"
              value={settings.font_perfume}
              onChange={(e) => handleChange("font_perfume", parseInt(e.target.value))}
            />
            <select
              value={settings.font_family_perfume}
              onChange={(e) => handleChange("font_family_perfume", e.target.value)}
              className="border p-1 rounded"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span>اسم المحل:</span>
            <input
              type="number"
              className="border w-16 text-center rounded"
              value={settings.font_shop}
              onChange={(e) => handleChange("font_shop", parseInt(e.target.value))}
            />
            <select
              value={settings.font_family_shop}
              onChange={(e) => handleChange("font_family_shop", e.target.value)}
              className="border p-1 rounded"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* زر الطباعة */}
        <button
          onClick={generatePDF}
          className="mt-6 bg-indigo-600 text-white w-full py-2 rounded-xl hover:bg-indigo-700"
        >
          🖨️ طباعة الملصق
        </button>
      </div>
    </div>
  );
}

export default App;