import { BarsLoader } from "@/components/ui/bars-loader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f23]/90 backdrop-blur-sm">
            <BarsLoader />
        </div>
    );
}
