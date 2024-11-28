"use client";

import React from "react";
import Head from "next/head";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DropContainer from "@/components/DropContainer";

export default function ReportPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-teal-500 text-gray-300 flex flex-col items-center justify-center space-y-6">
        <Head>
          <link rel="icon" href="/TabIcon.png" />
          <title>React DnD Free Movement</title>
        </Head>
        <h1 className="text-xl font-bold">React DnD Free Movement Example</h1>
        <DropContainer />
      </div>
    </DndProvider>
  );
}
