import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCampaigns, type Campaign } from "@/hooks/useCampaigns";
import { useState, useEffect, KeyboardEvent } from "react";
import { Users, Briefcase, Building2, X, Trash2, Save, Target } from "lucide-react";

interface AudienceData {
  job_titles: string[];
  departments: string[];
  seniorities: string[];
  industries: string[];
  company_sizes: string[];
}

const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Engineering", "Finance", "HR", "Other"];
const SENIORITIES = ["C-Suite", "VP", "Director", "Manager", "Team Lead", "Individual Contributor"];
const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1000", "1000+"];

function parseAudience(raw: string | null): AudienceData {
  const empty: AudienceData = { job_titles: [], departments: [], seniorities: [], industries: [], company_sizes: [] };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.job_titles) return { ...empty, ...parsed };
    if (Array.isArray(parsed)) {
      const first = parsed[0] || {};
      return {
        job_titles: first.job_title ? [first.job_title] : [],
        departments: first.department ? [first.department] : [],
        seniorities: first.seniority ? [first.seniority] : [],
        industries: first.industry ? [first.industry] : [],
        company_sizes: first.company_size ? [first.company_size] : [],
      };
    }
  } catch {}
  return empty;
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("");
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput("");
    }
  };
  const removeTag = (tag: string) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="space-y-1">
      <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="h-8 text-sm" />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs py-0 px-1.5">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (selected: string[]) => void }) {
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-foreground transition-colors">
          <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} className="h-3.5 w-3.5" />
          <span className="text-xs">{opt}</span>
        </label>
      ))}
    </div>
  );
}

interface Props {
  campaign: Campaign;
}

export function CampaignMARTAudience({ campaign }: Props) {
  const { updateCampaign } = useCampaigns();
  const [data, setData] = useState<AudienceData>(() => parseAudience(campaign.target_audience));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(parseAudience(campaign.target_audience));
  }, [campaign.target_audience]);

  const handleSave = () => {
    setSaving(true);
    updateCampaign.mutate(
      { id: campaign.id, target_audience: JSON.stringify(data) },
      { onSettled: () => setSaving(false) }
    );
  };

  const handleClearAll = () => {
    setData({ job_titles: [], departments: [], seniorities: [], industries: [], company_sizes: [] });
  };

  const criteriaCount = [
    data.job_titles.length > 0,
    data.departments.length > 0,
    data.seniorities.length > 0,
    data.industries.length > 0,
    data.company_sizes.length > 0,
  ].filter(Boolean).length;

  const hasContent = criteriaCount > 0;

  // Build summary
  const summaryParts: string[] = [];
  if (data.seniorities.length) summaryParts.push(data.seniorities.join(", "));
  if (data.job_titles.length) summaryParts.push(data.job_titles.join(", "));
  if (data.departments.length) summaryParts.push(`in ${data.departments.join(", ")}`);
  if (data.industries.length) summaryParts.push(`from ${data.industries.join(", ")}`);
  if (data.company_sizes.length) summaryParts.push(`(${data.company_sizes.join(" / ")} employees)`);
  const summary = summaryParts.length > 0 ? `Targeting ${summaryParts.join(" ")}` : "";

  return (
    <div className="space-y-3">
      {/* Summary card when content exists */}
      {hasContent && (
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="py-2.5 px-3">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium">Audience Profile</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{criteriaCount}/5 criteria</Badge>
                </div>
                <p className="text-xs text-muted-foreground italic truncate">{summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="p-3 border border-dashed rounded-lg text-center">
          <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Define your ideal customer profile by filling in criteria below.</p>
        </div>
      )}

      {/* Two sections: WHO and WHERE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* WHO section */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Briefcase className="h-3.5 w-3.5" />
            Who — Role & Seniority
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-xs mb-1 block">Job Titles <span className="text-[10px] text-muted-foreground">(type + Enter)</span></Label>
              <TagInput tags={data.job_titles} onChange={tags => setData({ ...data, job_titles: tags })} placeholder="e.g. CEO, VP of Sales..." />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Seniority</Label>
              <CheckboxGroup options={SENIORITIES} selected={data.seniorities} onChange={sens => setData({ ...data, seniorities: sens })} />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Departments</Label>
              <CheckboxGroup options={DEPARTMENTS} selected={data.departments} onChange={deps => setData({ ...data, departments: deps })} />
            </div>
          </div>
        </div>

        {/* WHERE section */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            Where — Industry & Size
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-xs mb-1 block">Industries <span className="text-[10px] text-muted-foreground">(type + Enter)</span></Label>
              <TagInput tags={data.industries} onChange={tags => setData({ ...data, industries: tags })} placeholder="e.g. SaaS, FinTech, Manufacturing..." />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Company Sizes</Label>
              <CheckboxGroup options={COMPANY_SIZES} selected={data.company_sizes} onChange={sizes => setData({ ...data, company_sizes: sizes })} />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" className="h-8 gap-1.5" onClick={handleSave} disabled={saving || !hasContent}>
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Audience"}
        </Button>
        {hasContent && (
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1" onClick={handleClearAll}>
            <Trash2 className="h-3 w-3" /> Clear All
          </Button>
        )}
        {!hasContent && (
          <span className="text-xs text-muted-foreground">Add at least one criteria to save</span>
        )}
      </div>
    </div>
  );
}
