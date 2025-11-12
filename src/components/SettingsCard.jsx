export default function SettingsCard({ labelData, setLabelData }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={labelData.name}
        onChange={(e) => setLabelData({ ...labelData, name: e.target.value })}
        placeholder="اسم العطر"
        className="bg-white/10 p-2 rounded w-full"
      />
      <input
        type="text"
        value={labelData.price}
        onChange={(e) => setLabelData({ ...labelData, price: e.target.value })}
        placeholder="السعر"
        className="bg-white/10 p-2 rounded w-full"
      />
      <input
        type="text"
        value={labelData.volume}
        onChange={(e) => setLabelData({ ...labelData, volume: e.target.value })}
        placeholder="الحجم"
        className="bg-white/10 p-2 rounded w-full"
      />
      <input
        type="text"
        value={labelData.phone}
        onChange={(e) => setLabelData({ ...labelData, phone: e.target.value })}
        placeholder="رقم الهاتف"
        className="bg-white/10 p-2 rounded w-full"
      />
    </div>
  );
}