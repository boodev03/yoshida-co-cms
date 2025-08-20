"use client";

export type UploadFileType = "image" | "video";

export async function uploadFile({
  file,
  type,
  path,
}: {
  file: File;
  type: UploadFileType;
  path?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  if (path) formData.append("path", path);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Upload failed");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function deleteFileByUrl(url: string): Promise<void> {
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Delete failed");
  }
}

export async function deleteFileByKey(key: string): Promise<void> {
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Delete failed");
  }
}


