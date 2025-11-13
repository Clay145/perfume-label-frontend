import React, { useState, useEffect } from "react";
import Preview from "./components/Preview.jsx";
import TemplateEditor from "./components/TemplateEditor.jsx";
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
  // 🧠 نحاول قراءة أي بيانات محفوظة قبل إنشاء الحالة
  const saved = localStorage.getItem("labelAppData");
  const parsed = saved ? JSON.parse(saved) : {};

  const [tab, setTab] = useState("settings"); // 'settings' | 'templates' | 'preview'
  const [settings, setSettings] = useState(parsed.settings || defaultSettings);
  const [templates, setTemplates] = useState(parsed.templates || [
    {
      perfume_name: "", price: "", multiplier: "", shop_name: "", id: 1,
    }
  ]);
  const currentTemplate = {
    width: 400,
    height: 250,
    elements: [
      { id: "logo", label: "🪶 شعار", type: "image", x: 10, y: 10, width: 60, height: 60 },
      { id: "product_name", label: "اسم العطر", type: "text", x: 100, y: 20, fontSize: 18 },
      { id: "shop_name", label: "اسم المحل", type: "text", x: 100, y: 60, fontSize: 14 },
      { id: "price", label: "السعر", type: "text", x: 100, y: 100, fontSize: 16 },
    ],
  };

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  // 1) أعلى الملف داخل component state — أضف:
  const [theme, setTheme] = useState("gold_black"); // "gold_black" | "custom"
  const [primaryColor, setPrimaryColor] = useState("#D4AF37"); // gold default
  const [accentColor, setAccentColor] = useState("#080808");   // black default
  const [selectedFont, setSelectedFont] = useState("Playfair"); // اسم الخط الذي سترسله للخادم
  const [phoneNumber, setPhoneNumber] = useState(""); // رقم المحل العام
  const [labelData, setLabelData] = useState({
    name: "",
    logo: "",
    price: "",
    volume: "",
    phone: "",
    positions: {},
  });
  const [editMode, setEditMode] = useState(false);
  const [borderColor, setBorderColor] = useState("#D4AF37");

  useEffect(() => {
    const data = {
      templates,
      settings,
      theme,
      primaryColor,
      accentColor,
      selectedFont,
      phoneNumber,
      borderColor
    };
    localStorage.setItem("labelAppData", JSON.stringify(data));
  }, [templates, settings, theme, primaryColor, accentColor, selectedFont, phoneNumber, borderColor]);

  // 🔹 حفظ البيانات عند أي تغيير
  useEffect(() => {
    const saved = localStorage.getItem("labelAppData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.templates) setTemplates(parsed.templates);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.primaryColor) setPrimaryColor(parsed.primaryColor);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
        if (parsed.selectedFont) setSelectedFont(parsed.selectedFont);
        if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
        if (parsed.borderColor) setBorderColor(parsed.borderColor);
      } catch (e) {
        console.error("❌ خطأ في قراءة البيانات المحفوظة:", e);
      }
    }
  }, []);


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
  // داخل App.jsx
  const handleTemplateSave = (updatedTemplate) => {
    const updatedTemplates = templates.map((t, idx) =>
      idx === previewIndex ? updatedTemplate : t
    );
    setTemplates(updatedTemplates);
  };

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
        const txt = await up.text().catch(() => null);
        alert("فشل رفع اللوجو: " + (txt || up.status));
        setLoading(false);
        return;
      }

      // 2) إعداد الحمولة (payload)
      const payload = {
        shopName: settings.shop_name,
        copies: Number(settings.copies),
        labelWidth: Number(settings.label_width_mm),
        labelHeight: Number(settings.label_height_mm),
        borderRadius: Number(settings.radius_mm),
        fontSettings: {
          perfumeFont: selectedFont || settings.font_perfume_name,
          perfumeSize: Number(settings.font_perfume_size),
          shopFont: settings.font_shop_name,
          shopSize: Number(settings.font_shop_size),
          priceFont: "Helvetica-Bold",
          priceSize: Number(settings.font_price_size),
          quantityFont: "Helvetica",
          quantitySize: 9,
        },
        style: {
          theme: theme,
          primaryColor: primaryColor,  // send hex strings; backend should parse
          accentColor: accentColor,
          borderColor: borderColor
        },
        phone: phoneNumber,
        templates: templates.map(t => ({
          perfumeName: t.perfume_name,
          price: t.price,
          multiplier: t.multiplier,
          shopName: t.shop_name,
          extraInfo: t.extra_info || "",
        })),
      };

      console.log("📦 Payload being sent to backend:", JSON.stringify(payload, null, 2));


      const res = await fetch(`${BACKEND_BASE}/generate_label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
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
          borderRadius: `${Math.max(0, Math.min(20, radius * 1.5))}px`,
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12
        }}>
          <div style={{ width: "60%", height: 36, background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: `${fontPerf}px`, fontWeight: 700 }}>{t.perfume_name}</div>
            <div style={{ fontSize: `${fontShop}px`, fontStyle: "italic" }}>{t.shop_name || settings.shop_name}</div>
          </div>
          <div style={{ fontSize: `${fontPrice}px` }}>{t.price ? `${t.price} د.ج ${t.multiplier ? `(×${t.multiplier})` : ""}` : ""}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] to-[#2b1f12] p-4 text-white font-sans">
      <div className="max-w-lg mx-auto space-y-4">

        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-300">Amine Perfume </h1>
          <div className="flex gap-2">
            <button onClick={() => setTab("settings")} className={`px-3 py-1 rounded ${tab === "settings" ? "bg-amber-400 text-black" : "bg-white/5"}`}>الإعدادات</button>
            <button onClick={() => setTab("templates")} className={`px-3 py-1 rounded ${tab === "templates" ? "bg-amber-400 text-black" : "bg-white/5"}`}>Templates</button>
            <button onClick={() => setTab("editor")} className={`px-3 py-1 rounded ${tab === "editor" ? "bg-amber-400 text-black" : "bg-white/5"}`}>تعديل الأماكن</button>
            <button onClick={() => setTab("preview")} className={`px-3 py-1 rounded ${tab === "preview" ? "bg-amber-400 text-black" : "bg-white/5"}`}>معاينة</button>
            <button onClick={() => {
                localStorage.removeItem("labelAppData");
                alert("تم حذف الإعدادات السابقة");
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              🗑️ مسح الإعدادات
            </button>
          </div>
        </header>

        {/* CONTENT */}
        {tab === "settings" && (
          <section className="bg-white/6 p-4 rounded-xl shadow-sm space-y-3">
            <label className="block text-sm text-gray-300">اسم المحل</label>
            <input className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.shop_name} onChange={(e) => updateSettings("shop_name", e.target.value)} />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300">عرض الملصق (mm)</label>
                <input type="number" min="5" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.label_width_mm} onChange={(e) => updateSettings("label_width_mm", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-300">ارتفاع الملصق (mm)</label>
                <input type="number" min="5" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.label_height_mm} onChange={(e) => updateSettings("label_height_mm", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-300">عدد النسخ (1-35)</label>
                <input type="number" min="1" max="35" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" value={settings.copies} onChange={(e) => updateSettings("copies", clampCopies(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm text-gray-300">زاوية الإطار (mm)</label>
                <input type="range" min="0" max="8" step="0.5" className="w-full" value={settings.radius_mm} onChange={(e) => updateSettings("radius_mm", e.target.value)} />
                <div className="text-xs text-gray-400">قيمة: {settings.radius_mm} mm</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm text-gray-300">حجم خط العطر</label>
                <input type="number" min="6" max="72" className="w-full p-2 rounded bg-transparent border border-white/20" value={settings.font_perfume_size} onChange={(e) => updateSettings("font_perfume_size", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">حجم خط المحل</label>
                <input type="number" min="6" max="72" className="w-full p-2 rounded bg-transparent border border-white/20" value={settings.font_shop_size} onChange={(e) => updateSettings("font_shop_size", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">حجم خط السعر</label>
                <input type="number" min="6" max="72" className="w-full p-2 rounded bg-transparent border border-white/20" value={settings.font_price_size} onChange={(e) => updateSettings("font_price_size", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300">رفع اللوجو (اختياري)</label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="text-sm text-gray-300" />
              <div className="text-xs text-gray-400 mt-1">بعد رفع اللوجو سيُرسَل إلى الخادم قبل توليد PDF.</div>
            </div>
          </section>
        )}
        {/* Style / Theme */}
        <div className="mt-3 p-3 bg-white/4 rounded">
          <label className="block text-sm text-gray-300 font-semibold mb-1">المظهر (Style)</label>
          <div className="flex gap-2 items-center mb-2">
            <button onClick={() => { setTheme("gold_black"); setPrimaryColor("#D4AF37"); setAccentColor("#080808"); }} className={`px-2 py-1 rounded ${theme === "gold_black" ? "bg-amber-400 text-black" : "bg-white/5"}`}>ذهب/أسود</button>
            <button onClick={() => setTheme("custom")} className={`px-2 py-1 rounded ${theme === "custom" ? "bg-amber-400 text-black" : "bg-white/5"}`}>مخصص</button>
          </div>

          {theme === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              {/* لون النص الرئيسي */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">لون النص الرئيسي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-white/30"
                  />
                  <span className="text-sm text-white">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300">لون الإطار (اختياري)</label>
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-full h-8 rounded border border-white/20"
                />
              </div>

              {/* لون الخلفية / التدرج */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">لون الخلفية / التدرج</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-white/30"
                  />
                  <span className="text-sm text-white">{accentColor}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-300">اختر خط (سيُرسل للخادم)</label>
              <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="w-full p-2 rounded bg-transparent border border-white/20 text-white">
                <option value="Playfair">Playfair Display (elegant)</option>
                <option value="Cinzel">Cinzel (decorative)</option>
                <option value="Amiri">Amiri (Arabic serif)</option>
                <option value="Helvetica-Bold">Helvetica (system fallback)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-300">رقم المحل (اختياري)</label>
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="مثال: +213 123 456 789" className="w-full p-2 rounded bg-transparent border border-white/20 text-white" />
            </div>
          </div>
        </div>

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
                    <strong>قالب #{idx + 1}</strong>
                    <div className="flex gap-2">
                      <button onClick={() => removeTemplate(idx)} className="px-2 py-1 bg-red-600 rounded text-sm">حذف</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">اسم العطر</label>
                    <input className="w-full p-2 rounded bg-transparent border border-white/20" value={t.perfume_name} onChange={(e) => updateTemplate(idx, "perfume_name", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-300">السعر (د.ج)</label>
                      <input inputMode="numeric" pattern="[0-9]*" className="w-full p-2 rounded bg-transparent border border-white/20" value={t.price} onChange={(e) => {
                        if (isDigits(e.target.value)) updateTemplate(idx, "price", e.target.value);
                      }} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-300">× الكمية</label>
                      <input inputMode="numeric" pattern="[0-9]*" className="w-full p-2 rounded bg-transparent border border-white/20" value={t.multiplier} onChange={(e) => {
                        if (isDigits(e.target.value)) updateTemplate(idx, "multiplier", e.target.value);
                      }} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">اسم المحل (اختياري )</label>
                    <input className="w-full p-2 rounded bg-transparent border border-white/20" value={t.shop_name} onChange={(e) => updateTemplate(idx, "shop_name", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">أي إضافات في المعلومات (اختياري)</label>
                    <textarea
                      className="w-full p-2 rounded bg-transparent border border-white/20"
                      value={t.extra_info || ""}
                      onChange={(e) => updateTemplate(idx, "extra_info", e.target.value)}
                      placeholder="أضف ملاحظات، مكونات، أو أي معلومات إضافية"
                    />
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "preview" && (
          <section className="bg-white/6 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">معاينة سريعة</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-3 py-2 rounded font-semibold ${editMode ? "bg-green-500 text-white" : "bg-amber-400 text-black"
                  }`}
              >
                {editMode ? "🧩 وضع المعاينة" : "✏️ تعديل الأماكن"}
              </button>
            </div>

            {/* دمج بيانات الإعدادات والقالب المختار */}
            <Preview
              template={currentTemplate}
              data={settings}
              editable={editMode}
              onPositionsSave={handleTemplateSave}
            />


            {/* قائمة القوالب */}
            <div className="flex gap-3 overflow-x-auto py-2">
              {templates.map((t, i) => (
                <div
                  key={i}
                  onClick={() => setPreviewIndex(i)}
                  className={`cursor-pointer ${i === previewIndex ? "ring-2 ring-amber-400" : ""}`}
                >
                  <PreviewCard t={t} />
                </div>
              ))}
            </div>

            {/* أزرار الطباعة ونسخ الإعدادات */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handlePrintAll}
                disabled={loading}
                className="flex-1 py-3 bg-amber-400 text-black rounded font-semibold"
              >
                {loading ? "جاري الإنشاء..." : "🖨️ طباعة الكل / تحميل PDF"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({ settings, templates }, null, 2));
                  alert("نسخ JSON");
                }}
                className="py-3 px-3 bg-white/5 rounded"
              >
                نسخ JSON
              </button>
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