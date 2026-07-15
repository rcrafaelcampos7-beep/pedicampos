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
    <header className="store-hero" style={{ "--store-color": store.primaryColor }}>
      <img src={store.banner} alt={`Banner ${store.name}`} decoding="async" fetchPriority="high" />
      <div className="store-hero-overlay" />
      <div className="store-hero-content">
        <div className="store-logo">
          {logoUrl && !logoFailed ? (
            <img src={logoUrl} alt={`Logo ${store.name}`} decoding="async" onError={() => setLogoFailed(true)} />
          ) : (
            <span aria-label={`Iniciais ${fallbackInitials}`}>{fallbackInitials}</span>
          )}
        </div>
        <div className="store-hero-copy">
          <Badge tone={store.open ? "success" : "danger"}>
            {store.open ? "Aberto agora" : "Fechado"}
          </Badge>
          <h1>{store.name}</h1>
          <p>{store.segment}</p>
          <div className="store-meta">
            <span>{store.deliveryTime}</span>
            <span>{formatCurrency(store.deliveryFee)} entrega</span>
            <span>{store.address}</span>
          </div>
        </div>
        <div className="store-hero-actions">
          <a className="btn btn-light btn-md" href={whatsappLink} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <Button
            variant="light"
            onClick={() => navigator.share?.({ title: store.name, url: window.location.href })}
          >
            Compartilhar
          </Button>
          <Link className="btn btn-store btn-md" to={`/${store.slug}/checkout`}>
            Checkout
          </Link>
        </div>
      </div>
    </header>
  );
}
