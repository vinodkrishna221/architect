import { DashboardShell, DashboardCanvas } from "@/components/dashboard/layout/DashboardShell";
import { Dock } from "@/components/dashboard/layout/Dock";
import { CanvasArea } from "@/components/dashboard/canvas/CanvasArea";

export default function DashboardPage() {
    return (
        <DashboardShell>
            <DashboardCanvas>
                <CanvasArea />
            </DashboardCanvas>
            <Dock />
        </DashboardShell>
    );
}
