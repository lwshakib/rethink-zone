/* eslint-disable @next/next/no-img-element */
import React, { useRef, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import {
  Plus,
  Search,
  Sparkles,
  Binary,
  LayoutGrid,
  Shapes,
  Smile,
  Monitor,
  ChevronRight,
  Code,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Maximize,
  Diamond,
  Triangle,
  Cylinder,
  FileText,
  Hexagon,
  Star,
  Network,
  Smile as SmileIcon,
  Zap,
  Square,
  Circle,
  Cloud,
  Smartphone,
  Tablet,
  Globe,
} from "lucide-react";
import { PlusMenuView, Tool } from "../types";
import { GENERAL_ICONS } from "../constants";

interface PlusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setIsOpen: (open: boolean) => void;
  view: PlusMenuView;
  setView: (view: PlusMenuView) => void;
  subView: string | null;
  setSubView: (subView: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  visibleIconsLimit: number;
  setVisibleIconsLimit: (limit: number | ((prev: number) => number)) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onAddIcon: (name: string, src: string) => void;
  onAddShape: (label: string) => void;
  icons: string[];
  setActiveTool: (tool: Tool) => void;
  pendingAddIcon?: { name: string; src: string } | null;
  pendingAddShapeLabel?: string | null;
}

const PlusMenu: React.FC<PlusMenuProps> = ({
  isOpen,
  onClose,
  setIsOpen,
  view,
  setView,
  subView,
  setSubView,
  searchQuery,
  setSearchQuery,
  visibleIconsLimit,
  setVisibleIconsLimit,
  isLoading,
  setIsLoading: _setIsLoading,
  onAddIcon,
  onAddShape,
  icons,
  setActiveTool,
  pendingAddIcon,
  pendingAddShapeLabel,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    const handleClickOutside = (e: PointerEvent) => {
      if (menuRef.current && !e.composedPath().includes(menuRef.current)) {
        onClose();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          ref={menuRef}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          className="fixed left-20 top-27 flex flex-col rounded-sm bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-border w-80 max-h-[85vh] overflow-hidden z-[1001] animate-in fade-in slide-in-from-left-2 duration-300"
        >
          {/* Search Section */}
          <div 
            className="flex items-center gap-2 px-3.5 py-3 border-b border-border/50 bg-muted/30"
            onWheel={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopPropagation();
            }}
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Insert item"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleIconsLimit(60); // Reset limit on search
              }}
              className="bg-transparent border-none outline-none text-[13px] text-foreground w-full placeholder:text-muted-foreground/40 font-medium"
              autoFocus
            />
          </div>

          <div
            onWheel={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopPropagation();
            }}
            onScroll={(e) => {
              const target = e.currentTarget;
              if (
                target.scrollTop + target.clientHeight >=
                target.scrollHeight - 20
              ) {
                setVisibleIconsLimit((prev) => prev + 60);
              }
            }}
            className="flex-1 overflow-y-auto max-h-[600px] p-2 space-y-4"
          >
            {searchQuery && view !== "provider-icons" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 rounded-sm">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Search Results
                  </div>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-y-3 px-2 pb-4">
                  {icons.slice(0, visibleIconsLimit).map((path, i) => {
                    const name = path.split("/").pop()?.replace(".svg", "").replace(/_/g, " ") || "icon";
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 group">
                        <button
                          onClick={() => {
                            onAddIcon(name, path);
                            setActiveTool("IconAdd");
                          }}
                          className="h-10 w-10 flex items-center justify-center rounded-sm transition-all shadow-none overflow-hidden group active:scale-90"
                        >
                          <img
                            src={path}
                            alt={name}
                            className="h-6 w-6 transition-opacity"
                          />
                        </button>
                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-1 transition-colors">
                          {name}
                        </span>
                      </div>
                    );
                  })}
                  {icons.length === 0 && (
                    <div className="col-span-5 py-20 text-center">
                      <div className="text-sm font-bold text-muted-foreground">No icons found</div>
                      <div className="text-[11px] text-muted-foreground/60">Try a different search term</div>
                    </div>
                  )}
                </div>
              </div>
            ) : view === "categories" ? (
              <div className="space-y-3">
                {/* All Categories Section */}
                <div className="space-y-0.5">
                  <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    All Categories
                  </div>

                  {[
                    {
                      id: "code",
                      icon: Binary,
                      title: "Diagram as Code",
                      desc: "Create diagrams using code",
                    },
                    {
                      id: "catalog",
                      icon: LayoutGrid,
                      title: "Diagram Catalog",
                      desc: "A catalog of 100+ Eraser diagrams",
                    },
                    {
                      id: "shape",
                      icon: Shapes,
                      title: "Shape",
                      desc: "Explore our various shapes",
                    },
                    {
                      id: "icon",
                      icon: Smile,
                      title: "Icon",
                      desc: "250+ icons available",
                    },
                    {
                      id: "frame",
                      icon: Monitor,
                      title: "Device Frame",
                      desc: "Phone, tablet, browser frames",
                    },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (item.id === "shape") setView("shape");
                        if (item.id === "icon") setView("icon");
                        if (item.id === "frame") setView("device-frame");
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm hover:bg-accent transition-all text-left group"
                    >
                      <div className="h-9 w-9 flex items-center justify-center rounded-sm bg-accent shadow-none transition-transform group-hover:scale-110">
                        <item.icon className="h-4 w-4 text-foreground/80 group-hover:text-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-foreground">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {item.desc}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground/50 transition-all" />
                    </button>
                  ))}
                </div>

                {/* Bottom Quick Actions */}
                <div className="grid grid-cols-3 gap-3 px-3 pb-3">
                  {[
                    { 
                      icon: Maximize, 
                      label: "Figure", 
                      onClick: () => { 
                        onAddShape("Figure"); 
                        setActiveTool("PlusAdd");
                        onClose();
                      } 
                    },
                    { 
                      icon: Code, 
                      label: "Code", 
                      onClick: () => { 
                        onAddShape("Code"); 
                        setActiveTool("PlusAdd");
                        onClose();
                      } 
                    },
                    { 
                      icon: ImageIcon, 
                      label: "Image",
                      onClick: () => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                             // Optional: could show a local spinner here if we had state for it
                             try {
                                const { uploadFileToCloudinary } = await import("../utils/upload");
                                const result = await uploadFileToCloudinary(file);
                                onAddIcon(file.name, result.secureUrl);
                                setActiveTool("IconAdd");
                                onClose();
                             } catch (err) {
                                console.error("Failed to upload image from menu", err);
                                // Fallback or alert?
                                alert("Failed to upload image");
                             }
                          }
                        };
                        input.click();
                      }
                    },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-sm bg-accent/20 border border-border/50 hover:border-border transition-all group shadow-sm active:scale-95"
                    >
                      <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-tight">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : view === "shape" ? (
              <div className="space-y-4">
                {/* Shape Grid View */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest">
                    <button
                      onClick={() => setView("categories")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Categories
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <span className="text-foreground">Shape</span>
                  </div>

                  <div className="grid grid-cols-5 gap-y-3 px-1.5">
                    {[
                      { icon: Square, label: "Rectangle" },
                      { icon: Circle, label: "Ellipse" },
                      { icon: Diamond, label: "Diamond" },
                      { icon: Triangle, label: "Triangle" },
                      { icon: Circle, label: "Oval", stretch: true },
                      { icon: Square, label: "Parallelo...", slant: true },
                      { icon: Square, label: "Trapezoid", trapezoid: true },
                      { icon: Cylinder, label: "Cylinder" },
                      { icon: FileText, label: "Document" },
                      { icon: Hexagon, label: "Hexagon" },
                      { icon: Star, label: "Star" },
                    ].map((shape, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onAddShape(shape.label);
                          setActiveTool("PlusAdd");
                        }}
                        className="flex flex-col items-center gap-1.5 group p-1"
                      >
                        <div className="h-10 w-10 flex items-center justify-center rounded-sm transition-all group-active:scale-90">
                          <shape.icon
                            className={`h-4 w-4 text-foreground/70 group-hover:text-primary transition-all ${
                              shape.stretch ? "scale-x-125" : ""
                            } ${shape.slant ? "-skew-x-[12deg]" : ""} ${
                              shape.trapezoid
                                ? "[clip-path:polygon(20%_0%,80%_0%,100%_100%,0%_100%)]"
                                : ""
                            }`}
                          />
                        </div>
                        <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-0.5 transition-colors">
                          {shape.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : view === "icon" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest">
                    <button
                      onClick={() => {
                        setView("categories");
                        setSubView(null);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Categories
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <span className="text-foreground">Icon</span>
                  </div>

                  {!subView && (
                    <div className="space-y-1.5 px-2">
                      {[
                        {
                          id: "custom",
                          icon: Monitor,
                          title: "Custom Icons",
                          desc: "Your team's custom icons",
                        },
                        {
                          id: "general",
                          icon: SmileIcon,
                          title: "General Icon",
                          desc: "250+ icons available",
                        },
                        {
                          id: "tech",
                          icon: Zap,
                          title: "Tech Logo",
                          desc: "Popular tools and libraries",
                          onClick: () => {
                            setSubView("Tech Logo");
                            setView("provider-icons");
                          },
                        },
                        {
                          id: "cloud",
                          icon: Cloud,
                          title: "Cloud Provider Icon",
                          desc: "AWS, Azure, Google Cloud, and more",
                          onClick: () => setView("cloud-icon"),
                        },
                      ].map((cat, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (cat.onClick) cat.onClick();
                            else setSubView(cat.id);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-3 rounded-sm bg-muted/40 border border-border/50 hover:bg-accent hover:border-border transition-all text-left group shadow-sm"
                        >
                          <div className="h-9 w-9 flex items-center justify-center rounded-sm bg-background border border-border shadow-none group-hover:scale-105 transition-transform">
                            <cat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[13px] font-bold text-foreground">
                              {cat.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {cat.desc}
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-foreground/50 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {(!subView || subView === "general") && (
                    <div className="grid grid-cols-5 gap-y-3 px-2 pb-4">
                      {GENERAL_ICONS.map((icon, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1.5 group p-1"
                        >
                          <button
                            onClick={() => {
                              const svg = ReactDOMServer.renderToStaticMarkup(
                                <icon.icon color="currentColor" size={48} />
                              );
                              const src = `data:image/svg+xml;base64,${btoa(
                                svg
                              )}`;
                              onAddIcon(icon.name, src);
                              setActiveTool("IconAdd");
                            }}
                            className="h-10 w-10 flex items-center justify-center rounded-sm transition-all shadow-none active:scale-90 group"
                          >
                            <icon.icon className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
                          </button>
                          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-1 transition-colors">
                            {icon.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : view === "provider-icons" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex-wrap">
                    <button
                      onClick={() => {
                        setView("categories");
                        setSubView(null);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Categories
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <button
                      onClick={() => setView("icon")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Icon
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <button
                      onClick={() => setView("cloud-icon")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cloud
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <span className="text-foreground">{subView}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-y-3 px-2 pb-4">
                    {isLoading ? (
                      Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1.5 animate-pulse p-1"
                        >
                          <div className="h-10 w-10 rounded-sm bg-accent/50 border border-border" />
                          <div className="h-2 w-8 bg-accent/30 rounded" />
                        </div>
                      ))
                    ) : (
                      icons.slice(0, visibleIconsLimit).map((path, i) => {
                        const name = path.split("/").pop()?.replace(".svg", "").replace(/_/g, " ") || "icon";
                        return (
                          <div key={i} className="flex flex-col items-center gap-1.5 group">
                            <button
                              onClick={() => {
                                onAddIcon(name, path);
                                setActiveTool("IconAdd");
                              }}
                              className="h-10 w-10 flex items-center justify-center rounded-sm transition-all shadow-none overflow-hidden group active:scale-90"
                            >
                              <img
                                src={path}
                                alt={name}
                                className="h-6 w-6 transition-opacity"
                              />
                            </button>
                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-1 transition-colors">
                              {name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : view === "device-frame" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold tracking-tight">
                    <button
                      onClick={() => setView("categories")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Categories
                    </button>
                    <span className="text-muted-foreground/30 font-normal">/</span>
                    <span className="text-foreground">Device Frame</span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 px-2 pt-1">
                    {[
                      { icon: Smartphone, label: "Phone", type: "phone" },
                      { icon: Tablet, label: "Tablet", type: "tablet" },
                      { icon: Monitor, label: "Desktop", type: "desktop" },
                      { icon: Globe, label: "Browser", type: "browser" },
                    ].map((device, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onAddShape(`Device:${device.type}`);
                          setActiveTool("PlusAdd");
                        }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="h-14 w-14 flex items-center justify-center rounded-md bg-[#1a1a1a] border border-border/40 transition-all group-hover:bg-[#252525] group-hover:border-primary/50 group-active:scale-95 shadow-sm">
                          <device.icon className="h-6 w-6 text-foreground/80 group-hover:text-primary transition-all" />
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground text-center transition-colors">
                          {device.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest">
                    <button
                      onClick={() => setView("categories")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Categories
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <button
                      onClick={() => setView("icon")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Icon
                    </button>
                    <span className="text-muted-foreground/30">/</span>
                    <span className="text-foreground">Cloud</span>
                  </div>

                  <div className="flex flex-col gap-2 px-3 pb-6">
                    {[
                      {
                        name: "AWS",
                        desc: "100+ official icons available",
                        src: "/logos/aws.svg",
                      },
                      {
                        name: "Azure",
                        desc: "100+ official icons available",
                        src: "/logos/azure.svg",
                      },
                      {
                        name: "Google Cloud",
                        desc: "100+ official icons available",
                        src: "/logos/google-cloud.svg",
                      },
                      {
                        name: "Kubernetes",
                        desc: "25+ official icons available",
                        src: "/logos/kubernetes.svg",
                      },
                      {
                        name: "Network",
                        desc: "Generic and Cisco icons available",
                        src: null,
                      },
                      {
                        name: "OCI",
                        desc: "25+ official icons available",
                        src: "/logos/oci.svg",
                      },
                    ].map((cloud, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSubView(cloud.name);
                          setView("provider-icons");
                        }}
                        className="flex items-center gap-3 p-3 rounded-sm hover:bg-accent transition-all group group-active:scale-[0.98] w-full text-left"
                      >
                        <div className="h-9 w-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {cloud.src ? (
                            <img
                              src={cloud.src}
                              alt={cloud.name}
                              className="max-h-full max-w-full transition-opacity"
                            />
                          ) : (
                            <Network className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
                            {cloud.name}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                            {cloud.desc}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border/50">
            <div className="text-[11px] font-bold text-foreground/80 tracking-tight">
              {view === "device-frame" ? "Phone" : (
                pendingAddIcon ? (
                  <span className="text-primary flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                    READY TO PLACE: {pendingAddIcon.name.toUpperCase()}
                  </span>
                ) : pendingAddShapeLabel ? (
                  <span className="text-primary flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                    READY TO PLACE: {pendingAddShapeLabel.toUpperCase()}
                  </span>
                ) : "All Categories"
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/50">
                <div className="flex items-center gap-0.5">
                  <ArrowUp className="h-2.5 w-2.5" />
                  <ArrowDown className="h-2.5 w-2.5" />
                </div>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/50">
                <span className="text-foreground/60">enter</span>
                <span>to insert</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { PlusMenu };
export default PlusMenu;
