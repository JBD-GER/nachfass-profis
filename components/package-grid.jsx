export function PackageGrid({ packages }) {
  return (
    <div className="package-grid">
      {packages.map((item) => (
        <article
          className={`package-card reveal${item.featured ? " featured" : ""}`}
          key={item.title}
        >
          {item.featured ? (
            <div className="featured-ribbon">Meistgewählt</div>
          ) : null}

          <div className="package-head">
            <div>
              <p className="package-kicker">{item.kicker}</p>
              <h3>{item.title}</h3>
            </div>
            {!item.featured ? (
              <span className="package-badge">{item.badge}</span>
            ) : null}
          </div>

          <p className="package-volume">{item.volume}</p>
          <p className="package-summary">{item.summary}</p>

          <div className="package-meta">
            <div className="package-meta-item">
              <span className="package-meta-label">Sinnvoll wenn</span>
              <strong>{item.fit}</strong>
            </div>
            <div className="package-meta-item">
              <span className="package-meta-label">Fokus</span>
              <strong>{item.focus}</strong>
            </div>
          </div>

          <ul className="detail-list">
            {item.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
