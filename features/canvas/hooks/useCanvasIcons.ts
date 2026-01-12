/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react"; // React core hooks
import { PlusMenuView } from "../types"; // Type definition for the Plus Menu view state

/**
 * useCanvasIcons - Hook responsible for fetching the global icon library registry
 * and filtering it based on the user's current category selection and search query.
 */
export const useCanvasIcons = (
  plusMenuView: PlusMenuView,         // The current top-level view (Categories, Cloud Icons, etc)
  plusMenuSubView: string | null,     // The current sub-category (e.g., "AWS", "Tech Logo")
  iconSearchQuery: string             // The text filter entered by the user
) => {
  // allIconsLibrary stores the raw list of relative file paths for all available SVG icons
  const [allIconsLibrary, setAllIconsLibrary] = useState<string[]>([]);
  // tracks the fetch status of the icons list
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);

  // EFFECT: Fetch the static JSON manifest of all available icons on mount
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

  /**
   * MEMOIZED: Filters the icon library based on the current UI state.
   * This logic handles both deep-diving into categories (subviews) and global search.
   */
  const filteredLibraryIcons = useMemo(() => {
    const isSearching = iconSearchQuery.trim().length > 0;
    
    // If we're not inside a specific provider view or searching, we don't need to show everything
    if (!plusMenuSubView && plusMenuView !== "provider-icons" && !isSearching) return [];

    return allIconsLibrary.filter((path) => {
      const matchLower = path.toLowerCase();
      
      // OPTION 1: Global Search
      // If the user is typing but hasn't picked a category, we search across the whole library.
      if (isSearching && !plusMenuSubView && plusMenuView !== "provider-icons") {
        const name = path.split("/").pop()?.toLowerCase() || "";
        return name.includes(iconSearchQuery.toLowerCase());
      }

      // OPTION 2: Category Filtering
      // Check if the icon file path belongs to the currently active subview directory.
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

      // OPTION 3: Search within Category
      // If a category is selected AND a search query is present, refine the category results.
      if (iconSearchQuery) {
        const name = path.split("/").pop()?.toLowerCase() || "";
        return name.includes(iconSearchQuery.toLowerCase());
      }

      return true; // Return all icons in the category if no search query
    });
  }, [allIconsLibrary, plusMenuSubView, iconSearchQuery, plusMenuView]);

  return {
    allIconsLibrary,
    isLibraryLoading,
    setIsLibraryLoading,
    filteredLibraryIcons,
  };
};
