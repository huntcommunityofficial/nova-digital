"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown, faDownload } from "@fortawesome/free-solid-svg-icons";

interface Props {
    path: string;
    accentColor?: string;
}

export default function DeliverableDownload({ path, accentColor = "#10B981" }: Props) {
    const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${path}`;
    const fileName = path.split("/").pop() ?? "deliverable";

    return (
        <div className="rounded-2xl border p-6 mb-8"
            style={{ borderColor: `${accentColor}33`, background: `${accentColor}0a` }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${accentColor}20` }}>
                    <FontAwesomeIcon icon={faFileArrowDown} className="text-sm" style={{ color: accentColor }} />
                </div>
                <div>
                    <p className="text-white/90 text-sm font-semibold">Your files are ready</p>
                    <p className="text-white/40 text-xs mt-0.5">Your project has been completed. Download your deliverable below.</p>
                </div>
            </div>

            <a href={fileUrl} download={fileName}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all w-full hover:bg-red-300`}
                style={{ background: accentColor, boxShadow: `0 0 16px ${accentColor}44` }}>
                <FontAwesomeIcon icon={faDownload} className="text-xs" />
                Download files
            </a>
        </div>
    );
}