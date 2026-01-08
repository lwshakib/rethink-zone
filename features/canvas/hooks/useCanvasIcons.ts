/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react";
import { PlusMenuView } from "../types";

export const useCanvasIcons = (
  plusMenuView: PlusMenuView,
  plusMenuSubView: string | null,
  iconSearchQuery: string
) => {
  const [allIconsLibrary, setAllIconsLibrary] = useState<string[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);

  useEffect(() => {
    setIsLibraryLoading(true);
    fetch("/icons-library/list.json")
      .then((res) => res.json())
      .then((data) => {
        setAllIconsLibrary(data);
        setIsLibraryLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load icons:", err);
        setIsLibraryLoading(false);
      });
  }, []);

  const filteredLibraryIcons = useMemo(() => {
    const isSearching = iconSearchQuery.trim().length > 0;
    
    if (!plusMenuSubView && plusMenuView !== "provider-icons" && !isSearching) return [];

    return allIconsLibrary.filter((path) => {
      const matchLower = path.toLowerCase();
      
      // If searching and no specific subview is selected, search the entire library
      if (isSearching && !plusMenuSubView && plusMenuView !== "provider-icons") {
        const name = path.split("/").pop()?.toLowerCase() || "";
        return name.includes(iconSearchQuery.toLowerCase());
      }

      const matchCategory =
        (plusMenuSubView === "AWS" && matchLower.includes("aws-icons")) ||
        (plusMenuSubView === "Azure" && matchLower.includes("azure-icons")) ||
        (plusMenuSubView === "Google Cloud" &&
          matchLower.includes("gcp-icons")) ||
        (plusMenuSubView === "Kubernetes" &&
          matchLower.includes("kubernetes-icons")) ||
        (plusMenuSubView === "OCI" && matchLower.includes("oci-icons")) ||
        (plusMenuSubView === "Network" && matchLower.includes("networking")) ||
        (plusMenuSubView === "Tech Logo" && matchLower.includes("seti-icons"));

      if (!matchCategory) return false;

      if (iconSearchQuery) {
        const name = path.split("/").pop()?.toLowerCase() || "";
        return name.includes(iconSearchQuery.toLowerCase());
      }

      return true;
    });
  }, [allIconsLibrary, plusMenuSubView, iconSearchQuery, plusMenuView]);

  return {
    allIconsLibrary,
    isLibraryLoading,
    setIsLibraryLoading,
    filteredLibraryIcons,
  };
};
