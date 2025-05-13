export default function Legend({ title, items, split = true }) {
  const orderedItems = [];
  if (split) {
    const mitad = Math.ceil(items.length / 2);
    const izquierda = items.slice(0, mitad);
    const derecha = items.slice(mitad);
    for (let i = 0; i < mitad; i++) {
      if (izquierda[i]) orderedItems.push(izquierda[i]);
      if (derecha[i]) orderedItems.push(derecha[i]);
    }
  } else {
    orderedItems.push(...items);
  }
  return (
    <div className="legend-section">
      <div className="row mb-2">
        <div className="col-12">
          <h6>{title}</h6>
        </div>
      </div>
      <div className="row">
        {orderedItems.map((item, index) => (
          <div
            key={index}
            className={`col-${
              split ? "6" : "12"
            } d-flex mb-1 align-items-start gap-2`}
          >
            {item.label && (
              <span
                className={`badge rounded-pill text-center ${item.color}`}
                style={{
                  minWidth: "1.75rem",
                  whiteSpace: "normal",
                  textAlign: "center",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              >
                {item.label}
              </span>
            )}
            <span className="d-block" style={{ fontSize: "0.75rem" }}>
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
