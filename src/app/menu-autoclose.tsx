"use client";

import { useEffect } from "react";

export function MenuAutoClose() {
  useEffect(() => {
    function closeAll() {
      document.querySelectorAll<HTMLDetailsElement>("details.menu[open]").forEach((el) => {
        el.removeAttribute("open");
      });
    }

    function onDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const insideMenu = target.closest("details.menu");
      if (!insideMenu) {
        closeAll();
      }
    }

    function onMenuItemClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const isMenuItem = target.closest(".menu-item");
      if (isMenuItem) {
        closeAll();
      }
    }

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("click", onMenuItemClick);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("click", onMenuItemClick);
    };
  }, []);

  return null;
}
