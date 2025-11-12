// src/components/Preview.jsx
import React from "react";

export default function Preview({ template, data, editable = false, onPositionsSave }) {
  const move = (key, dx, dy) => {
    const updatedElements = template.elements.map((el) =>
      el.id === key ? { ...el, x: el.x + dx, y: el.y + dy } : el
    );
    onPositionsSave({ ...template, elements: updatedElements });
  };

  return (
    <div
      className="relative bg-white border border-gray-300 rounded-xl shadow-inner overflow-hidden"
      style={{ width: template.width, height: template.height }}
    >
      {template.elements.map((el) => {
        const text = data[el.id] || el.label;
        return (
          <div
            key={el.id}
            className="absolute"
            style={{
              top: el.y,
              left: el.x,
              width: el.width,
              height: el.height,
              fontSize: el.fontSize || 14,
              fontWeight: "bold",
              color: "#222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: editable ? "1px dashed gray" : "none",
              backgroundColor: editable ? "rgba(200,200,200,0.1)" : "transparent",
            }}
          >
            {text}
            {editable && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center z-10">
                <div className="flex gap-1">
                  <button onClick={() => move(el.id, 0, -5)}>▲</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => move(el.id, -5, 0)}>◀</button>
                  <button onClick={() => move(el.id, 5, 0)}>▶</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => move(el.id, 0, 5)}>▼</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}