import type { Project, Contractor, Transaction } from "../hooks/useDashboardData";

interface Props {
  projects: Project[];
  contractors: Contractor[];
  transactions: Transaction[];
  money: (n: number) => string;
}

export default function EmployersView({
  projects,
  contractors,
  transactions,
  money,
}: Props) {
  const artaProjects = projects
    .filter((p) => p.employer === "آرتا پیشرو")
    .map((p) => p.name);

  let artaWork = 0;
  let artaPayments = 0;

  contractors.forEach((c) => {
    transactions
      .filter(
        (t) =>
          t.contractor_id === c.id &&
          t.type === "work" &&
          t.status !== "replaced" &&
          artaProjects.includes(
            projects.find((p) => p.id === t.project_id)?.name || ""
          )
      )
      .forEach((t) => {
        artaWork += t.amount_rial || 0;
      });

    transactions
      .filter(
        (t) =>
          t.contractor_id === c.id &&
          t.type === "payment" &&
          (!t.project_id ||
            artaProjects.includes(
              projects.find((p) => p.id === t.project_id)?.name || ""
            ))
      )
      .forEach((t) => {
        artaPayments += t.amount_rial || 0;
      });
  });

  const independentProjects = projects
    .filter((p) => p.employer !== "آرتا پیشرو")
    .map((p) => p.name);

  return (
    <div className="grid-2">
      <div className="card">
        <strong>🏢 آرتا پیشرو</strong>
        <p className="muted">{artaProjects.join(" • ")}</p>
        <p>
          کار: {money(artaWork)}
          <br />
          پرداخت: {money(artaPayments)}
          <br />
          <b className="danger">مانده: {money(artaWork - artaPayments)}</b>
        </p>
      </div>

      <div className="card">
        <strong>🏢 پروژه‌های مستقل</strong>
        <p>{independentProjects.join(" • ")}</p>
      </div>
    </div>
  );
}
