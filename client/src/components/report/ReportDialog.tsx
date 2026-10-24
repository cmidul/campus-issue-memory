import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ANONYMOUS_AUTHOR_LABEL, CATEGORIES, LIMITS, SEVERITIES } from '@cim/shared';
import { useAuth } from '../../auth/AuthProvider';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useToast } from '../ui/Toast';

export interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
}

function formatMb(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/**
 * The report composer. Demo build: it validates like the real thing but does
 * not send anything to a server. Photo *and* short video clips are accepted;
 * in the AI milestones a short video is reduced to a few sampled frames
 * before any AI analysis (see docs/AI_LIMITATIONS.md).
 */
export function ReportDialog({ open, onClose }: ReportDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  // The composer only opens after sign-in; fall back defensively anyway.
  const viewerName = user?.name ?? 'Student';
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [photo, setPhoto] = useState<{ url: string; name: string } | null>(null);
  const [video, setVideo] = useState<{ name: string } | null>(null);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; location?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Revoke the object URL when the preview changes or the dialog unmounts.
  useEffect(() => {
    return () => {
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
    };
  }, [photo]);

  function reset() {
    setDescription('');
    setLocation('');
    setCategory('');
    setSeverity('medium');
    setPhoto(null);
    setVideo(null);
    setPostAnonymously(false);
    setErrors({});
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!LIMITS.photoAcceptedTypes.includes(file.type as never)) {
      toast('Please choose a JPG, PNG, or WebP image.', 'danger');
      return;
    }
    if (file.size > LIMITS.photoMaxBytes) {
      toast(`Photos must be smaller than ${formatMb(LIMITS.photoMaxBytes)}.`, 'danger');
      return;
    }
    setPhoto({ url: URL.createObjectURL(file), name: file.name });
  }

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!LIMITS.videoAcceptedTypes.includes(file.type as never)) {
      toast('Please choose an MP4 or WebM clip.', 'danger');
      return;
    }
    if (file.size > LIMITS.videoMaxBytes) {
      toast(`Clips must be smaller than ${formatMb(LIMITS.videoMaxBytes)}.`, 'danger');
      return;
    }
    setVideo({ name: file.name });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: { description?: string; location?: string } = {};
    if (description.trim().length < LIMITS.descriptionMin) {
      nextErrors.description = 'Please describe the problem in a little more detail.';
    }
    if (!location.trim()) {
      nextErrors.location = 'Please tell us where the problem is.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    // Simulated save so the loading state is visible in the demo.
    window.setTimeout(() => {
      setSubmitting(false);
      reset();
      onClose();
      toast('Thanks! Your report was submitted (demo only — nothing was sent).', 'success');
    }, 600);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Report a problem"
      description="A photo or a short clip helps. You can edit everything before submitting."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="report-form" loading={submitting}>
            Submit report
          </Button>
        </>
      }
    >
      <form id="report-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Signed-in account posting as (or anonymously). On narrow screens the
            anonymous toggle drops below the account line so nothing squeezes. */}
        <div className="flex flex-col gap-3 rounded-xl bg-surface-2 px-3.5 py-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar name={viewerName} anonymous={postAnonymously} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                {postAnonymously ? ANONYMOUS_AUTHOR_LABEL : viewerName}
              </p>
              <p className="text-xs text-ink-muted">
                {postAnonymously
                  ? 'Other students will not see your name on this post.'
                  : user?.isDemo
                    ? 'Posting from the demo account (synthetic data only).'
                    : 'Posting from your university account.'}
              </p>
            </div>
          </div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={postAnonymously}
              onChange={(event) => setPostAnonymously(event.target.checked)}
              className="h-5 w-5 rounded border-line accent-[var(--accent-600)]"
            />
            <span>Post anonymously</span>
          </label>
        </div>
        <FormField
          label="Add a photo"
          hint={`JPG, PNG, or WebP — up to ${formatMb(LIMITS.photoMaxBytes)}.`}
        >
          <div className="flex flex-col gap-2">
            <input
              ref={photoInputRef}
              type="file"
              accept={LIMITS.photoAcceptedTypes.join(',')}
              onChange={handlePhotoChange}
              aria-label="Choose a photo file"
              className="block w-full text-base text-ink-muted file:mr-3 file:rounded-xl file:border-0 file:bg-surface-2 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ink"
            />
            {photo && (
              <div className="flex items-center gap-3">
                <img
                  src={photo.url}
                  alt="Preview of the photo you selected"
                  className="h-20 w-20 rounded-xl border border-line object-cover"
                />
                <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>
                  Remove photo
                </Button>
              </div>
            )}
          </div>
        </FormField>

        <FormField
          label="Or add a short clip"
          hint={`MP4 or WebM, up to ${LIMITS.videoMaxSeconds} seconds. Useful when a photo cannot show the problem, like a flickering light.`}
        >
          <input
            ref={videoInputRef}
            type="file"
            accept={LIMITS.videoAcceptedTypes.join(',')}
            onChange={handleVideoChange}
            aria-label="Choose a short video clip"
            className="block w-full text-base text-ink-muted file:mr-3 file:rounded-xl file:border-0 file:bg-surface-2 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ink"
          />
          {video && <p className="mt-1.5 text-sm text-ink">Clip selected: {video.name}</p>}
        </FormField>

        <FormField label="Describe the problem" error={errors.description} required>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: the ceiling light above the stairs keeps flickering"
          />
        </FormField>

        <FormField label="Where is it?" error={errors.location} required>
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Example: library, second floor, near the stairs"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Not sure</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="How serious is it?">
            <Select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              {SEVERITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.description}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <p className="rounded-xl bg-surface-2 px-3.5 py-3 text-xs text-ink-muted">
          AI may suggest a description after you add a photo or clip. You can always edit or ignore
          it and write your own — submitting never requires AI.
        </p>
      </form>
    </Dialog>
  );
}
