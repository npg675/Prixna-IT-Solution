"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CatalogItem, ExcelCatalogData } from "@/lib/ai-catalog";

const DEFAULT_CATEGORIES = [
  "Laptops & Computers",
  "CCTV & Security",
  "Software & SaaS",
  "Hardware & Upgrades",
  "Repair & Maintenance",
  "Biometric & Attendance",
  "Networking & Accessories",
  "General",
];

export function ExcelCatalogManager() {
  const [catalog, setCatalog] = useState<ExcelCatalogData | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showTable, setShowTable] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states for Editing and Adding
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemForm, setItemForm] = useState<Partial<CatalogItem>>({
    name: "",
    category: "General",
    price: "",
    stock: "In stock",
    warranty: "",
    specs: "",
    notes: "",
  });

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai-catalog");
      const data = await res.json();
      if (data && data.catalog) {
        setCatalog(data.catalog);
        setItems(data.catalog.items || []);
        setIsDirty(false);
      } else {
        setCatalog(null);
        setItems([]);
        setIsDirty(false);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    setUploading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/ai-catalog", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ type: "error", text: data.error || "Failed to process Excel file." });
      } else {
        setCatalog(data.catalog);
        setItems(data.catalog.items || []);
        setIsDirty(false);
        setMsg({
          type: "success",
          text: `✅ ${data.message || `Loaded ${data.catalog.rowCount} products from ${file.name}`}`,
        });
        setShowTable(true);
        // Sync local storage for instant widget updates
        try {
          localStorage.setItem("prixna_excel_catalog_v2", JSON.stringify(data.catalog));
        } catch {}
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Upload error";
      setMsg({ type: "error", text: errorMsg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLoadSamples = async () => {
    setUploading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/ai-catalog?action=load_samples");
      const data = await res.json();
      if (data.success && data.catalog) {
        setCatalog(data.catalog);
        setItems(data.catalog.items || []);
        setIsDirty(false);
        setMsg({
          type: "success",
          text: `✅ Loaded ${data.catalog.rowCount} default Prixna products & prices into AI Brain!`,
        });
        setShowTable(true);
        try {
          localStorage.setItem("prixna_excel_catalog_v2", JSON.stringify(data.catalog));
        } catch {}
      }
    } catch {
      setMsg({ type: "error", text: "Could not load sample catalog." });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear the uploaded business catalog? The AI will revert to standard general knowledge.")) return;
    try {
      await fetch("/api/ai-catalog", { method: "DELETE" });
      setCatalog(null);
      setItems([]);
      setIsDirty(false);
      setMsg({ type: "success", text: "Business catalog cleared from AI Brain." });
      try {
        localStorage.removeItem("prixna_excel_catalog_v2");
      } catch {}
    } catch {
      setMsg({ type: "error", text: "Failed to clear catalog." });
    }
  };

  // Save modified items back to AI Brain (/api/ai-catalog PUT)
  const handleSaveChanges = async () => {
    if (!items.length) {
      setMsg({ type: "error", text: "Cannot save an empty catalog." });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/ai-catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          fileName: catalog?.fileName || "Prixna_Business_Catalog.xlsx",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ type: "error", text: data.error || "Failed to save updates to AI Brain." });
      } else {
        setCatalog(data.catalog);
        setItems(data.catalog.items || []);
        setIsDirty(false);
        setMsg({
          type: "success",
          text: `✅ Saved changes! AI Brain is now immediately answering with your updated data (${data.catalog.rowCount} products).`,
        });
        // Sync local storage for instant widget updates
        try {
          localStorage.setItem("prixna_excel_catalog_v2", JSON.stringify(data.catalog));
        } catch {}
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Save error";
      setMsg({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  // Revert changes back to current catalog
  const handleRevertChanges = () => {
    if (confirm("Discard all unsaved edits and restore last saved catalog?")) {
      setItems(catalog?.items || []);
      setIsDirty(false);
      setMsg({ type: "success", text: "Reverted unsaved edits to last saved state." });
    }
  };

  // Download Current or Updated Data as Excel (.xlsx)
  const handleDownloadExcel = () => {
    const itemsToExport = items.length ? items : (catalog?.items || []);
    if (!itemsToExport.length) {
      setMsg({ type: "error", text: "No products or services available to download." });
      return;
    }

    try {
      const worksheetData = itemsToExport.map((p) => ({
        "Product / Service Name": p.name,
        Category: p.category || "General",
        "Price (NPR)": p.price || "Contact for Quote",
        "Stock Availability": p.stock || "In stock",
        "Warranty Period": p.warranty || "",
        "Key Specifications / Features": p.specs || "",
        "Special Notes": p.notes || "",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);

      ws["!cols"] = [
        { wch: 45 }, // Name
        { wch: 24 }, // Category
        { wch: 24 }, // Price
        { wch: 20 }, // Stock
        { wch: 24 }, // Warranty
        { wch: 60 }, // Specs
        { wch: 45 }, // Notes
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Prixna Products & Pricing");

      const rawFileName = catalog?.fileName || "Prixna_Business_Catalog.xlsx";
      const baseName = rawFileName.replace(/\.[^/.]+$/, "");
      const downloadName = `${baseName}_updated.xlsx`;

      XLSX.writeFile(wb, downloadName);
      setMsg({
        type: "success",
        text: `📥 Downloaded "${downloadName}" successfully! You can edit this file in Excel and re-upload anytime.`,
      });
    } catch (err) {
      console.error("Excel download error:", err);
      // Fallback to server route download
      window.location.href = "/api/ai-catalog?action=export";
    }
  };

  // Open Edit Modal for a specific item
  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setItemForm({ ...item });
  };

  // Open Add Modal
  const openAddModal = () => {
    setShowAddModal(true);
    setItemForm({
      name: "",
      category: categoryFilter !== "all" ? categoryFilter : "General",
      price: "Rs. ",
      stock: "In stock",
      warranty: "1 Year Official Warranty",
      specs: "",
      notes: "",
    });
  };

  // Save item from modal (either update or add)
  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name?.trim()) {
      alert("Product / Service Name is required.");
      return;
    }

    if (editingItem) {
      // Update existing item
      const updated = items.map((it) =>
        it.id === editingItem.id
          ? ({
              ...it,
              name: itemForm.name!.trim(),
              category: itemForm.category?.trim() || "General",
              price: itemForm.price?.trim() || "Contact for Quote",
              stock: itemForm.stock?.trim() || "In stock",
              warranty: itemForm.warranty?.trim() || "",
              specs: itemForm.specs?.trim() || "",
              notes: itemForm.notes?.trim() || "",
            } as CatalogItem)
          : it
      );
      setItems(updated);
      setIsDirty(true);
      setEditingItem(null);
      setMsg({
        type: "success",
        text: `✏️ Updated "${itemForm.name}". Remember to click "💾 Save Changes to AI Brain" to make it live!`,
      });
    } else if (showAddModal) {
      // Add new item
      const newItem: CatalogItem = {
        id: `item-${Date.now()}`,
        name: itemForm.name!.trim(),
        category: itemForm.category?.trim() || "General",
        price: itemForm.price?.trim() || "Contact for Quote",
        stock: itemForm.stock?.trim() || "In stock",
        warranty: itemForm.warranty?.trim() || "",
        specs: itemForm.specs?.trim() || "",
        notes: itemForm.notes?.trim() || "",
      };
      setItems([newItem, ...items]);
      setIsDirty(true);
      setShowAddModal(false);
      setMsg({
        type: "success",
        text: `➕ Added "${itemForm.name}". Remember to click "💾 Save Changes to AI Brain" to make it live!`,
      });
    }
  };

  // Delete an item
  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from this catalog?`)) {
      setItems(items.filter((it) => it.id !== id));
      setIsDirty(true);
      setMsg({
        type: "success",
        text: `🗑️ Removed "${name}". Click "💾 Save Changes to AI Brain" to persist this removal.`,
      });
    }
  };

  // Duplicate an item
  const handleDuplicateItem = (item: CatalogItem) => {
    const duplicated: CatalogItem = {
      ...item,
      id: `item-${Date.now()}`,
      name: `${item.name} (Copy)`,
    };
    const index = items.findIndex((it) => it.id === item.id);
    const newItems = [...items];
    newItems.splice(index + 1, 0, duplicated);
    setItems(newItems);
    setIsDirty(true);
    setMsg({
      type: "success",
      text: `📋 Duplicated "${item.name}". You can now edit the copy!`,
    });
  };

  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...(items.map((it) => it.category).filter(Boolean) || [])])
  );

  const filteredItems = items.filter((it: CatalogItem) => {
    const matchesSearch =
      !search ||
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.specs.toLowerCase().includes(search.toLowerCase()) ||
      it.price.toLowerCase().includes(search.toLowerCase()) ||
      it.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || it.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📊 Company Business Data & Excel Brain</span>
              {catalog || items.length > 0 ? (
                <Badge variant="outline" className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  🟢 {items.length} Products Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  ⚪ No File Uploaded
                </Badge>
              )}
              {isDirty && (
                <Badge variant="default" className="bg-amber-500 text-white animate-pulse">
                  ⚠️ Unsaved Changes Pending
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Upload your company&apos;s Excel (.xlsx, .xls) or CSV sheet. You can edit details directly in the preview, add new products, download the updated Excel file, and re-upload anytime!
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/api/ai-catalog?action=template" download="Prixna_Business_Pricing_Template.xlsx">
              <Button type="button" size="sm" variant="outline" title="Download Excel template with sample columns">
                📥 Template (.xlsx)
              </Button>
            </a>
            {!catalog && items.length === 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleLoadSamples}
                disabled={uploading}
                title="Populate AI with 16 default Prixna products and prices"
              >
                ⚡ Load Sample Products
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Upload Drop Area */}
        <div className="relative rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-5 text-center transition-colors hover:border-primary/50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 cursor-pointer opacity-0"
            title="Upload business spreadsheet"
          />
          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <span className="text-2xl">📁</span>
            <p className="text-sm font-semibold">
              {uploading ? "Parsing & updating AI Brain…" : "Click or drag your company Excel / CSV file here to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports <b>.xlsx</b>, <b>.xls</b>, and <b>.csv</b>. (Columns: Product Name, Category, Price, Stock, Warranty, Specs, Notes).
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`rounded-lg p-3 text-xs font-medium flex items-center justify-between gap-2 ${
              msg.type === "success"
                ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <span>{msg.text}</span>
            <button
              type="button"
              onClick={() => setMsg(null)}
              className="opacity-70 hover:opacity-100 text-sm font-bold ml-2"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Active Catalog Details, Edit Controls & Preview */}
        {(catalog || items.length > 0) && (
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
              <div>
                <p className="text-sm font-bold flex items-center gap-2">
                  <span>📄 {catalog?.fileName || "Prixna_Business_Catalog.xlsx"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({items.length} items · {isDirty ? "Edited locally" : `Updated ${new Date(catalog?.uploadedAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`})
                  </span>
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Download Excel Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadExcel}
                  className="text-xs font-semibold border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  title="Download current/updated products as Excel file"
                >
                  📥 Download Excel (.xlsx)
                </Button>

                {/* Add New Product Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openAddModal}
                  className="text-xs font-semibold text-primary"
                  title="Add a new product or service to this list"
                >
                  ➕ Add Product/Service
                </Button>

                {/* Save All Changes Button */}
                {isDirty && (
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                    title="Commit edits immediately to AI Brain"
                  >
                    💾 {saving ? "Saving…" : "Save Changes to AI Brain"}
                  </Button>
                )}

                {/* Revert Changes */}
                {isDirty && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRevertChanges}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="Discard edits and reload saved catalog"
                  >
                    ↩️ Revert
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTable(!showTable)}
                  className="text-xs"
                >
                  {showTable ? "▲ Hide Preview" : "▼ Show Preview Table"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  🗑️ Clear
                </Button>
              </div>
            </div>

            {/* Filter and Table View */}
            {showTable && (
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search loaded products, CCTV, SSD, laptops, or prices…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 text-xs max-w-sm"
                  />
                  {categories.length > 0 && (
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-8 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="all">All Categories ({categories.length})</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    Showing {filteredItems.length} of {items.length} items
                  </span>
                </div>

                <div className="max-h-96 overflow-auto rounded-md border text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur font-semibold text-muted-foreground border-b z-10">
                      <tr>
                        <th className="p-2 w-10">#</th>
                        <th className="p-2">Product / Service</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Price (NPR)</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2">Warranty</th>
                        <th className="p-2">Specs / Features</th>
                        <th className="p-2 text-right w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredItems.map((it, i) => (
                        <tr key={it.id || i} className="hover:bg-muted/30 group">
                          <td className="p-2 text-muted-foreground">{i + 1}</td>
                          <td className="p-2 font-medium">
                            <span className="hover:underline cursor-pointer" onClick={() => openEditModal(it)} title="Click to edit">
                              {it.name}
                            </span>
                          </td>
                          <td className="p-2 text-muted-foreground whitespace-nowrap">{it.category}</td>
                          <td className="p-2 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {it.price}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <span
                              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                /in\s*stock|available|उपलब्ध/i.test(it.stock)
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {it.stock}
                            </span>
                          </td>
                          <td className="p-2 text-muted-foreground whitespace-nowrap">{it.warranty || "—"}</td>
                          <td className="p-2 text-muted-foreground max-w-xs truncate" title={it.specs}>
                            {it.specs || "—"}
                          </td>
                          <td className="p-2 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openEditModal(it)}
                                className="p-1 rounded hover:bg-muted text-primary"
                                title="Edit this product / price"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem(it)}
                                className="p-1 rounded hover:bg-muted text-muted-foreground"
                                title="Duplicate this item"
                              >
                                📋
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(it.id, it.name)}
                                className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600"
                                title="Delete from catalog"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-muted-foreground">
                            No products match your search or filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {isDirty && (
                  <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2.5 text-xs text-amber-900 dark:text-amber-300">
                    <span className="font-medium">
                      ⚠️ You have unsaved changes in the table above.
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                      >
                        💾 {saving ? "Saving…" : "Save Changes to AI Brain"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleRevertChanges}
                        className="text-xs"
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Edit or Add Product / Service */}
        {(editingItem || showAddModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>{editingItem ? "✏️ Edit Product / Service" : "➕ Add New Product / Service"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddModal(false);
                  }}
                  className="rounded p-1 hover:bg-muted text-muted-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModalItem} className="flex flex-col gap-3.5 text-xs">
                <div>
                  <label className="font-semibold block mb-1">
                    Product / Service Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dell Inspiron 15 3520 (Intel Core i5) or Jigri ERP Software"
                    value={itemForm.name || ""}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="text-xs"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <input
                      list="categories-list"
                      placeholder="Select or type category"
                      value={itemForm.category || ""}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <datalist id="categories-list">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Price (NPR)</label>
                    <Input
                      placeholder="e.g. Rs. 72,500 or Free Site Visit"
                      value={itemForm.price || ""}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Stock Availability</label>
                    <Input
                      placeholder="e.g. In stock, 2 units left, Available"
                      value={itemForm.stock || ""}
                      onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Warranty Period</label>
                    <Input
                      placeholder="e.g. 1 Year Official Warranty, 3 Years"
                      value={itemForm.warranty || ""}
                      onChange={(e) => setItemForm({ ...itemForm, warranty: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Key Specifications / Features</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Core i5-1235U, 16GB RAM, 512GB SSD, 15.6 FHD 120Hz display"
                    value={itemForm.specs || ""}
                    onChange={(e) => setItemForm({ ...itemForm, specs: e.target.value })}
                    className="w-full rounded-md border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Special Notes / Free Gifts / Delivery</label>
                  <Input
                    placeholder="e.g. Free laptop bag, wireless mouse, and mouse pad included"
                    value={itemForm.notes || ""}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setShowAddModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="default" className="font-semibold">
                    {editingItem ? "Apply Update" : "Add to List"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Informational Guidance */}
        <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <span className="text-base">💡</span>
          <div>
            <b>Complete Flexibility:</b> You can edit product names, prices, or stock status directly here and click <b>&ldquo;Save Changes to AI Brain&rdquo;</b>. To add multiple items at once on your computer, click <b>&ldquo;Download Excel (.xlsx)&rdquo;</b>, edit in Microsoft Excel or Google Sheets, and re-upload the file whenever needed!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
