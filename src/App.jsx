import { useState } from "react";

const BACKEND_URL = "https://perfume-label-backend.onrender.com/generate_label";

export default function App() {
  const [perfume, setPerfume] = useState("");
  const [shop, setShop] = useState("");
  const [price, setPrice] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [copies, setCopies] = useState(1);

  const [labelWidth, setLabelWidth] = useState(113.39);
  const [labelHeight, setLabelHeight] = useState(113.39);
  const [fontPerfume, setFontPerfume] = useState(10);
  const [fontShop, setFontShop] = useState(8);
  const [fontPrice, setFontPrice] = useState(9);

  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(30);
  const [logoYPosition, setLogoYPosition] = useState(85); // المسافة من أسفل الملصق
  const [extraFields, setExtraFields] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
    }
  };

  const addExtraField = () => setExtraFields([...extraFields, { label: "", value: "" }]);
  const updateExtraField = (i, val) => {
    const arr = [...extraFields];
    arr[i] = val;
    setExtraFields(arr);
  };
  const removeExtraField = (i) => {
    const arr = [...extraFields];
    arr.splice(i, 1);
    setExtraFields(arr);
  };

  const handlePrint = async () => {
    if (!perfume.trim() || !shop.trim()) {
      alert("يرجى إدخال اسم العطر واسم المحل.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("perfume_name", perfume);
    formData.append("shop_name", shop);
    formData.append("price", price);
    formData.append("multiplier", multiplier);
    formData.append("copies", copies);
    formData.append("label_width", labelWidth);
    formData.append("label_height", labelHeight);
    formData.append("font_perfume", fontPerfume);
    formData.append("font_shop", fontShop);
    formData.append("font_price", fontPrice);
    formData.append("logo_size", logoSize);
    formData.append("logo_y", logoYPosition);
    formData.append("extra_fields", JSON.stringify(extraFields));

    if (logo) {
      formData.append("logo", logo);
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("فشل الاتصال بالخادم");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert("حدث خطأ أثناء الطباعة.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#141414] to-[#3a2715] text-white font-sans p-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* العنوان */}
        <h1 className="text-2xl font-bold text-center text-amber-400">🪶 إدارة ملصقات العطور</h1>

        {/* قسم البيانات */}
        <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold mb-2 text-amber-300">البيانات الأساسية</h2>

          <div className="grid gap-3">
            <input
              className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
              placeholder="اسم العطر"
              value={perfume}
              onChange={(e) => setPerfume(e.target.value)}
            />
            <input
              className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
              placeholder="اسم المحل"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
                placeholder="السعر"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
                placeholder="العدد (×)"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
              />
            </div>
            <input
              type="number"
              min="1"
              max="35"
              className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
              placeholder="عدد النسخ"
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
            />
          </div>
        </section>

        {/* قسم التصميم */}
        <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold mb-2 text-amber-300">تصميم الملصق</h2>

          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={labelWidth}
                onChange={(e) => setLabelWidth(e.target.value)}
                className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
                placeholder="العرض"
              />
              <input
                type="number"
                value={labelHeight}
                onChange={(e) => setLabelHeight(e.target.value)}
                className="p-2 rounded bg-transparent border border-white/20 text-white placeholder:text-gray-300"
                placeholder="الطول"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={fontPerfume}
                onChange={(e) => setFontPerfume(e.target.value)}
                className="p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="خط العطر"
              />
              <input
                type="number"
                value={fontShop}
                onChange={(e) => setFontShop(e.target.value)}
                className="p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="خط المحل"
              />
              <input
                type="number"
                value={fontPrice}
                onChange={(e) => setFontPrice(e.target.value)}
                className="p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="خط السعر"
              />
            </div>
          </div>

          {/* رفع الشعار */}
          <div className="mt-4">
            <label className="block text-sm mb-1 text-gray-300">تغيير الشعار</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-sm text-gray-300"
            />
            {logo && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(logo)}
                  alt="logo preview"
                  className="w-16 h-16 object-contain mx-auto"
                />
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                value={logoSize}
                onChange={(e) => setLogoSize(e.target.value)}
                className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="حجم الشعار"
              />
              <input
                type="number"
                value={logoYPosition}
                onChange={(e) => setLogoYPosition(e.target.value)}
                className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="موضع الشعار"
              />
            </div>
          </div>
        </section>

        {/* الحقول الإضافية */}
        <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold mb-2 text-amber-300">حقول إضافية</h2>
          {extraFields.map((f, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="التسمية"
                value={f.label}
                onChange={(e) => updateExtraField(i, { ...f, label: e.target.value })}
              />
              <input
                className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white"
                placeholder="القيمة"
                value={f.value}
                onChange={(e) => updateExtraField(i, { ...f, value: e.target.value })}
              />
              <button
                onClick={() => removeExtraField(i)}
                className="px-3 bg-red-500 rounded text-white"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addExtraField}
            className="mt-2 px-4 py-2 bg-amber-500 text-black rounded font-semibold"
          >
            ➕ إضافة حقل
          </button>
        </section>

        {/* الطباعة */}
        <section className="text-center">
          <button
            onClick={handlePrint}
            disabled={loading}
            className="px-6 py-3 bg-amber-400 text-black font-bold rounded-lg w-full md:w-auto"
          >
            {loading ? "جاري إنشاء الملف..." : "📄 طباعة / تحميل PDF"}
          </button>
        </section>

      </div>
    </div>
  );
}