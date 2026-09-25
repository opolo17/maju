import SessionCard from './SessionCard.jsx';

export default function SessionGroup({ title, sessions, onDelete, deletingId, labels, t }) {
  if (sessions.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-maju-text">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onDelete={onDelete}
            deletingId={deletingId}
            labels={labels}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
