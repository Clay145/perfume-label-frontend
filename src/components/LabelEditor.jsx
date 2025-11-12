import React from "react";

export default function LabelEditor({ labelData, setLabelData }) {
  const handleDrag = (field, e) => {
    const rect = e.target.getBoundingClientRect();
    const parentRect = e.target.parentElement.getBoundingClientRect();
    const x = e.clientX - parentRect.left;
    const y = e.clientY - parentRect.top;
    setLabelData({
      ...labelData,
      positions: {
        ...labelData.positions,
        [field]: { x, y },
      },
    });
  };

  return (
    <div className="relative bg-[#111]/40 rounded-xl p-4 min-h-[500px]">
      {/* logo */}
      <div
        draggable
        onDragEnd={(e) => handleDrag("logo", e)}
        className="absolute cursor-move"
        style={{
          left: labelData.positions.logo.x,
          top: labelData.positions.logo.y,
        }}
      >
        {labelData.logo ? (
          <img src={labelData.logo} alt="Logo" className="w-16 h-16 object-contain" />
        ) : (
          <span className="text-gray-500 text-xs">Logo</span>
        )}
      </div>

      {/* perfume name */}
      <div
        draggable
        onDragEnd={(e) => handleDrag("name", e)}
        className="absolute cursor-move text-white font-bold"
        style={{
          left: labelData.positions.name.x,
          top: labelData.positions.name.y,
        }}
      >
        {labelData.name || "اسم العطر"}
      </div>

      {/* price */}
      <div
        draggable
        onDragEnd={(e) => handleDrag("price", e)}
        className="absolute cursor-move text-amber-300"
        style={{
          left: labelData.positions.price.x,
          top: labelData.positions.price.y,
        }}
      >
        {labelData.price ? `${labelData.price} د.ج` : "السعر"}
      </div>

      {/* volume */}
      <div
        draggable
        onDragEnd={(e) => handleDrag("volume", e)}
        className="absolute cursor-move text-gray-300 text-sm"
        style={{
          left: labelData.positions.volume.x,
          top: labelData.positions.volume.y,
        }}
      >
        {labelData.volume || "الحجم"}
      </div>

      {/* phone */}
      <div
        draggable
        onDragEnd={(e) => handleDrag("phone", e)}
        className="absolute cursor-move text-gray-400 text-sm"
        style={{
          left: labelData.positions.phone.x,
          top: labelData.positions.phone.y,
        }}
      >
        {labelData.phone || "الهاتف"}
      </div>
    </div>
  );
}