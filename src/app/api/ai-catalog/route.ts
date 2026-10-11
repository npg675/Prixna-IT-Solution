import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  getExcelCatalog,
  saveExcelCatalog,
  deleteExcelCatalog,
  buildCatalogSummary,
  SAMPLE_EXCEL_PRODUCTS,
  CatalogItem,
  ExcelCatalogData,
} from "@/lib/ai-catalog";

export const dynamic = "force-dynamic";

function normalizeHeader(h: string): string {
  return String(h || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseRowsToCatalog(
  rows: Record<string, unknown>[],
  fileName: string
): ExcelCatalogData {
  const items: CatalogItem[] = [];

  rows.forEach((row, idx) => {
    let name = "";
    let category = "General";
    let price = "";
    let stock = "In stock";
    let warranty = "";
    let specs = "";
    let notes = "";

    for (const [key, val] of Object.entries(row)) {
      if (val == null || val === "") continue;
      const strVal = String(val).trim();
      const normKey = normalizeHeader(key);

      if (
        normKey.includes("product") ||
        normKey.includes("item") ||
        normKey.includes("name") ||
        normKey.includes("title") ||
        normKey.includes("service")
      ) {
        if (!name) name = strVal;
      } else if (normKey.includes("cat") || normKey.includes("type") || normKey.includes("group")) {
        category = strVal;
      } else if (
        normKey.includes("price") ||
        normKey.includes("rate") ||
        normKey.includes("cost") ||
        normKey.includes("npr") ||
        normKey.includes("amount")
      ) {
        price = strVal;
      } else if (normKey.includes("stock") || normKey.includes("avail") || normKey.includes("status")) {
        stock = strVal;
      } else if (normKey.includes("warrant") || normKey.includes("guarant")) {
        warranty = strVal;
      } else if (
        normKey.includes("spec") ||
        normKey.includes("desc") ||
        normKey.includes("detail") ||
        normKey.includes("feature")
      ) {
        specs = strVal;
      } else if (normKey.includes("note") || normKey.includes("remark") || normKey.includes("comment")) {
        notes = strVal;
      }
    }

    // Format price if numeric
    if (price && !/rs|npr|रु/i.test(price) && !isNaN(Number(price.replace(/,/g, "")))) {
      const num = Number(price.replace(/,/g, ""));
      price = `Rs. ${num.toLocaleString("en-IN")}`;
    }

    if (name) {
      const numPrice = Number(String(price).replace(/[^\d.]/g, "")) || undefined;
      items.push({
        id: `item-${idx + 1}-${Date.now().toString(36)}`,
        name,
        category,
        price: price || "Contact for Quote",
        priceNumeric: numPrice,
        stock: stock || "Available",
        warranty,
        specs,
        notes,
      });
    }
  });

  const summaryText = buildCatalogSummary(items, fileName);
  return {
    fileName,
    uploadedAt: new Date().toISOString(),
    rowCount: items.length,
    items,
    summaryText,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // 1. Download ready-made Excel sample template
    if (action === "template") {
      const worksheetData = SAMPLE_EXCEL_PRODUCTS.map((p) => ({
        "Product / Service Name": p.name,
        Category: p.category,
        "Price (NPR)": p.price,
        "Stock Availability": p.stock,
        "Warranty Period": p.warranty,
        "Key Specifications / Features": p.specs,
        "Special Notes": p.notes,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);

      // Auto column widths
      ws["!cols"] = [
        { wch: 45 }, // Name
        { wch: 22 }, // Category
        { wch: 22 }, // Price
        { wch: 20 }, // Stock
        { wch: 24 }, // Warranty
        { wch: 55 }, // Specs
        { wch: 45 }, // Notes
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Prixna Products & Pricing");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="Prixna_Business_Pricing_Template.xlsx"',
        },
      });
    }

    // 2. Download current catalog as Excel (.xlsx)
    if (action === "export") {
      const catalog = getExcelCatalog();
      const itemsToExport = catalog?.items?.length
        ? catalog.items
        : SAMPLE_EXCEL_PRODUCTS.map((p, i) => ({ ...p, id: `sample-${i + 1}` }));

      const worksheetData = itemsToExport.map((p) => ({
        "Product / Service Name": p.name,
        Category: p.category,
        "Price (NPR)": p.price,
        "Stock Availability": p.stock,
        "Warranty Period": p.warranty,
        "Key Specifications / Features": p.specs,
        "Special Notes": p.notes,
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
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      const rawFileName = catalog?.fileName || "Prixna_Business_Catalog.xlsx";
      const baseName = rawFileName.replace(/\.[^/.]+$/, "");
      const downloadName = `${baseName}_updated.xlsx`;

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${downloadName}"`,
        },
      });
    }

    // 3. Load built-in sample products into AI Brain
    if (action === "load_samples") {
      const sampleItems: CatalogItem[] = SAMPLE_EXCEL_PRODUCTS.map((p, i) => ({
        ...p,
        id: `sample-${i + 1}`,
      }));
      const catalog: ExcelCatalogData = {
        fileName: "Prixna_Default_Business_Catalogue.xlsx",
        uploadedAt: new Date().toISOString(),
        rowCount: sampleItems.length,
        items: sampleItems,
        summaryText: buildCatalogSummary(sampleItems, "Prixna_Default_Business_Catalogue.xlsx"),
      };
      saveExcelCatalog(catalog);
      return NextResponse.json({ success: true, catalog });
    }

    // 4. Return current catalog
    const catalog = getExcelCatalog();
    return NextResponse.json({ catalog });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const items = body.items as CatalogItem[];
    const existing = getExcelCatalog();
    const fileName = body.fileName || existing?.fileName || "Prixna_Business_Catalog.xlsx";

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items format: expected array." },
        { status: 400 }
      );
    }

    const cleanItems: CatalogItem[] = items
      .filter((it) => it && it.name && it.name.trim().length > 0)
      .map((it, idx) => {
        let price = String(it.price || "").trim();
        if (price && !/rs|npr|रु/i.test(price) && !isNaN(Number(price.replace(/,/g, "")))) {
          const num = Number(price.replace(/,/g, ""));
          price = `Rs. ${num.toLocaleString("en-IN")}`;
        }
        const numPrice = Number(String(price).replace(/[^\d.]/g, "")) || undefined;
        return {
          id: it.id || `item-${idx + 1}-${Date.now().toString(36)}`,
          name: it.name.trim(),
          category: it.category?.trim() || "General",
          price: price || "Contact for Quote",
          priceNumeric: numPrice,
          stock: it.stock?.trim() || "In stock",
          warranty: it.warranty?.trim() || "",
          specs: it.specs?.trim() || "",
          notes: it.notes?.trim() || "",
        };
      });

    const summaryText = buildCatalogSummary(cleanItems, fileName);
    const updatedCatalog: ExcelCatalogData = {
      fileName,
      uploadedAt: new Date().toISOString(),
      rowCount: cleanItems.length,
      items: cleanItems,
      summaryText,
    };

    saveExcelCatalog(updatedCatalog);

    return NextResponse.json({
      success: true,
      catalog: updatedCatalog,
      message: `Successfully saved ${cleanItems.length} items to AI Brain!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai-catalog] PUT error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No Excel or CSV file uploaded." },
        { status: 400 }
      );
    }

    const fileName = file.name || "business_data.xlsx";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel workbook or CSV
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json(
        { success: false, error: "Spreadsheet contains no sheets." },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    if (!rawRows || !rawRows.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No data rows found in the sheet. Please ensure the top row has column headers.",
        },
        { status: 400 }
      );
    }

    const catalog = parseRowsToCatalog(rawRows, fileName);

    if (!catalog.items.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not find any product or service names in the uploaded columns. Please check column headers.",
        },
        { status: 400 }
      );
    }

    saveExcelCatalog(catalog);

    return NextResponse.json({
      success: true,
      catalog,
      message: `Successfully loaded ${catalog.rowCount} products & pricing items into AI Brain.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai-catalog] Upload error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    deleteExcelCatalog();
    return NextResponse.json({
      success: true,
      message: "Excel catalog cleared from AI Brain.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
