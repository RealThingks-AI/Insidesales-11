import { useState } from "react";
import { Deal, DealStage } from "@/types/deal";
import { LeadStageForm } from "./LeadStageForm";
import { DiscussionsStageForm } from "./DiscussionsStageForm";
import { QualifiedStageForm } from "./QualifiedStageForm";
import { RFQStageForm } from "./RFQStageForm";
import { OfferedStageForm } from "./OfferedStageForm";
import { FinalStageForm } from "./FinalStageForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealStageFormProps {
  formData: Partial<Deal>;
  onFieldChange: (field: string, value: any) => void;
  onLeadSelect?: (lead: any) => void;
  fieldErrors: Record<string, string>;
  stage: DealStage;
  showPreviousStages: boolean;
}

const STAGE_DESCRIPTIONS: Record<string, string> = {
  Lead: "Initial lead information and contact details",
  Discussions: "Customer needs, challenges, and relationship building",
  Qualified: "Budget, timeline, and qualification criteria",
  RFQ: "Request for quote details and proposal information",
  Offered: "Revenue breakdown and contract details",
  Won: "Deal won - capture success factors",
  Lost: "Deal lost - understand reasons for improvement",
  Dropped: "Deal dropped - document the decision",
};

export const DealStageForm = ({ 
  formData, 
  onFieldChange, 
  onLeadSelect, 
  fieldErrors, 
  stage, 
  showPreviousStages 
}: DealStageFormProps) => {
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => {
    // Default: current stage open, others closed
    return { [stage]: true };
  });

  const getStageIndex = (stageValue: DealStage): number => {
    const stages = ['Lead', 'Discussions', 'Qualified', 'RFQ', 'Offered', 'Won', 'Lost', 'Dropped'];
    return stages.indexOf(stageValue);
  };

  const currentStageIndex = getStageIndex(stage);
  const isFinalStage = ['Won', 'Lost', 'Dropped'].includes(stage);
  const allStages: DealStage[] = ['Lead', 'Discussions', 'Qualified', 'RFQ', 'Offered'];

  const toggleStage = (stageName: string) => {
    setOpenStages(prev => ({ ...prev, [stageName]: !prev[stageName] }));
  };

  const getStageStatus = (stageToCheck: DealStage, index: number): 'completed' | 'current' | 'upcoming' => {
    if (isFinalStage) {
      if (allStages.includes(stageToCheck)) return 'completed';
      if (stageToCheck === stage) return 'current';
      return 'upcoming';
    }
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'upcoming';
  };

  const renderStageComponent = (stageToRender: DealStage) => {
    switch (stageToRender) {
      case 'Lead':
        return (
          <LeadStageForm
            formData={formData}
            onFieldChange={onFieldChange}
            onLeadSelect={onLeadSelect}
            fieldErrors={fieldErrors}
          />
        );
      case 'Discussions':
        return (
          <DiscussionsStageForm
            formData={formData}
            onFieldChange={onFieldChange}
            fieldErrors={fieldErrors}
          />
        );
      case 'Qualified':
        return (
          <QualifiedStageForm
            formData={formData}
            onFieldChange={onFieldChange}
            fieldErrors={fieldErrors}
          />
        );
      case 'RFQ':
        return (
          <RFQStageForm
            formData={formData}
            onFieldChange={onFieldChange}
            fieldErrors={fieldErrors}
          />
        );
      case 'Offered':
        return (
          <OfferedStageForm
            formData={formData}
            onFieldChange={onFieldChange}
            fieldErrors={fieldErrors}
          />
        );
      case 'Won':
      case 'Lost':
      case 'Dropped':
        return (
          <FinalStageForm
            formData={formData}
            onFieldChange={onFieldChange}
            fieldErrors={fieldErrors}
            stage={stageToRender}
          />
        );
      default:
        return null;
    }
  };

  if (showPreviousStages) {
    // Build stages to show
    const stagesToShow: DealStage[] = [];
    
    if (isFinalStage) {
      stagesToShow.push(...allStages);
      stagesToShow.push(stage);
    } else {
      for (let i = 0; i <= currentStageIndex && i < allStages.length; i++) {
        stagesToShow.push(allStages[i]);
      }
    }

    return (
      <div className="space-y-3">
        {/* Stage Progress Indicator */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
          {stagesToShow.map((s, idx) => {
            const status = getStageStatus(s, idx);
            return (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                  status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  status === 'current' && "bg-primary/10 text-primary ring-1 ring-primary/20",
                  status === 'upcoming' && "bg-muted text-muted-foreground"
                )}>
                  {status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                  {status === 'current' && <PlayCircle className="h-3 w-3" />}
                  {status === 'upcoming' && <Circle className="h-3 w-3" />}
                  {s}
                </div>
                {idx < stagesToShow.length - 1 && (
                  <div className={cn(
                    "w-4 h-0.5 mx-1",
                    status === 'completed' ? "bg-green-400" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Collapsible Stage Sections */}
        {stagesToShow.map((stageToRender, index) => {
          const status = getStageStatus(stageToRender, index);
          const isOpen = openStages[stageToRender] ?? (stageToRender === stage);

          return (
            <Collapsible 
              key={stageToRender} 
              open={isOpen}
              onOpenChange={() => toggleStage(stageToRender)}
            >
              <div className={cn(
                "border rounded-lg overflow-hidden transition-all",
                status === 'current' && "ring-2 ring-primary/30 border-primary/50",
                status === 'completed' && "border-green-200 dark:border-green-800/50"
              )}>
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "flex items-center justify-between p-3 hover:bg-accent/50 transition-colors",
                    status === 'current' && "bg-primary/5",
                    status === 'completed' && "bg-green-50/50 dark:bg-green-900/10"
                  )}>
                    <div className="flex items-center gap-3">
                      {status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {status === 'current' && (
                        <PlayCircle className="h-5 w-5 text-primary" />
                      )}
                      {status === 'upcoming' && (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <span className={cn(
                          "font-medium",
                          status === 'current' && "text-primary",
                          status === 'completed' && "text-green-700 dark:text-green-400"
                        )}>
                          {stageToRender} Stage
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {STAGE_DESCRIPTIONS[stageToRender]}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-2 border-t bg-background">
                    {renderStageComponent(stageToRender)}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    );
  } else {
    // Show only current stage
    return (
      <div>
        {renderStageComponent(stage)}
      </div>
    );
  }
};
