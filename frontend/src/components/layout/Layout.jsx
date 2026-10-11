import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "../ui/CommandPalette";
import { useNexus } from "../../context/NexusContext";

export function Layout() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useNexus();

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-white/20 selection:text-white">
      <Navbar />
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
}
