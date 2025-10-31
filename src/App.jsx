import { useState } from "react";

function App() {
  const [perfumeName, setPerfumeName] = useState("");
  const [shopName, setShopName] = useState("");
  const [price, setPrice] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [copies, setCopies] = useState(1);
  const [labelWidth, setLabelWidth] = useState(113.39);
  const [labelHeight, setLabelHeight] = useState(113.39);
  const [logoWidth, setLogoWidth] = useState(30);
  const [logoHeight, setLogoHeight] = useState(30);
  const [fontPerfumeSize, setFontPerfumeSize] = useState(10);
  const [fontShopSize, setFontShopSize] = useState(8);
  const [fontPerfumeFamily, setFontPerfumeFamily] = useState("Helvetica-Bold");
  const [fontShopFamily, setFontShopFamily] = useState("Times-Italic");
  const [extraFields, setExtraFields] = useState([]);
  const [newField, setNewField] = useState({ label: "", value: "" });
  const [logoFile, setLogoFile] = useState(null);

  const backendUrl = "https://perfume-label-backend.onrender.com";

  // ✅ رفع اللوجو
  const uploadLogo = async () => {
    if (!logoFile) return alert("الرجاء اختيار ملف لوجو أولاً");
    const formData = new FormData();
    formData.append("file", logoFile);
    const res = await fetch(`${backendUrl}/upload_logo`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    alert(data.message || "تم رفع اللوجو بنجاح");
  };

  // ✅ توليد PDF
  const generatePDF = async () => {
    const settings = {
      perfume_name: perfumeName,
      shop_name: shopName,
      price,
      multiplier,
      copies: Number(copies),
      label_width: Number(labelWidth),
      label_height: Number(labelHeight),
      logo_width: Number(logoWidth),
      logo_height: Number(logoHeight),
      font_perfume: Number(fontPerfumeSize),
      font_shop: Number(fontShopSize),
      font_perfume_family: fontPerfumeFamily,
      font_shop_family: fontShopFamily,
      extra_fields: extraFields,
    };

    const response = await fetch(`${backendUrl}/generate_label`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      alert("حدث خطأ أثناء إنشاء الملف");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "labels.pdf";
    a.click();
  };

  // ✅ إضافة حقل إضافي
  const addField = () => {
    if (!newField.label || !newField.value) return;
    setExtraFields([...extraFields, newField]);
    setNewField({ label: "", value: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-4">
          🏷️ مولد ملصقات العطور
        </h1>

        {/* الاسم والمحــل */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="اسم العطر"
            value={perfumeName}
            onChange={(e) => setPerfumeName(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="اسم المحل"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* إعدادات الخط */}
        <div className="mt-4 border-t pt-3">
          <h2 className="font-semibold text-gray-700 mb-2">✏️ إعدادات الخط</h2>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              placeholder="حجم خط العطر"
              value={fontPerfumeSize}
              onChange={(e) => setFontPerfumeSize(e.target.value)}
              className="border rounded-lg p-2"
            />
            <select
              value={fontPerfumeFamily}
              onChange={(e) => setFontPerfumeFamily(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="Helvetica-Bold">Helvetica-Bold</option>
              <option value="Times-BoldItalic">Times-BoldItalic</option>
              <option value="Courier-Bold">Courier-Bold</option>
              <option value="Helvetica-Oblique">Helvetica-Oblique</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="حجم خط المحل"
              value={fontShopSize}
              onChange={(e) => setFontShopSize(e.target.value)}
              className="border rounded-lg p-2"
            />
            <select
              value={fontShopFamily}
              onChange={(e) => setFontShopFamily(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="Times-Italic">Times-Italic</option>
              <option value="Helvetica-Bold">Helvetica-Bold</option>
              <option value="Courier">Courier</option>
              <option value="Times-Roman">Times-Roman</option>
            </select>
          </div>
        </div>

        {/* السعر والضرب */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="السعر"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-1/2 border rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="الضرب ×"
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            className="w-1/2 border rounded-lg p-2"
          />
        </div>

        {/* النسخ وحجم الملصق */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <input
            type="number"
            placeholder="عدد النسخ"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
            className="border rounded-lg p-2"
          />
          <input
            type="number"
            placeholder="عرض الملصق (pt)"
            value={labelWidth}
            onChange={(e) => setLabelWidth(e.target.value)}
            className="border rounded-lg p-2"
          />
          <input
            type="number"
            placeholder="طول الملصق (pt)"
            value={labelHeight}
            onChange={(e) => setLabelHeight(e.target.value)}
            className="border rounded-lg p-2"
          />
        </div>

        {/* حجم اللوجو */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <input
            type="number"
            placeholder="عرض اللوجو"
            value={logoWidth}
            onChange={(e) => setLogoWidth(e.target.value)}
            className="border rounded-lg p-2"
          />
          <input
            type="number"
            placeholder="طول اللوجو"
            value={logoHeight}
            onChange={(e) => setLogoHeight(e.target.value)}
            className="border rounded-lg p-2"
          />
        </div>

        {/* رفع اللوجو */}
        <div className="mt-3 border rounded-lg p-2">
          <label className="block text-sm font-medium mb-1">📸 رفع شعار جديد</label>
          <input
            type="file"
            onChange={(e) => setLogoFile(e.target.files[0])}
            className="w-full"
          />
          <button
            onClick={uploadLogo}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 mt-2 w-full"
          >
            رفع اللوجو
          </button>
        </div>

        {/* الحقول الإضافية */}
        <div className="mt-4 border-t pt-3">
          <h2 className="font-semibold text-gray-700 mb-2">➕ حقول إضافية</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="الاسم"
              value={newField.label}
              onChange={(e) =>
                setNewField({ ...newField, label: e.target.value })
              }
              className="border rounded-lg p-2 w-1/2"
            />
            <input
              type="text"
              placeholder="القيمة"
              value={newField.value}
              onChange={(e) =>
                setNewField({ ...newField, value: e.target.value })
              }
              className="border rounded-lg p-2 w-1/2"
            />
          </div>
          <button
            onClick={addField}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1 w-full"
          >
            إضافة
          </button>

          <ul className="mt-2 text-sm text-gray-600">
            {extraFields.map((f, i) => (
              <li key={i}>• {f.label}: {f.value}</li>
            ))}
          </ul>
        </div>

        {/* زر الطباعة */}
        <button
          onClick={generatePDF}
          className="mt-5 bg-purple-700 hover:bg-purple-800 text-white font-bold w-full py-2 rounded-lg shadow-lg transition"
        >
          🖨️ إنشاء و تحميل PDF
        </button>
      </div>
    </div>
  );
}

export default App;