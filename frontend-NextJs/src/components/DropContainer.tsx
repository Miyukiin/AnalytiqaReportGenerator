"use client";

import React, { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import DraggableBox from "./DraggableBox"; // Ensure the import path is correct

const DropContainer: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null); // Create a ref for the drop container
  const [boxPosition, setBoxPosition] = useState({ x: 50, y: 50 }); // Track box position

  const [, drop] = useDrop(() => ({
    accept: "box",
    drop: (_, monitor) => {
      const offset = monitor.getSourceClientOffset(); // Get the offset of the dragged item
      if (offset && ref.current) {
        const rect = ref.current.getBoundingClientRect(); // Get the container's bounding rectangle
        const newX = offset.x - rect.left;
        const newY = offset.y - rect.top;
        setBoxPosition({ x: newX, y: newY }); // Update the position
      }
    },
  }));

  drop(ref); // Attach the drop function to the ref

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "600px",
        height: "400px",
        border: "2px solid gray",
        backgroundColor: "#f9f9f9",
        overflow: "hidden",
      }}
    >
      <DraggableBox initialX={boxPosition.x} initialY={boxPosition.y} />
    </div>
  );
};

export default DropContainer;
