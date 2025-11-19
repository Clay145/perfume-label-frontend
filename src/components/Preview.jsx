// src/components/Preview.jsx
import React from "react";

export default function Preview({ template, data }) {
  return (
    <div
      className="relative bg-white border border-gray-300 rounded-xl shadow-inner overflow-hidden mx-auto"
      style={{ width: template.width, height: template.height }}
    >
      {template.elements.map((el) => {
        const text = data[el.id] || el.label;

        // Determine if this is an image or text
        if (el.type === "image") {
          // For logo, we might want to show a placeholder if no logo is uploaded yet, 
          // or just the label if it's a static placeholder.
          // In this app, 'logo' is usually handled by the backend, 
          // but for preview we can show a placeholder icon.
          return (
            <div
              key={el.id}
              className="absolute border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400"
              style={{
                top: el.y,
                left: el.x,
                width: el.width,
                height: el.height,
                borderRadius: "50%", // assuming circular logo placeholder
              }}
            >
              {el.label}
            </div>
          );
        }

        return (
          <div
            key={el.id}
            className="absolute flex items-center justify-center"
            style={{
              top: el.y,
              left: el.x,
              width: el.width,
              // Use minHeight to allow expansion, but respect original height as minimum
              minHeight: el.height,
              fontSize: el.fontSize || 14,
              fontWeight: "bold",
              color: "#222",
              textAlign: "center",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: "1.2",
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}