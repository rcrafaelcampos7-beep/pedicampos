import heroImage from "../assets/pedicampos-hero.webp";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { PlanCard } from "../components/ui/PlanCard.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { Link } from "../routes/router.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getActivePlans } from "../utils/plans.js";

export function LandingPage() {
  const { stores, platform } = usePediData();
  const [demoStores, setDemoStores] = useState([]);
  const [demoLoading, setDemoLoading] = useState(true);
  const [demoError, setDemoError] = useState("");
  const demoStore = demoStores[0] || null;
  const activeStores = stores.filter((store) => store.active);
  const sections = platform.sections || {};
  const whatsappUrl = `https://wa.me/${platform.whatsapp}`;
  const instagramHandle = String(platform.instagram || "").replace("@", "");
  const landingPlans = getActivePlans(platform).map((plan) => ({
    ...plan,
    price: plan.priceLabel || `${formatCurrency(plan.price)}/mês`,
  }));

  useEffect(() => {
    let active = true;
    import("../services/database.js")
      .then(({ getFeaturedDemoStores }) => getFeaturedDemoStores())
      .then((result) => {
        if (active) setDemoStores(result);
      })
      .catch(() => {
        if (active) setDemoError("As lojas de demonstração estão temporariamente indisponíveis.");
      })
      .finally(() => {
        if (active) setDemoLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div
      className="landing-page"
      style={{
        "--color-primary": platform.primaryColor,
        "--color-primary-dark": platform.primaryColor,
        "--color-graphite": platform.secondaryColor,
      }}
    >
      <header className="landing-nav">
        <Link to="/" className="logo-link">
          <span className="brand-mark">{platform.logo}</span>
          <strong>{platform.name}</strong>
        </Link>
        <nav>
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#demonstracao">Loja exemplo</a>
          <a href="#planos">Planos</a>
          <a href="#contato">Contato</a>
        </nav>
        <div className="nav-actions">
          {demoStore ? <Link className="btn btn-secondary btn-md" to={`/${demoStore.slug}`}>Ver loja exemplo</Link> : null}
          <a className="btn btn-primary btn-md" href={whatsappUrl} target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-container">
            <div className="landing-hero-content">
              <span className="eyebrow">{platform.name} para negócios locais</span>
              <h1>{platform.heroTitle || platform.slogan}</h1>
              <p>{platform.heroSubtitle || platform.subtitle}</p>
              <div className="hero-actions">
                {demoStore ? (
                  <Link className="btn btn-primary btn-lg" to={`/${demoStore.slug}`}>{platform.heroPrimaryButton}</Link>
                ) : (
                  <a className="btn btn-primary btn-lg" href="#planos">Conhecer os planos</a>
                )}
                <a className="btn btn-secondary btn-lg" href="#planos">
                  {platform.heroSecondaryButton}
                </a>
              </div>
              <div className="hero-stats">
                <span>
                  <strong>{activeStores.length}</strong>
                  lojas ativas
                </span>
                <span>
                  <strong>{formatCurrency(platform.implementationPrice)}</strong>
                  implantação a partir de
                </span>
                <span>
                  <strong>Planos por recurso</strong>
                  Start, Pro e Premium
                </span>
              </div>
            </div>
            <div className="landing-hero-image">
              <img
                src={heroImage}
                alt={`${platform.name} em celular com pedidos online`}
                width="1400"
                height="735"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        {sections.featureStrip !== false ? (
          <section className="section feature-strip" id="funcionalidades">
            {(platform.featureHighlights || []).map((item) => (
              <Card key={item}>
                <span className="feature-dot" />
                <strong>{item}</strong>
              </Card>
            ))}
          </section>
        ) : null}

        {sections.howItWorks !== false ? (
          <section className="section two-column" id="como-funciona">
            <div>
              <span className="eyebrow">Como funciona</span>
              <h2>{platform.howItWorksTitle}</h2>
              <p>{platform.howItWorksText}</p>
            </div>
            <div className="steps-grid">
              {(platform.howItWorksSteps || []).map((step, index) => (
                <Card key={step} className="step-card">
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {sections.features !== false ? (
          <section className="section" id="funcionalidades-lista">
            <div className="section-heading">
              <span className="eyebrow">Funcionalidades</span>
              <h2>Uma base completa para vender, operar e evoluir.</h2>
            </div>
            <div className="features-grid">
              {(platform.features || []).map((feature) => (
                <Card key={feature} className="feature-card">
                  <span className="checkmark">✓</span>
                  <strong>{feature}</strong>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {sections.demo !== false && (demoLoading || demoError || demoStores.length) ? (
          <section className="section demo-section" id="demonstracao">
            <div>
              <span className="eyebrow">Lojas de demonstração</span>
              <h2>Conheça experiências reais da PediCampos</h2>
              <p>
                Veja como uma vitrine da PediCampos apresenta produtos, categorias, adicionais e pedidos
                para o cliente final.
              </p>
            </div>
            <div className="demo-store-grid">
              {demoLoading ? <Card><p>Carregando lojas de demonstração...</p></Card> : null}
              {!demoLoading && demoError ? <Card><p>{demoError}</p></Card> : null}
              {!demoLoading && !demoError ? demoStores.map((store) => (
                <Card className="demo-card" key={store.id}>
                  {store.banner ? <img src={store.banner} alt={store.name} loading="lazy" decoding="async" /> : null}
                  <div>
                    {store.logo && /^https?:\/\//i.test(store.logo) ? (
                      <img className="demo-store-logo" src={store.logo} alt="" loading="lazy" decoding="async" />
                    ) : <span className="demo-store-initials">{store.fallbackInitials || store.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}</span>}
                    <strong>{store.name}</strong>
                    <span>{store.demoLabel || store.segment}</span>
                    <Link className="btn btn-primary btn-md" to={`/${store.slug}`}>Acessar loja exemplo</Link>
                  </div>
                </Card>
              )) : null}
            </div>
          </section>
        ) : null}

        {sections.plans !== false ? (
          <section className="section" id="planos">
            <div className="section-heading">
              <span className="eyebrow">Planos</span>
              <h2>Escolha o nível de operação da sua loja.</h2>
              <p>Implantação a partir de {formatCurrency(platform.implementationPrice)}.</p>
            </div>
            <div className="plans-grid">
              {landingPlans.map((plan) => (
                <PlanCard key={plan.key} plan={plan} featured={plan.highlighted} actionLabel="Quero esse" />
              ))}
            </div>
          </section>
        ) : null}

        {sections.faq !== false ? (
          <section className="section faq-section">
            <div className="section-heading">
              <span className="eyebrow">FAQ</span>
              <h2>Perguntas frequentes</h2>
            </div>
            <div className="faq-grid">
              {(platform.faq || []).map(({ question, answer }) => (
                <Card key={question} className="faq-card">
                  <strong>{question}</strong>
                  <p>{answer}</p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="landing-footer" id="contato">
        <div>
          <strong>{platform.name}</strong>
          <p>{platform.footerText}</p>
        </div>
        <nav>
          <Link to="/master">Master</Link>
          <Link to="/admin">Admin loja</Link>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {instagramHandle ? (
            <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noreferrer">
              Instagram
            </a>
          ) : null}
        </nav>
        <small>© {new Date().getFullYear()} {platform.name}. Todos os direitos reservados.</small>
      </footer>
    </div>
  );
}
