// src/components/TemplateEditor.jsx
import React, { useState } from "react";
import { Rnd } from "react-rnd";

export default function TemplateEditor({ initialTemplate, onSave }) {
  const [elements, setElements] = useState(initialTemplate?.elements || []);

  const updateElement = (id, data) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...data } : el))
    );
  };

  const handleSave = () => onSave({ ...initialTemplate, elements });

  return (
    <div className="p-4 flex flex-col items-center">
      <div
        className="relative bg-white border border-gray-400 rounded-xl shadow-inner overflow-hidden"
        style={{
          width: initialTemplate?.width || 400,
          height: initialTemplate?.height || 250,
        }}
      >
        {elements.map((el) => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) =>
              updateElement(el.id, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                ...position,
              })
            }
            bounds="parent"
          >
            <div
              className="flex items-center justify-center bg-gray-50 border border-gray-300 text-sm font-semibold text-black select-none"
              style={{
                width: "100%",
                height: "100%",
                fontSize: el.fontSize || 14,
              }}
            >
              {el.label}
            </div>
          </Rnd>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-amber-500 text-black rounded font-semibold"
      >
        💾 حفظ القالب
      </button>
    </div>
  );
}