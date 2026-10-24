import { REPORT_STATUS_META, type ReportStatus } from '@cim/shared';
import { Badge, type BadgeTone } from './Badge';

export interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

/**
 * Plain-language status label for a report, e.g. "Under review".
 * The wording comes from the shared domain vocabulary so the client and
 * server always agree.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = REPORT_STATUS_META[status];
  return (
    <Badge tone={meta.tone as BadgeTone} className={className}>
      {meta.label}
    </Badge>
  );
}
