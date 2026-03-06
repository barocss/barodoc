export const ASSET_EXTENSIONS = [
  ".html",
  ".pdf",
  ".pptx",
  ".tex",
  ".odt",
  ".ods",
  ".odp",
  ".docx",
  ".xlsx",
  ".ipynb",
  ".csv",
  ".rst",
  ".epub",
] as const;

export type AssetExtension = (typeof ASSET_EXTENSIONS)[number];

export type ViewerType =
  | "iframe" // .html
  | "pdf" // .pdf
  | "pptx" // .pptx
  | "latex" // .tex
  | "viewerjs" // .odt, .ods, .odp
  | "docx" // .docx (viewer or download)
  | "xlsx" // .xlsx (viewer or download)
  | "ipynb" // .ipynb
  | "csv" // .csv table
  | "rst" // .rst (e.g. restructured / rst2html)
  | "epub" // .epub (EPUB.js)
  | "download"; // fallback only

const EXT_TO_VIEWER: Record<string, ViewerType> = {
  ".html": "iframe",
  ".pdf": "pdf",
  ".pptx": "pptx",
  ".tex": "latex",
  ".odt": "viewerjs",
  ".ods": "viewerjs",
  ".odp": "viewerjs",
  ".docx": "docx",
  ".xlsx": "xlsx",
  ".ipynb": "ipynb",
  ".csv": "csv",
  ".rst": "rst",
  ".epub": "epub",
};

export function getViewerType(ext: string): ViewerType {
  return EXT_TO_VIEWER[ext.toLowerCase()] ?? "download";
}

export function isAssetExtension(ext: string): boolean {
  return ASSET_EXTENSIONS.includes(ext.toLowerCase() as AssetExtension);
}
