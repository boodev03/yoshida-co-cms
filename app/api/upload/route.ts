import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { deleteFile, uploadFile } from "@/services/upload";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const type = formData.get("type") as "image" | "video" | null;
        const path = (formData.get("path") as string) || undefined;

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }
        if (!type || (type !== "image" && type !== "video")) {
            return NextResponse.json({ error: "Invalid or missing type" }, { status: 400 });
        }

        const url = await uploadFile({ file, type, path });

        const publicBase = process.env.R2_PUBLIC_URL || "";
        const key = publicBase && url.startsWith(publicBase + "/")
            ? url.substring((publicBase + "/").length)
            : undefined;

        return NextResponse.json({ url, key }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";
        let payload: any = {};
        if (contentType.includes("application/json")) {
            payload = await request.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const form = await request.formData();
            payload = Object.fromEntries(form.entries());
        }

        const key = payload.key as string | undefined;
        const url = payload.url as string | undefined;

        let objectKey = key;
        if (!objectKey && url) {
            const publicBase = process.env.R2_PUBLIC_URL || "";
            if (publicBase && url.startsWith(publicBase + "/")) {
                objectKey = url.substring((publicBase + "/").length);
            }
        }

        if (!objectKey) {
            return NextResponse.json({ error: "Missing key or url" }, { status: 400 });
        }

        await deleteFile(objectKey);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
    }
}


