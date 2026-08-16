type Row = { label: string; value: string };

function parseLines(text: string): { intro: string[]; rows: Row[]; rest: string[] } {
  const intro: string[] = [];
  const rows: Row[] = [];
  const rest: string[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      rest.push("");
      continue;
    }
    const matched = line.match(/^([^：:]{1,20})[：:]\s*(.+)$/);
    if (matched) {
      rows.push({ label: matched[1], value: matched[2] });
    } else if (rows.length === 0) {
      intro.push(line);
    } else {
      rest.push(line);
    }
  }
  return { intro, rows, rest };
}

export function ProductDescription({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm text-zinc-500">暂无详细配置文案。</p>;
  }

  const { intro, rows, rest } = parseLines(text);
  const compare = rows.filter((row) => /clean|vs厂|vs\b|对比|厂/i.test(row.label + row.value));

  return (
    <div className="space-y-6 text-sm leading-7 text-zinc-300">
      {intro.length > 0 && (
        <div className="space-y-2">
          {intro.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {compare.length >= 2 && (
        <div>
          <h3 className="mb-3 font-serif text-lg text-gold">Clean 厂 / VS 厂对照</h3>
          <div className="overflow-hidden rounded-xl border border-gold/20">
            {compare.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[120px_1fr] border-b border-gold/10 last:border-b-0"
              >
                <div className="bg-white/5 px-4 py-3 text-gold">{row.label}</div>
                <div className="px-4 py-3">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rows.filter((row) => !compare.includes(row)).length > 0 && (
        <div>
          <h3 className="mb-3 font-serif text-lg text-gold">配置参数</h3>
          <div className="overflow-hidden rounded-xl border border-gold/20">
            {rows.filter((row) => !compare.includes(row)).map((row, i) => (
              <div
                key={`${row.label}-${i}`}
                className="grid grid-cols-[120px_1fr] border-b border-gold/10 last:border-b-0"
              >
                <div className="bg-white/5 px-4 py-3 text-gold">{row.label}</div>
                <div className="whitespace-pre-wrap px-4 py-3">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rest.filter(Boolean).length > 0 && (
        <div className="whitespace-pre-wrap text-zinc-400">{rest.join("\n")}</div>
      )}
    </div>
  );
}
