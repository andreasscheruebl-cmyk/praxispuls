import { notFound } from "next/navigation";
import { getPracticeForAdmin } from "@/lib/db/queries/admin";
import { getEffectivePlan } from "@/lib/plans";
import { setOverrideAction, removeOverrideAction } from "@/actions/admin";

export default async function AdminPracticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const practice = await getPracticeForAdmin(id);

  if (!practice) return notFound();

  const effectivePlan = getEffectivePlan(practice);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{practice.name}</h1>
        <p className="text-muted-foreground">{practice.email}</p>
      </div>

      {/* Plan info */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">Plan-Informationen</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Stripe Plan</p>
            <p className="font-medium">{practice.plan || "free"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Effektiver Plan</p>
            <p className="font-medium">{effectivePlan}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Override</p>
            <p className="font-medium">
              {practice.planOverride || "Kein Override"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Override Grund</p>
            <p className="font-medium">
              {practice.overrideReason || "—"}
            </p>
          </div>
          {practice.overrideExpiresAt && (
            <div>
              <p className="text-muted-foreground">Override läuft ab</p>
              <p className="font-medium">
                {new Date(practice.overrideExpiresAt).toLocaleDateString("de-DE")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Override form */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">Plan Override setzen</h2>
        <form action={setOverrideAction} className="space-y-3">
          <input type="hidden" name="practiceId" value={practice.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="plan" className="mb-1 block text-sm font-medium">
                Plan
              </label>
              <select
                id="plan"
                name="plan"
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={practice.planOverride || "starter"}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium">
                Grund
              </label>
              <select
                id="reason"
                name="reason"
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={practice.overrideReason || "beta_tester"}
              >
                <option value="beta_tester">Beta-Tester</option>
                <option value="demo">Demo</option>
                <option value="friend">Friend</option>
                <option value="support">Support</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            <div>
              <label htmlFor="expiresAt" className="mb-1 block text-sm font-medium">
                Ablaufdatum (optional)
              </label>
              <input
                id="expiresAt"
                type="date"
                name="expiresAt"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Override setzen
          </button>
        </form>
      </div>

      {/* Remove override */}
      {practice.planOverride && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-4">
          <h2 className="font-semibold text-red-900">Override entfernen</h2>
          <p className="text-sm text-red-700">
            Der Override wird entfernt und der Stripe-Plan wird wieder aktiv.
          </p>
          <form action={removeOverrideAction}>
            <input type="hidden" name="practiceId" value={practice.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Override entfernen
            </button>
          </form>
        </div>
      )}

      {/* Practice details */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">Details</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Slug</p>
            <p className="font-mono text-xs">{practice.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stripe Customer</p>
            <p className="font-mono text-xs">{practice.stripeCustomerId || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Google Place ID</p>
            <p className="font-mono text-xs">{practice.googlePlaceId || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Erstellt am</p>
            <p>
              {practice.createdAt
                ? new Date(practice.createdAt).toLocaleDateString("de-DE")
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
