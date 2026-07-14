import { supabase } from "./supabaseClient.js";

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_OUTPUT_QUALITY = 0.88;
export const PEDICAMPOS_IMAGE_BUCKETS = Object.freeze({
  STORE_ASSETS: "store-assets",
  PRODUCT_IMAGES: "product-images",
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MIME_EXTENSIONS = Object.freeze({
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
});
const NORMALIZED_EXTENSION = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
});
const STORAGE_PUBLIC_MARKER = "/storage/v1/object/public/";

function imageError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function assertUuid(value, label) {
  if (!UUID_PATTERN.test(String(value || ""))) {
    throw imageError("INVALID_STORAGE_SCOPE", `${label} invalido para o upload.`);
  }
}

export function validateImageFile(file) {
  if (!file || typeof file !== "object") {
    throw imageError("IMAGE_REQUIRED", "Selecione uma imagem para enviar.");
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw imageError("IMAGE_EMPTY", "A imagem selecionada esta vazia.");
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw imageError("IMAGE_TOO_LARGE", "A imagem deve ter no maximo 5 MB.");
  }

  const mime = String(file.type || "").toLowerCase();
  const allowedExtensions = MIME_EXTENSIONS[mime];
  if (!allowedExtensions) {
    throw imageError("IMAGE_TYPE_NOT_ALLOWED", "Use uma imagem JPG, PNG ou WEBP.");
  }

  const fileName = String(file.name || "");
  const extension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
  if (!allowedExtensions.includes(extension)) {
    throw imageError("IMAGE_EXTENSION_MISMATCH", "A extensao do arquivo nao corresponde ao tipo da imagem.");
  }

  return { mime, extension: NORMALIZED_EXTENSION[mime], size: file.size };
}

function loadBrowserImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.style.imageOrientation = "from-image";
    image.onload = () => resolve(image);
    image.onerror = () => reject(imageError("IMAGE_DECODE_FAILED", "Nao foi possivel abrir a imagem selecionada."));
    image.src = source;
  });
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(imageError("IMAGE_PROCESS_FAILED", "Nao foi possivel gerar a imagem recortada."));
    }, mime, quality);
  });
}

export async function createCroppedImageFile(file, cropPixels, output) {
  const { mime } = validateImageFile(file);
  const width = Math.round(Number(output?.width));
  const height = Math.round(Number(output?.height));
  const crop = {
    x: Math.max(0, Math.round(Number(cropPixels?.x))),
    y: Math.max(0, Math.round(Number(cropPixels?.y))),
    width: Math.max(1, Math.round(Number(cropPixels?.width))),
    height: Math.max(1, Math.round(Number(cropPixels?.height))),
  };
  if (!width || !height || width > 1920 || height > 1920) {
    throw imageError("INVALID_IMAGE_OUTPUT", "Dimensoes de saida invalidas para o recorte.");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadBrowserImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: mime === "image/png" });
    if (!context) throw imageError("IMAGE_PROCESS_FAILED", "O navegador nao conseguiu processar a imagem.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (mime !== "image/png") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, mime, IMAGE_OUTPUT_QUALITY);
    const extension = NORMALIZED_EXTENSION[mime];
    const baseName = String(file.name || "imagem").replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-");
    const croppedFile = new File([blob], `${baseName || "imagem"}-recortada.${extension}`, {
      type: mime,
      lastModified: Date.now(),
    });
    validateImageFile(croppedFile);
    return croppedFile;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function uniqueFileName(extension) {
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

async function uploadImage(bucket, pathPrefix, file) {
  if (!supabase) throw imageError("STORAGE_UNAVAILABLE", "Supabase Storage nao esta configurado.");
  const { mime, extension } = validateImageFile(file);
  const path = `${pathPrefix}/${uniqueFileName(extension)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: mime,
    upsert: false,
  });
  if (error) throw imageError("IMAGE_UPLOAD_FAILED", "Nao foi possivel enviar a imagem.", error);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    await supabase.storage.from(bucket).remove([path]);
    throw imageError("IMAGE_PUBLIC_URL_FAILED", "Nao foi possivel gerar a URL publica da imagem.");
  }
  return { bucket, path, publicUrl: data.publicUrl };
}

export function uploadStoreLogo(storeId, file) {
  assertUuid(storeId, "storeId");
  return uploadImage(PEDICAMPOS_IMAGE_BUCKETS.STORE_ASSETS, `${storeId}/logo`, file);
}

export function uploadStoreBanner(storeId, file) {
  assertUuid(storeId, "storeId");
  return uploadImage(PEDICAMPOS_IMAGE_BUCKETS.STORE_ASSETS, `${storeId}/banner`, file);
}

export function uploadProductImage(storeId, productId, file) {
  assertUuid(storeId, "storeId");
  assertUuid(productId, "productId");
  return uploadImage(PEDICAMPOS_IMAGE_BUCKETS.PRODUCT_IMAGES, `${storeId}/${productId}`, file);
}

export function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl || !import.meta.env.VITE_SUPABASE_URL) return null;
  try {
    const url = new URL(publicUrl);
    const projectOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
    if (url.origin !== projectOrigin) return null;
    const markerIndex = url.pathname.indexOf(STORAGE_PUBLIC_MARKER);
    if (markerIndex < 0) return null;

    const encodedSegments = url.pathname.slice(markerIndex + STORAGE_PUBLIC_MARKER.length).split("/");
    const segments = encodedSegments.map((segment) => decodeURIComponent(segment));
    if (segments.some((segment) => !segment || segment.includes("/") || segment === "." || segment === "..")) return null;

    const [bucket, ...pathSegments] = segments;
    const path = pathSegments.join("/");
    if (!Object.values(PEDICAMPOS_IMAGE_BUCKETS).includes(bucket)) return null;
    if (!UUID_PATTERN.test(pathSegments[0] || "")) return null;

    if (bucket === PEDICAMPOS_IMAGE_BUCKETS.STORE_ASSETS) {
      if (pathSegments.length !== 3 || !["logo", "banner"].includes(pathSegments[1])) return null;
    } else if (pathSegments.length !== 3 || !UUID_PATTERN.test(pathSegments[1] || "")) {
      return null;
    }

    return { bucket, path, storeId: pathSegments[0] };
  } catch {
    return null;
  }
}

export function isPediCamposStorageUrl(url) {
  return Boolean(getStoragePathFromPublicUrl(url));
}

export async function deleteStoredImage(publicUrl) {
  const stored = getStoragePathFromPublicUrl(publicUrl);
  if (!stored) return false;
  if (!supabase) throw imageError("STORAGE_UNAVAILABLE", "Supabase Storage nao esta configurado.");

  const { error } = await supabase.storage.from(stored.bucket).remove([stored.path]);
  if (error) throw imageError("IMAGE_DELETE_FAILED", "Nao foi possivel remover a imagem anterior.", error);
  return true;
}
