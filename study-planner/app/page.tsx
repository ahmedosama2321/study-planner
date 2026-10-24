import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { addTask, deleteTask, logout, toggleTask } from "@/lib/actions";

const BADGE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
};
const FILTERS = ["all", "active", "done"] as const;
const input =
  "rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const { filter = "all" } = await searchParams;
  const [tasks, total, doneCount] = await Promise.all([
    db.task.findMany({
      where: { userId, done: filter === "done" ? true : filter === "active" ? false : undefined },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    }),
    db.task.count({ where: { userId } }),
    db.task.count({ where: { userId, done: true } }),
  ]);
  const progress = total ? Math.round((doneCount / total) * 100) : 0;
  const now = new Date();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📚 Hi, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">
            {doneCount} of {total} tasks done
          </p>
        </div>
        <form action={logout}>
          <button className="text-sm text-slate-500 hover:text-slate-900">Log out</button>
        </form>
      </header>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <form
        action={addTask}
        className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2"
      >
        <input name="title" placeholder="What do you need to study?" required className={`${input} sm:col-span-2`} />
        <input name="subject" placeholder="Subject (e.g. Calculus)" className={input} />
        <input name="dueDate" type="date" className={input} />
        <select name="priority" defaultValue="MEDIUM" className={input}>
          <option value="LOW">Low priority</option>
          <option value="MEDIUM">Medium priority</option>
          <option value="HIGH">High priority</option>
        </select>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
          Add task
        </button>
      </form>

      <nav className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/" : `/?filter=${f}`}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              filter === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {f}
          </Link>
        ))}
      </nav>

      <ul className="space-y-2">
        {tasks.length === 0 && <li className="py-10 text-center text-slate-400">No tasks here yet 🎉</li>}
        {tasks.map((t) => {
          const overdue = !t.done && t.dueDate && t.dueDate < now;
          return (
            <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <form action={toggleTask.bind(null, t.id)}>
                <button
                  aria-label="Toggle done"
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    t.done ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                  }`}
                >
                  {t.done && "✓"}
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <p className={`truncate ${t.done ? "text-slate-400 line-through" : ""}`}>{t.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {t.subject && <span>{t.subject}</span>}
                  {t.dueDate && (
                    <span className={overdue ? "font-medium text-red-600" : ""}>
                      Due {t.dueDate.toLocaleDateString("en-GB")}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 ${BADGE[t.priority]}`}>{t.priority.toLowerCase()}</span>
                </p>
              </div>
              <form action={deleteTask.bind(null, t.id)}>
                <button aria-label="Delete" className="text-slate-400 hover:text-red-600">
                  ✕
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
