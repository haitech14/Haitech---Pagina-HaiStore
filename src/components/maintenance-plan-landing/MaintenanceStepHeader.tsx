interface MaintenanceStepHeaderProps {
  step: number;
  title: string;
  subtitle: string;
}

export function MaintenanceStepHeader({ step, title, subtitle }: MaintenanceStepHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E30613] text-sm font-bold text-white">
        {step}
      </span>
      <div>
        <h3 className="text-lg font-bold tracking-tight text-[#111111] sm:text-xl">{title}</h3>
        <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>
      </div>
    </div>
  );
}
