import { useState } from "react";

/**
 * App.jsx
 * واجهة تحكم ديناميكية لإعداد الملصق ثم طلب توليد PDF من backend
 *
 * ملاحظة: تأكد أن backend يستقبل POST على /generate_label كما في main.py الذي أعددناه.
 * وعدّل BACKEND_URL أسفل هذا الملف إذا كان مختلفًا.
 */

const BACKEND_URL = "https://perfume-label-backend.onrender.com/generate_label";

function ExtraFieldRow({ idx, field, onChange, onRemove }) {
  return (
    <div className="flex gap-2 mb-2 items-center">
      <input
        type="text"
        placeholder="حقل (مثلاً: بلد المنشأ)"
        className="flex-1 p-2 rounded border bg-transparent text-white placeholder:text-gray-300"
        value={field.label}
        onChange={(e) => onChange(idx, { ...field, label: e.target.value })}
      />
      <input
        type="text"
        placeholder="القيمة"
        className="flex-1 p-2 rounded border bg-transparent text-white placeholder:text-gray-300"
        value={field.value}
        onChange={(e) => onChange(idx, { ...field, value: e.target.value })}
      />
      <button
        onClick={() => onRemove(idx)}
        className="px-3 py-2 bg-red-500 rounded text-white"
        title="حذف"
      >
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const [perfume, setPerfume] = useState("");
  const [shop, setShop] = useState("");
  const [price, setPrice] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [copies, setCopies] = useState(1);

  // إعدادات تصميم الملصق
  const [labelWidth, setLabelWidth] = useState(113.39); // نقاط (تقريباً 4 سم)
  const [labelHeight, setLabelHeight] = useState(113.39);
  const [fontPerfume, setFontPerfume] = useState(10);
  const [fontShop, setFontShop] = useState(8);
  const [fontPrice, setFontPrice] = useState(9);
  const [extraFields, setExtraFields] = useState([]);

  const [loading, setLoading] = useState(false);

  const addExtraField = () => {
    setExtraFields([...extraFields, { label: "", value: "" }]);
  };

  const updateExtraField = (idx, val) => {
    const arr = [...extraFields];
    arr[idx] = val;
    setExtraFields(arr);
  };

  const removeExtraField = (idx) => {
    const arr = [...extraFields];
    arr.splice(idx, 1);
    setExtraFields(arr);
  };

  const handlePrint = async () => {
    if (!perfume.trim() || !shop.trim()) {
      alert("الرجاء إدخال اسم العطر واسم المحل");
      return;
    }

    if (copies < 1 || copies > 35) {
      alert("عدد الملصقات يجب أن يكون بين 1 و 35");
      return;
    }

    // تجميع الإعدادات في JSON
    const payload = {
      perfume_name: perfume.trim(),
      shop_name: shop.trim(),
      price: price.trim(),
      multiplier: multiplier.trim(),
      copies: Number(copies),
      label_width: Number(labelWidth),
      label_height: Number(labelHeight),
      font_perfume: Number(fontPerfume),
      font_shop: Number(fontShop),
      font_price: Number(fontPrice),
      extra_fields: extraFields.filter(f => f.label.trim() || f.value.trim()),
    };

    setLoading(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("backend error:", res.status, txt);
        throw new Error(`خطأ من الخادم: ${res.status}`);
      }

      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);
      // نفتح الـ PDF في نافذة جديدة (متوافق مع الهاتف والكمبيوتر)
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء طلب الطباعة. تحقق من اتصال الإنترنت أو من خادم الـ backend.");
    } finally {
      setLoading(false);
    }
  };

  // معاينة مبسطة: نعرض مربعًا يمثل الملصق (مقاس نسبي للعرض)
  const previewScale = 0.5; // اضبط للمشاهدة
  const previewW = Math.max(40, labelWidth * previewScale);
  const previewH = Math.max(30, labelHeight * previewScale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#3a2a1a] flex items-start justify-center py-8 px-4 text-white font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* لوحة الإعدادات */}
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-amber-300">إعداد الملصق</h2>

          <label className="block text-sm text-gray-300 mb-1">اسم العطر</label>
          <input value={perfume} onChange={e=>setPerfume(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-transparent border border-white/20 text-white"/>

          <label className="block text-sm text-gray-300 mb-1">اسم المحل</label>
          <input value={shop} onChange={e=>setShop(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-transparent border border-white/20 text-white"/>

          <div className="flex gap-2 mb-3">
            <input placeholder="السعر (اختياري)" value={price} onChange={e=>setPrice(e.target.value)}
              className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white" />
            <input placeholder="الضرب (مثلاً 2)" value={multiplier} onChange={e=>setMultiplier(e.target.value)}
              className="w-28 p-2 rounded bg-transparent border border-white/20 text-white" />
          </div>

          <label className="block text-sm text-gray-300 mb-1">عدد الملصقات (1-35)</label>
          <input type="number" min="1" max="35" value={copies} onChange={e=>setCopies(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-transparent border border-white/20 text-white"/>

          <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-200">حجم الملصق (نقطة)</h3>
          <div className="flex gap-2 mb-3">
            <input type="number" step="1" value={labelWidth} onChange={e=>setLabelWidth(e.target.value)}
              className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white" />
            <input type="number" step="1" value={labelHeight} onChange={e=>setLabelHeight(e.target.value)}
              className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white" />
          </div>
          <div className="text-xs text-gray-400 mb-3">ملاحظة: القيمة الافتراضية 113.39 ≈ 4 سم</div>

          <h3 className="mt-2 mb-2 text-sm font-semibold text-gray-200">أحجام الخطوط</h3>
          <div className="flex gap-2 mb-3">
            <input type="number" value={fontPerfume} onChange={e=>setFontPerfume(e.target.value)}
              className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white" />
            <input type="number" value={fontShop} onChange={e=>setFontShop(e.target.value)}
              className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white" />
            <input type="number" value={fontPrice} onChange={e=>setFontPrice(e.target.value)}
              className="flex-1 p-2 rounded bg-transparent border border-white/20 text-white" />
          </div>
          <div className="text-xs text-gray-400 mb-3">ترتيب الحقول: حجم اسم العطر، اسم المحل، السعر</div>

          <h3 className="mt-3 mb-2 text-sm font-semibold text-gray-200">حقول إضافية</h3>
          {extraFields.map((f, i) => (
            <ExtraFieldRow key={i} idx={i} field={f} onChange={updateExtraField} onRemove={removeExtraField} />
          ))}
          <div className="flex gap-2 mb-4">
            <button onClick={addExtraField} className="px-4 py-2 bg-amber-500 rounded text-black">إضافة حقل</button>
            <button onClick={()=>setExtraFields([])} className="px-4 py-2 bg-gray-700 rounded text-white">مسح الحقول</button>
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrint} disabled={loading}
              className="flex-1 px-4 py-3 bg-amber-500 rounded text-black font-semibold">
              {loading ? "جاري التحضير..." : "طباعة / تحميل PDF"}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({
              perfume_name: perfume, shop_name: shop, price, multiplier, copies,
              label_width: Number(labelWidth), label_height: Number(labelHeight),
              font_perfume: Number(fontPerfume), font_shop: Number(fontShop), font_price: Number(fontPrice),
              extra_fields: extraFields
            }, null, 2)); alert("تم نسخ الإعدادات كسجل JSON") }}
              className="px-3 py-3 bg-gray-800 rounded text-white">نسخ JSON</button>
          </div>
        </div>

        {/* معاينة الملصق (مبسط) */}
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-amber-300">معاينة سريعة</h2>

          <div className="mb-4 text-sm text-gray-300">المعاينة ليست مطابقة للطباعة 100% لكنها تظهر الترتيب العام.</div>

          <div className="flex justify-center mb-4">
            <div
              style={{
                width: `${previewW}px`,
                height: `${previewH}px`,
                borderRadius: "8px",
                border: "2px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px"
              }}
            >
              <div style={{ height: "30px", width: "60%", background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: `${fontPerfume * 0.9}px`, fontWeight: 700 }}>{perfume || "اسم العطر"}</div>
                <div style={{ fontSize: `${fontShop * 0.8}px`, fontStyle: "italic" }}>{shop || "اسم المحل"}</div>
              </div>
              <div style={{ fontSize: `${fontPrice * 0.8}px` }}>{price ? `السعر: ${price} ${multiplier ? `(${multiplier})` : ""}` : ""}</div>
            </div>
          </div>

          <div className="text-sm text-gray-300">
            • قم بضبط الأبعاد وخيارات النص ثم اضغط <span className="font-semibold text-white">طباعة / تحميل PDF</span>.
          </div>
        </div>
      </div>
    </div>
  );
}