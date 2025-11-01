import React, { useState } from "react";

/*
  App.jsx
  - Tabs: Settings | Templates | Preview & Print
  - Sends POST /upload_logo (optional) then POST /generate_label
  - Expects backend with LabelSettings model:
    {
      shop_name, copies, label_width_mm, label_height_mm, radius_mm,
      font_perfume_name, font_shop_name, font_perfume_size, font_shop_size, font_price_size,
      templates: [{perfume_name, price, multiplier, shop_name, extra_fields?}, ...]
    }
*/

const BACKEND_BASE = "https://perfume-label-backend.onrender.com"; // <- غيّره هنا إذا لزم

const defaultSettings = {
  shop_name: "",
  copies: 4,
  label_width_mm: 40,   // mm
  label_height_mm: 40,  // mm
  radius_mm: 2,
  font_perfume_name: "Helvetica-Bold",
  font_shop_name: "Times-Italic",
  font_perfume_size: 14,
  font_shop_size: 10,
  font_price_size: 10,
};

export default function App() {
  const [tab, setTab] = useState("settings"); // 'settings' | 'templates' | 'preview'
  const [settings, setSettings] = useState(defaultSettings);
  const [templates, setTemplates] = useState([
    { perfume_name: "", price: "", multiplier: "", shop_name: "" },
  ]);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // helpers validators
  const isDigits = (s) => /^\d*$/.test(String(s));
  const clampCopies = (v) => Math.max(1, Math.min(35, Number(v) || 1));

  // handle settings change
  function updateSettings(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  // template manipulation
  function addTemplate() {
    setTemplates((t) => [...t, { perfume_name: "", price: "", multiplier: "", shop_name: "" }]);
    setPreviewIndex(templates.length);
  }
  function updateTemplate(idx, key, value) {
    setTemplates((t) => {
      const arr = [...t];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  }
  function removeTemplate(idx) {
    setTemplates((t) => t.filter((_, i) => i !== idx));
    setPreviewIndex((p) => Math.max(0, p - 1));
  }

  // upload logo to backend
  async function uploadLogoIfAny() {
    if (!logoFile) return { ok: true };
    const fd = new FormData();
    fd.append("file", logoFile);
    try {
      const res = await fetch(`${BACKEND_BASE}/upload_logo`, {
        method: "POST",
        body: fd,
      });
      return res;
    } catch (err) {
      console.error("uploadLogo error", err);
      return { ok: false, error: err };
    }
  }

  // validation before sending
  function validateAll() {
    // settings
    if (!settings.shop_name || String(settings.shop_name).trim() === "") {
      alert("الرجاء إدخال اسم المحل في الإعدادات.");
      setTab("settings");
      return false;
    }
    if (!settings.label_width_mm || !settings.label_height_mm) {
      alert("الرجاء إدخال أبعاد الملصق بالـ mm.");
      setTab("settings");
      return false;
    }
    // check A4 limits
    const maxWmm = (595.28) / 2.83465; // A4 width points -> mm approx (595.28 pt)
    const maxHmm = (841.89) / 2.83465;
    if (Number(settings.label_width_mm) > maxWmm || Number(settings.label_height_mm) > maxHmm) {
      alert(`الأبعاد أكبر من صفحة A4. أقصى عرض ≈ ${Math.floor(maxWmm)}mm، أقصى ارتفاع ≈ ${Math.floor(maxHmm)}mm`);
      setTab("settings");
      return false;
    }
    if (!templates || templates.length === 0) {
      alert("يجب إضافة قالب واحد على الأقل في Templates.");
      setTab("templates");
      return false;
    }
    // validate templates: perfume_name required; price and multiplier digits only
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      if (!t.perfume_name || String(t.perfume_name).trim() === "") {
        alert(`الرجاء إدخال اسم العطر في القالب رقم ${i + 1}.`);
        setTab("templates");
        return false;
      }
      if (t.price && !isDigits(t.price)) {
        alert(`السعر يجب أن يحتوي أرقامًا فقط في القالب رقم ${i + 1}.`);
        setTab("templates");
        return false;
      }
      if (t.multiplier && !isDigits(t.multiplier)) {
        alert(`الكمية (×) يجب أن تكون رقمًا فقط في القالب رقم ${i + 1}.`);
        setTab("templates");
        return false;
      }
    }
    // copies range
    if (!settings.copies || settings.copies < 1 || settings.copies > 35) {
      alert("عدد النسخ يجب أن يكون بين 1 و 35.");
      setTab("settings");
      return false;
    }
    return true;
  }

  // generate and open PDF
  async function handlePrintAll() {
    if (!validateAll()) return;
    setLoading(true);
    try {
      // 1) upload logo if exists
      const up = await uploadLogoIfAny();
      if (!up.ok) {
        const txt = await up.text().catch(()=>null);
        alert("فشل رفع اللوجو: " + (txt || up.status));
        setLoading(false);
        return;
      }

      // 2) prepare payload (backend expects mm for label dims and templates array)
      // 2) إعداد الحمولة (payload)
      const payload = {
       shop_name: "okpe",
       copies: 4,
       label_width_mm: 40,
       label_height_mm: 40,
       radius_mm: 2,
       font_perfume_name: "Helvetica-Bold",
       font_shop_name: "Times-Italic",
       font_perfume_size: 14,
       font_shop_size: 10,
       font_price_size: 10,
       templates: [
        {
         perfume_name: "kopkvd",
         price: "3520",
         multiplier: "5",
         shop_name: "opkgred"
        }
      ]
    };


console.log("📦 Payload being sent to backend:", JSON.stringify(payload, null, 2));


      const res = await fetch(`${BACKEND_BASE}/generate_label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        alert("خطأ من الخادم: " + (txt || res.status));
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // open in new tab (mobile will allow print/share)
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء عملية الإنشاء. تحقق من الكونسول.");
    } finally {
      setLoading(false);
    }
  }

  // small preview render for one template at previewIndex
  function PreviewCard({ t }) {
    const fontPerf = settings.font_perfume_size || 12;
    const fontShop = settings.font_shop_size || 10;
    const fontPrice = settings.font_price_size || 10;
    const radius = Number(settings.radius_mm || 0);
    return (
      <div className="w-full max-w-xs bg-white/5 rounded-lg p-4 flex flex-col items-center gap-3">
        <div style={{
          width: "180px",
          height: "180px",
          borderRadius: `${Math.max(0, Math.min(20, radius*1.5))}px`,
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12
        }}>
          <div style={{width: "60%", height: 36, background: "rgba(255,255,255,0.06)", borderRadius: 6}} />
          <div style={{textAlign: "center"}}>
            <div style={{fontSize: `${fontPerf}px`, fontWeight: 700}}>{t.perfume_name}</div>
            <div style={{fontSize: `${fontShop}px`, fontStyle: "italic"}}>{t.shop_name || settings.shop_name}</div>
          </div>
          <div style={{fontSize: `${fontPrice}px`}}>{t.price ? `${t.price} د.ج ${t.multiplier ? `(×${t.multiplier})` : ""}` : ""}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] to-[#2b1f12] p-4 text-white font-sans">
      <div className="max-w-lg mx-auto space-y-4">

        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-300">Amine Perfume — مولّد الملصقات</h1>
          <div className="flex gap-2">
            <button onClick={()=>setTab("settings")} className={`px-3 py-1 rounded ${tab==="settings" ? "bg-amber-400 text-black" : "bg-white/5"}`}>الإعدادات</button>
            <button onClick={()=>setTab("templates")} className={`px-3 py-1 rounded ${tab==="templates" ? "bg-amber-400 text-black" : "bg-white/5"}`}>Templates</button>
            <button onClick={()=>setTab("preview")} className={`px-3 py-1 rounded ${tab==="preview" ? "bg-amber-400 text-black" : "bg-white/5"}`}>معاينة</button>
          </div>
        </header>

        {/* CONTENT */}
        {tab === "settings" && (
          <section className="bg-white/6 p-4 rounded-xl shadow-sm space-y-3">

            <label className="block text-sm text-gray-300">اسم المحل</label>
            <input className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.shop_name} onChange={(e)=>updateSettings("shop_name", e.target.value)} />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300">عرض الملصق (mm)</label>
                <input type="number" min="5" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.label_width_mm} onChange={(e)=>updateSettings("label_width_mm", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-300">ارتفاع الملصق (mm)</label>
                <input type="number" min="5" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.label_height_mm} onChange={(e)=>updateSettings("label_height_mm", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300">عدد النسخ (1-35)</label>
                <input type="number" min="1" max="35" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.copies} onChange={(e)=>updateSettings("copies", clampCopies(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm text-gray-300">زاوية الإطار (mm)</label>
                <input type="range" min="0" max="8" step="0.5" className="w-full" value={settings.radius_mm} onChange={(e)=>updateSettings("radius_mm", e.target.value)} />
                <div className="text-xs text-gray-400">قيمة: {settings.radius_mm} mm</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm text-gray-300">حجم خط العطر</label>
                <input type="number" min="6" max="72" className="w-full p-2 rounded bg-transparent border border-white/20" value={settings.font_perfume_size} onChange={(e)=>updateSettings("font_perfume_size", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">حجم خط المحل</label>
                <input type="number" min="6" max="72" className="w-full p-2 rounded bg-transparent border border-white/20" value={settings.font_shop_size} onChange={(e)=>updateSettings("font_shop_size", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">حجم خط السعر</label>
                <input type="number" min="6" max="72" className="w-full p-2 rounded bg-transparent border border-white/20" value={settings.font_price_size} onChange={(e)=>updateSettings("font_price_size", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300">رفع اللوجو (اختياري)</label>
              <input type="file" accept="image/*" onChange={(e)=>setLogoFile(e.target.files[0])} className="text-sm text-gray-300" />
              <div className="text-xs text-gray-400 mt-1">بعد رفع اللوجو سيُرسَل إلى الخادم قبل توليد PDF.</div>
            </div>
          </section>
        )}

        {tab === "templates" && (
          <section className="bg-white/6 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">قوالب الملصقات</h3>
              <button onClick={addTemplate} className="px-3 py-1 bg-amber-400 text-black rounded">+ جديد</button>
            </div>

            <div className="space-y-3">
              {templates.map((t, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded space-y-2 border border-white/10">
                  <div className="flex justify-between items-start">
                    <strong>قالب #{idx+1}</strong>
                    <div className="flex gap-2">
                      <button onClick={()=>removeTemplate(idx)} className="px-2 py-1 bg-red-600 rounded text-sm">حذف</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">اسم العطر</label>
                    <input className="w-full p-2 rounded bg-transparent border border-white/20" value={t.perfume_name} onChange={(e)=>updateTemplate(idx,"perfume_name", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-300">السعر (د.ج)</label>
                      <input inputMode="numeric" pattern="[0-9]*" className="w-full p-2 rounded bg-transparent border border-white/20" value={t.price} onChange={(e)=> {
                        if (isDigits(e.target.value)) updateTemplate(idx,"price", e.target.value);
                      }} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-300">× الكمية</label>
                      <input inputMode="numeric" pattern="[0-9]*" className="w-full p-2 rounded bg-transparent border border-white/20" value={t.multiplier} onChange={(e)=> {
                        if (isDigits(e.target.value)) updateTemplate(idx,"multiplier", e.target.value);
                      }} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">اسم المحل (اختياري للقالب)</label>
                    <input className="w-full p-2 rounded bg-transparent border border-white/20" value={t.shop_name} onChange={(e)=>updateTemplate(idx,"shop_name", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "preview" && (
          <section className="bg-white/6 p-4 rounded-xl space-y-3">
            <h3 className="font-semibold">معاينة سريعة</h3>
            <div className="flex gap-3 overflow-x-auto py-2">
              {templates.map((t, i)=>(
                <div key={i} onClick={()=>setPreviewIndex(i)} className={`cursor-pointer ${i===previewIndex ? "ring-2 ring-amber-400" : ""}`}>
                  <PreviewCard t={templates[i]} />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={handlePrintAll} disabled={loading} className="flex-1 py-3 bg-amber-400 text-black rounded font-semibold">{loading ? "جاري الإنشاء..." : "🖨️ طباعة الكل / تحميل PDF"}</button>
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({settings, templates}, null,2)); alert("نسخ الإعدادات") }} className="py-3 px-3 bg-white/5 rounded">نسخ JSON</button>
            </div>
          </section>
        )}

        {/* footer small */}
        <footer className="text-xs text-gray-400 text-center py-4">
          تذكير: الطباعة من الهاتف تفتح PDF ثم استخدم خيار الطباعة من متصفح الهاتف أو مشاركة الملف لطابعة متصلة.
        </footer>
      </div>
    </div>
  );
}