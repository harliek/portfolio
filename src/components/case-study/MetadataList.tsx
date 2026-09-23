export interface MetaItem {
  term: string
  detail: string
}

/** Compact semantic metadata (a definition list, not badges). */
export function MetadataList({ items }: { items: MetaItem[] }) {
  return (
    <dl className="meta-list">
      {items.map((item) => (
        <div className="meta-list__item" key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.detail}</dd>
        </div>
      ))}
    </dl>
  )
}
