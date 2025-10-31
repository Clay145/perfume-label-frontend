import { useState } from "react";

/**
 * App.jsx
 * واجهة تحكم متكاملة لمولد الملصقات
 *
 * تأكد تعديل BACKEND_BASE إلى رابط الباكند لديك.
 */

const BACKEND_BASE = "https://perfume-label-backend.onrender.com";

export default function App() {
  // بيانات أساسية
  const [perfume, setPerfume] = useState("");
  const [shop, setShop] = useState("");
  const [price, setPrice] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [copies, setCopies] = useState(1);

  // إعدادات التصميم (المستخدم يدخل القيم بالملّيمتر — نقوم بالتحويل إلى نقاط عند الإرسال)
  const [labelWidthMM, setLabelWidthMM] = useState(40); // افتراضي 40mm -> ~113.39pt
  const [labelHeightMM, setLabelHeightMM] = useState(40);
  const [fontPerfume, setFontPerfume] = useState(12);
  const [fontShop, setFontShop] = useState(10);
  const [fontPrice, setFontPrice] = useState(9);

  // لوجو
  const [logoFile, setLogoFile] = useState(null);
  const [logoSize, setLogoSize] = useState(30); // بالـ points (سيُرسل كما هو)
  const [logoYOffset, setLogoYOffset] = useState(40); // مسافة من أعلى الملصق بالـ points

  // حقول إضافية (قائمة من {label, value})
  const [extraFields, setExtraFields] = useState([]);

  // لغة العرض (ar / en)
  const [language, setLanguage] = useState("ar");

  const [loading, setLoading] = useState(false);

  // تحويل mm -> points (ReportLab uses points; 1 mm ≈ 2.83465 points)
  const mmToPt = (mm) => parseFloat(mm) * 2.83465;

  // رفع الشعار أولاً (ينشئ logo.png على الخادم)
  const uploadLogo = async () => {
    if (!logoFile) return { ok: true };
    const fd = new FormData();
    fd.append("file", logoFile);
    const res = await fetch(`${BACKEND_BASE}/upload_logo`, {
      method: "POST",
      body: fd,
    });
    return res;
  };

  const addExtraField = () => setExtraFields([...extraFields, { label: "", value: "" }]);
  const updateExtraField = (i, v) => {
    const arr = [...extraFields];
    arr[i] = v;
    setExtraFields(arr);
  };
  const removeExtraField = (i) => {
    const arr = [...extraFields];
    arr.splice(i, 1);
    setExtraFields(arr);
  };

  const handleGenerate = async () => {
    if (!perfume.trim() || !shop.trim()) {
      alert("الرجاء إدخال اسم العطر واسم المحل.");
      return;
    }
    if (copies < 1 || copies > 35) {
      alert("عدد النسخ يجب أن يكون بين 1 و 35.");
      return;
    }

    setLoading(true);
    try {
      // 1) رفع الشعار (إن وُجد)
      if (logoFile) {
        const upRes = await uploadLogo();
        if (!upRes.ok) {
          const txt = await upRes.text();
          console.error("upload error:", upRes.status, txt);
          throw new Error("فشل رفع الشعار.");
        }
      }

      // 2) تجهيز الـ payload (نحوّل mm -> points)
      const payload = {
        perfume_name: perfume.trim(),
        shop_name: shop.trim(),
        price: price.trim(),
        multiplier: multiplier.trim(),
        copies: Number(copies),
        label_width: mmToPt(Number(labelWidthMM)), // convert to points
        label_height: mmToPt(Number(labelHeightMM)),
        font_perfume: Number(fontPerfume),
        font_shop: Number(fontShop),
        font_price: Number(fontPrice),
        logo_size: Number(logoSize),
        logo_y_offset: Number(logoYOffset),
        extra_fields: extraFields.filter(f => f.label.trim() || f.value.trim()),
        language,
      };

      const res = await fetch(`${BACKEND_BASE}/generate_label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("generate error:", res.status, txt);
        throw new Error("فشل إنشاء PDF من الخادم.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ. راجع الكونسول أو تحقق من الباكند وCORS.");
    } finally {
      setLoading(false);
    }
  };

  // معاينة مبسطة (عرض نصي وبلوك لوجو)
  const previewW = Math.max(80, (labelWidthMM * 2)); // مقاسات للتخطيط فقط
  const previewH = Math.max(80, (labelHeightMM * 2));

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#3a2a1a] p-4 font-sans text-white">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center text-amber-300">لوحة تحكم الملصق — Amine Perfume</h1>

        {/* بيانات */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="space-y-3">
            <input className="w-full p-2 rounded bg-transparent border border-white/20" placeholder="اسم العطر" value={perfume} onChange={e=>setPerfume(e.target.value)} />
            <input className="w-full p-2 rounded bg-transparent border border-white/20" placeholder="اسم المحل" value={shop} onChange={e=>setShop(e.target.value)} />

            <div className="grid grid-cols-2 gap-2">
              <input className="p-2 rounded bg-transparent border border-white/20" placeholder="السعر (اختياري)" value={price} onChange={e=>setPrice(e.target.value)} />
              <input className="p-2 rounded bg-transparent border border-white/20" placeholder="المضاعف (مثلاً 2)" value={multiplier} onChange={e=>setMultiplier(e.target.value)} />
            </div>

            <input type="number" min="1" max="35" className="w-full p-2 rounded bg-transparent border border-white/20" value={copies} onChange={e=>setCopies(e.target.value)} />
          </div>
        </div>

        {/* تصميم */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
          <h3 className="text-amber-300 font-semibold">تصميم الملصق (القيم بالـ mm)</h3>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={labelWidthMM} onChange={e=>setLabelWidthMM(e.target.value)} placeholder="عرض (مم)" />
            <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={labelHeightMM} onChange={e=>setLabelHeightMM(e.target.value)} placeholder="ارتفاع (مم)" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={fontPerfume} onChange={e=>setFontPerfume(e.target.value)} placeholder="حجم خط العطر" />
            <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={fontShop} onChange={e=>setFontShop(e.target.value)} placeholder="حجم خط المحل" />
            <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={fontPrice} onChange={e=>setFontPrice(e.target.value)} placeholder="حجم خط السعر" />
          </div>

          <div className="mt-2">
            <label className="block text-sm text-gray-300 mb-1">شعار (Logo)</label>
            <input type="file" accept="image/*" onChange={(e)=>setLogoFile(e.target.files[0])} className="text-sm text-gray-300" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={logoSize} onChange={e=>setLogoSize(e.target.value)} placeholder="حجم الشعار (نقطة)" />
              <input type="number" className="p-2 rounded bg-transparent border border-white/20" value={logoYOffset} onChange={e=>setLogoYOffset(e.target.value)} placeholder="موضع الشعار من الأعلى (نقطة)" />
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm text-gray-300 mb-1">اللغة</label>
            <select value={language} onChange={e=>setLanguage(e.target.value)} className="p-2 rounded bg-transparent border border-white/20">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* حقول إضافية */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-amber-300 font-semibold mb-2">حقول إضافية</h3>
          {extraFields.map((f,i)=>(
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="التسمية" value={f.label} onChange={e=>updateExtraField(i,{...f,label:e.target.value})} className="flex-1 p-2 rounded bg-transparent border border-white/20" />
              <input placeholder="القيمة" value={f.value} onChange={e=>updateExtraField(i,{...f,value:e.target.value})} className="flex-1 p-2 rounded bg-transparent border border-white/20" />
              <button onClick={()=>removeExtraField(i)} className="px-3 bg-red-500 rounded">✕</button>
            </div>
          ))}
          <button onClick={addExtraField} className="px-4 py-2 bg-amber-500 text-black rounded">➕ إضافة حقل</button>
        </div>

        {/* معاينة و طباعة */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
          <h3 className="text-amber-300 font-semibold">معاينة سريعة</h3>
          <div className="flex justify-center">
            <div style={{ width: previewW, height: previewH, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "60%", height: 30, background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: fontPerfume }}>{perfume || "اسم العطر"}</div>
                <div style={{ fontSize: fontShop, fontStyle: "italic" }}>{shop || "اسم المحل"}</div>
              </div>
              <div style={{ fontSize: fontPrice }}>{price ? `السعر: ${price} ${multiplier ? `(${multiplier})` : ""}` : ""}</div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-amber-400 text-black rounded font-bold">
            {loading ? "جاري إنشاء الملف..." : "طباعة / تحميل PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}