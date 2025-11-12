import React, { useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";

function DraggableItem({ id, children, pos, onMove }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    position: "absolute",
    left: (pos?.x || 0) + (transform?.x || 0),
    top: (pos?.y || 0) + (transform?.y || 0),
    cursor: "grab",
    transition: transform ? "none" : "all 0.1s ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onMouseUp={() => {
        if (transform) {
          onMove(id, {
            x: pos.x + transform.x,
            y: pos.y + transform.y,
          });
        }
      }}
      className="select-none"
    >
      {children}
    </div>
  );
}

export default function LabelPreview({ labelData, onPositionChange }) {
  const { name, logo, price, volume, phone, positions } = labelData;

  return (
    <div className="w-full flex justify-center">
      <DndContext>
        <div className="relative w-[350px] h-[500px] rounded-2xl bg-gradient-to-br from-black via-gray-900 to-amber-800 shadow-xl overflow-hidden border border-amber-600">

          {/* شعار المحل */}
          <DraggableItem
            id="logo"
            pos={positions.logo}
            onMove={onPositionChange}
          >
            <div className="text-amber-400 text-3xl font-bold tracking-wider">{logo}</div>
          </DraggableItem>

          {/* اسم العطر */}
          <DraggableItem
            id="name"
            pos={positions.name}
            onMove={onPositionChange}
          >
            <div className="text-white text-xl font-semibold">{name}</div>
          </DraggableItem>

          {/* السعر */}
          <DraggableItem
            id="price"
            pos={positions.price}
            onMove={onPositionChange}
          >
            <div className="text-amber-300 text-lg font-medium">{price}</div>
          </DraggableItem>

          {/* الكمية */}
          <DraggableItem
            id="volume"
            pos={positions.volume}
            onMove={onPositionChange}
          >
            <div className="text-gray-300 text-sm">{volume}</div>
          </DraggableItem>

          {/* رقم المحل */}
          <DraggableItem
            id="phone"
            pos={positions.phone}
            onMove={onPositionChange}
          >
            <div className="text-gray-400 text-sm">{phone}</div>
          </DraggableItem>

        </div>
      </DndContext>
    </div>
  );
}