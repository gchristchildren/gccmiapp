import { NO_COUNTRY, kidBands, type AudienceRule } from "@/lib/audience";
import { countries } from "@/lib/countries";
import { ageGroups, ageLabel } from "@/lib/format";

const bandLabel: Record<string, string> = { none: "No children", "1": "1 child", "2": "2 children", "3+": "3 or more" };

/** Choose who an event or announcement is for. Leave everything empty for everyone. Used inside a form. */
export function AudienceFields({ rule }: { rule?: AudienceRule | null }) {
  const field = "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm";
  return (
    <fieldset className="space-y-4 rounded-2xl border border-line p-4 sm:col-span-2">
      <legend className="px-2 text-sm font-semibold">Who is this for?</legend>
      <p className="text-sm text-muted">
        Leave all of these empty and everyone will see it. Choose something and it becomes <strong className="text-fg">portal only</strong>: only matching parents can see it, and it is not shown on the public website.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="text-sm font-medium">
          Parents living in (Ctrl or Cmd to choose several)
          <select name="rule_country" multiple size={6} defaultValue={rule?.countries ?? []} className={field}>
            <option value={NO_COUNTRY}>Country not given</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <fieldset className="text-sm">
          <legend className="font-medium">Number of children</legend>
          <div className="mt-2 space-y-1">
            {kidBands.map((b) => (
              <label key={b} className="flex items-center gap-2">
                <input type="checkbox" name="rule_kids" value={b} defaultChecked={rule?.kids.includes(b)} className="accent-brand" /> {bandLabel[b]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="text-sm">
          <legend className="font-medium">Has a child in</legend>
          <div className="mt-2 space-y-1">
            {ageGroups.map((g) => (
              <label key={g} className="flex items-center gap-2">
                <input type="checkbox" name="rule_age" value={g} defaultChecked={rule?.ages.includes(g)} className="accent-brand" /> {ageLabel(g)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </fieldset>
  );
}
