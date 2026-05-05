export function PackageGrid({ packages }) {
  return (
    <div className="package-grid">
      {packages.map((item) => (
        <article
          className={`package-card reveal${item.featured ? " featured" : ""}`}
          key={item.title}
        >
          <div className="package-shell">
            <div className="package-copy">
              <p className="package-kicker">{item.kicker}</p>
              <h3>{item.title}</h3>

              <dl className="package-facts">
                <div className="package-fact">
                  <dt>Enthalten:</dt>
                  <dd>{item.included}</dd>
                </div>
                <div className="package-fact">
                  <dt>Provision:</dt>
                  <dd>{item.commission}</dd>
                </div>
                <div className="package-fact">
                  <dt>Mindestlaufzeit:</dt>
                  <dd>{item.minimumTerm}</dd>
                </div>
              </dl>
            </div>

            <div className="package-side">
              <span
                className={`package-badge${item.featured ? " package-badge-featured" : ""}`}
              >
                {item.badge}
              </span>
              <p className="package-side-copy">{item.description}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
