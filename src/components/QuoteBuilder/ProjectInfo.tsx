import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectInfoProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export function ProjectInfo({ projectName, onProjectNameChange }: ProjectInfoProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5 card-shadow">
      <h2 className="text-base font-serif font-medium text-foreground mb-4">Project Details</h2>
      <div className="space-y-2">
        <Label htmlFor="projectName" className="text-sm font-medium">Project Name</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="e.g., Smith Residence - Living Room"
          className="bg-background"
        />
      </div>
    </div>
  );
}
