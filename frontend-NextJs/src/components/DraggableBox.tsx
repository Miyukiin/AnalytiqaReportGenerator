"use client";

import React, { useRef } from "react";
import { useDrag } from "react-dnd";

interface DraggableBoxProps {
  initialX: number;
  initialY: number;
}

const DraggableBox: React.FC<DraggableBoxProps> = ({ initialX, initialY }) => {
  const ref = useRef<HTMLDivElement>(null); // Create a ref for the draggable div

  const [, drag] = useDrag(() => ({
    type: "box",
    item: { id: "box" }, // Example item, you can add additional properties
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref); // Attach the drag function to the ref

  return (
    <div
      ref={ref} // Use the combined ref
      style={{
        position: "absolute",
        left: initialX,
        top: initialY,
        width: "100px",
        height: "100px",
        backgroundColor: "blue",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "move",
      }}
    >
      Drag me
    </div>
  );
};

export default DraggableBox;
