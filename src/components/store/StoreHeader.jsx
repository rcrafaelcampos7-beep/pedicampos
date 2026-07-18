import { useEffect, useState } from "react";
import { Link } from "../../routes/router.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";

function initialsFromName(name) {
  const words = String(name || "Loja").trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return (words[0] || "L").slice(0, 2).toUpperCase();
}

export function StoreHeader({ store }) {
  const whatsappLink = `https://wa.me/${store.whatsapp}`;
  const logoUrl = String(store.logo || "").trim();
  const configuredInitials = String(store.fallbackInitials || "").trim().slice(0, 4).toUpperCase();
  const fallbackInitials = configuredInitials || initialsFromName(store.name);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  return (
    <header className="store-showcase" style={{ "--store-color": store.primaryColor }}>
      <div className="store-banner-stage">
        {typeof store.banner === "string" && store.banner.trim() ? (
          <img src={store.banner} alt={`Banner ${store.name}`} decoding="async" fetchPriority="high" />
        ) : <div className="store-banner-placeholder" aria-hidden="true" />}
        <div className="store-banner-overlay" />
        <div className="store-banner-toolbar">
          <span className="store-banner-brand">{store.name}</span>
          <a href={whatsappLink} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${store.name}`}>
            WhatsApp
          </a>
        </div>
      </div>

      <div className="store-profile-shell">
        <div className="store-profile-panel">
          <div className="store-logo">
            {logoUrl && !logoFailed ? (
              <img src={logoUrl} alt={`Logo ${store.name}`} decoding="async" onError={() => setLogoFailed(true)} />
            ) : (
              <span aria-label={`Iniciais ${fallbackInitials}`}>{fallbackInitials}</span>
            )}
          </div>

          <div className="store-profile-copy">
            <Badge tone={store.open ? "success" : "danger"} className="store-open-badge">
              <span className="store-status-dot" aria-hidden="true" />
              {store.open ? "Aberto agora" : "Fechado"}
            </Badge>
            <h1>{store.name}</h1>
            <p>{store.segment}</p>
          </div>

          <div className="store-meta" aria-label="Informações da loja">
            <span><small>Tempo</small><strong>{store.deliveryTime}</strong></span>
            <span><small>Entrega</small><strong>{formatCurrency(store.deliveryFee)}</strong></span>
            <span><small>Endereço</small><strong>{store.address}</strong></span>
          </div>

          <div className="store-profile-actions">
            <Button
              variant="secondary"
              onClick={() => navigator.share?.({ title: store.name, url: window.location.href })}
            >
              Compartilhar
            </Button>
            <Link className="btn btn-store btn-md" to={`/${store.slug}/checkout`}>
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
