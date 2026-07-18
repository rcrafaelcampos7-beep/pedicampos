import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { PlanCard } from "../components/ui/PlanCard.jsx";
import { usePediData } from "../hooks/usePediData.js";
import { Link } from "../routes/router.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getActivePlans } from "../utils/plans.js";
import "../styles/landing-benefits-v2.css";
import "../styles/landing-page-v2.css";

const BENEFITS = [
  {
    title: "Cardápio digital",
    description: "Produtos, categorias e adicionais organizados em uma página personalizada.",
    icon: "menu",
  },
  {
    title: "Pedido online",
    description: "O cliente monta e envia o pedido com todas as informações necessárias.",
    icon: "order",
  },
  {
    title: "Pix integrado",
    description: "Receba pagamentos de forma rápida e acompanhe a confirmação do pedido.",
    icon: "pix",
  },
  {
    title: "WhatsApp automático",
    description: "Os pedidos chegam organizados no WhatsApp, sem mensagens confusas.",
    icon: "message",
  },
  {
    title: "Painel administrativo",
    description: "Gerencie produtos, pedidos, preços e informações da loja em um só lugar.",
    icon: "dashboard",
  },
];

const FLOW_STEPS = [
  {
    title: "O cliente acessa sua loja",
    description: "Pelo link personalizado, com a identidade visual do seu negócio.",
    icon: "store",
  },
  {
    title: "Escolhe produtos e adicionais",
    description: "Navega pelas categorias e personaliza cada item antes de adicionar.",
    icon: "cart",
  },
  {
    title: "Finaliza o pedido e o pagamento",
    description: "Confere os dados e escolhe uma das formas disponíveis para a loja.",
    icon: "pix",
  },
  {
    title: "A loja recebe tudo organizado",
    description: "As informações chegam ao canal de pedidos liberado pelo plano contratado.",
    icon: "receive",
  },
];

const DIFFERENTIALS = [
  "Sua própria marca",
  "Relacionamento direto com o cliente",
  "Sem comissão por cada pedido",
  "Catálogo personalizado",
  "Controle dos produtos e preços",
  "Canal direto pelo WhatsApp",
  "Pagamento online conforme o plano",
];

function BenefitIcon({ name }) {
  const paths = {
    menu: <><path d="M7 4.5h10a2 2 0 0 1 2 2v13l-3-2-3 2-3-2-3 2v-13a2 2 0 0 1 2-2Z" /><path d="M10 9h6M10 13h4" /></>,
    order: <><path d="M7 3.5h10v17H7z" /><path d="M10 8h4M10 12h4M10 16h2" /><path d="m15 15 1.5 1.5L20 13" /></>,
    pix: <><path d="m12 3 4 4-4 4-4-4 4-4Z" /><path d="m12 13 4 4-4 4-4-4 4-4Z" /><path d="m3 12 4-4 4 4-4 4-4-4ZM13 12l4-4 4 4-4 4-4-4Z" /></>,
    message: <><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><path d="M7.5 10h9M7.5 13h6" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /></>,
    store: <><path d="M4 10v10h16V10" /><path d="M3 10 5 4h14l2 6" /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" /><path d="M9 20v-5h6v5" /></>,
    cart: <><path d="M4 5h2l2 10h9l2-7H7" /><circle cx="10" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /><path d="M11 10h4M13 8v4" /></>,
    receive: <><path d="M4 7h16v12H4z" /><path d="M8 7V4h8v3M8 12h8M12 9v6" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

export function LandingPage() {
  const { platform } = usePediData();
  const [demoStores, setDemoStores] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const demoStore = demoStores[0] || null;
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
        if (active) setDemoStores([]);
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
          <a href="#painel">Painel</a>
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
        <section className="landing-hero-v2">
          <div className="landing-hero-v2-container">
            <div className="landing-hero-v2-copy">
              <span className="eyebrow">PEDIDOS ONLINE PARA O SEU NEGÓCIO</span>
              <h1>Venda online com sua marca, sem depender de marketplaces</h1>
              <p>
                Tenha sua própria loja virtual, receba pedidos organizados, pagamentos e atendimento
                em uma experiência profissional para você e seus clientes.
              </p>
              <div className="landing-hero-v2-actions">
                <a className="btn btn-primary btn-lg" href="#planos">Quero minha loja</a>
                <a className="btn btn-secondary btn-lg" href="#preview-produto">Ver demonstração</a>
              </div>
              <p className="landing-hero-v2-note">Sua identidade, seus produtos e seu relacionamento com o cliente.</p>
            </div>

            <div className="landing-hero-system" aria-label="Prévia da loja pública e do painel PediCampos">
              <div className="landing-hero-dashboard">
                <header><span className="landing-hero-dashboard-logo">PC</span><strong>Painel da loja</strong><i /></header>
                <div className="landing-hero-dashboard-body">
                  <aside>
                    <span className="active">Visão geral</span>
                    <span>Pedidos</span>
                    <span>Produtos</span>
                    <span>Categorias</span>
                  </aside>
                  <div className="landing-hero-dashboard-content">
                    <div className="landing-hero-dashboard-title"><div><small>Operação</small><strong>Visão geral</strong></div><span>Loja aberta</span></div>
                    <div className="landing-hero-metrics"><span><small>Pedidos</small><b>Hoje</b></span><span><small>Produtos</small><b>Ativos</b></span><span><small>Atendimento</small><b>Online</b></span></div>
                    <div className="landing-hero-order-row"><span>#1048</span><strong>Novo pedido</strong><i>Recebido</i></div>
                    <div className="landing-hero-order-row"><span>#1047</span><strong>Pedido confirmado</strong><i className="confirmed">Confirmado</i></div>
                  </div>
                </div>
              </div>

              <div className="landing-hero-phone">
                <div className="landing-hero-phone-head"><span>PC</span><div><strong>Sua loja</strong><small>Aberto agora</small></div></div>
                <div className="landing-hero-phone-search">Buscar produtos</div>
                <div className="landing-hero-phone-tabs"><span>Todos</span><span>Combos</span><span>Bebidas</span></div>
                <article><i /><div><strong>Produto em destaque</strong><small>Personalize seu pedido</small><b>R$ 24,00</b></div></article>
                <article><i className="secondary" /><div><strong>Combinação especial</strong><small>Escolha os adicionais</small><b>R$ 18,00</b></div></article>
                <div className="landing-hero-phone-cart"><span>2 itens</span><strong>R$ 42,00</strong></div>
              </div>

              <div className="landing-hero-payment"><span><BenefitIcon name="pix" /></span><div><small>Pagamento</small><strong>Pix aprovado</strong></div></div>
              <div className="landing-hero-notification"><span><BenefitIcon name="order" /></span><div><small>Novo pedido</small><strong>#1048 recebido</strong></div></div>
            </div>
          </div>
        </section>

        <section className="landing-trust-strip" aria-label="Benefícios imediatos">
          <div>
            <span><i aria-hidden="true">✓</i>Loja com sua identidade</span>
            <span><i aria-hidden="true">✓</i>Sem comissão por pedido</span>
            <span><i aria-hidden="true">✓</i>Pedidos organizados</span>
            <span><i aria-hidden="true">✓</i>Suporte na implantação</span>
          </div>
        </section>

        {sections.featureStrip !== false ? (
          <section className="landing-benefits" id="funcionalidades">
            <div className="landing-benefits-inner">
              <header className="landing-benefits-heading">
                <span className="eyebrow">UMA PLATAFORMA COMPLETA</span>
                <h2>Tudo o que sua loja precisa para vender online</h2>
                <p>
                  Receba pedidos, pagamentos e informações dos clientes em uma experiência simples,
                  profissional e personalizada para o seu negócio.
                </p>
              </header>

              <div className="landing-benefits-grid">
                {BENEFITS.map((benefit) => (
                  <Card as="article" key={benefit.title} className="landing-benefit-card" tabIndex="0">
                    <span className="landing-benefit-icon">
                      <BenefitIcon name={benefit.icon} />
                    </span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.description}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="landing-product-flow">
                <div className="landing-product-flow-copy">
                  <span className="eyebrow">CONTROLE E PRATICIDADE</span>
                  <h2>Do primeiro clique até o pedido confirmado</h2>
                  <p>
                    O PediCampos conecta o catálogo da loja, o pedido do cliente, o pagamento e o
                    atendimento em um único fluxo.
                  </p>
                  <ul className="landing-flow-list">
                    <li><span aria-hidden="true">✓</span>Pedido recebido em tempo real</li>
                    <li><span aria-hidden="true">✓</span>Informações organizadas</li>
                    <li><span aria-hidden="true">✓</span>Mais controle para a loja</li>
                  </ul>
                  <div className="landing-flow-actions">
                    <a className="btn btn-primary btn-lg" href="#planos">Conhecer os planos</a>
                    <a className="btn btn-secondary btn-lg" href="#preview-produto">Ver demonstração</a>
                  </div>
                </div>

                <div className="landing-product-preview" id="preview-produto" aria-label="Prévia do fluxo de pedidos PediCampos">
                  <div className="landing-preview-orbit" aria-hidden="true" />
                  <div className="landing-preview-phone">
                    <div className="landing-preview-phone-top">
                      <span className="landing-preview-logo">PC</span>
                      <div><strong>Loja personalizada</strong><small>Aberto agora</small></div>
                    </div>
                    <div className="landing-preview-search">Buscar produtos</div>
                    <div className="landing-preview-categories">
                      <span>Todos</span><span>Mais pedidos</span><span>Bebidas</span>
                    </div>
                    <div className="landing-preview-products">
                      <article>
                        <span className="landing-preview-product-image" />
                        <div><strong>Produto em destaque</strong><small>Descrição do produto</small><b>R$ 24,00</b></div>
                      </article>
                      <article>
                        <span className="landing-preview-product-image is-secondary" />
                        <div><strong>Combinação especial</strong><small>Personalize seu pedido</small><b>R$ 18,00</b></div>
                      </article>
                    </div>
                    <div className="landing-preview-cart"><span>2 itens</span><strong>Ver carrinho · R$ 42,00</strong></div>
                  </div>

                  <article className="landing-preview-order">
                    <span className="landing-preview-order-icon"><BenefitIcon name="order" /></span>
                    <div><small>Novo pedido</small><strong>#1048</strong><span>2 itens · R$ 42,00</span></div>
                  </article>

                  <div className="landing-preview-statuses">
                    <span><i aria-hidden="true">✓</i>Pix aprovado</span>
                    <span><i aria-hidden="true">✓</i>Pedido enviado ao WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {sections.howItWorks !== false ? (
          <section className="landing-how" id="como-funciona">
            <div className="landing-v2-container">
              <header className="landing-v2-heading">
                <span className="eyebrow">COMO FUNCIONA</span>
                <h2>Um fluxo simples para o cliente e organizado para a loja</h2>
                <p>Da escolha do produto ao recebimento do pedido, cada etapa acontece dentro de uma experiência conectada.</p>
              </header>
              <div className="landing-how-grid">
                {FLOW_STEPS.map((step, index) => (
                  <article className="landing-how-step" key={step.title}>
                    <div className="landing-how-step-top">
                      <span className="landing-how-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="landing-how-icon"><BenefitIcon name={step.icon} /></span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sections.features !== false ? (
          <>
            <section className="landing-panel-section" id="painel">
              <div className="landing-v2-container landing-panel-layout">
                <div className="landing-panel-copy">
                  <span className="eyebrow">GESTÃO DA OPERAÇÃO</span>
                  <h2>Tudo sob controle em um único painel</h2>
                  <p>
                    Gerencie produtos, categorias, pedidos, preços e informações da sua loja sem
                    depender de suporte para cada alteração.
                  </p>
                  <ul>
                    <li><span aria-hidden="true">✓</span>Produtos, categorias e adicionais</li>
                    <li><span aria-hidden="true">✓</span>Pedidos e acompanhamento de status</li>
                    <li><span aria-hidden="true">✓</span>Configurações e identidade da loja</li>
                  </ul>
                </div>

                <div className="landing-admin-preview" aria-label="Prévia do painel administrativo PediCampos">
                  <aside>
                    <div className="landing-admin-brand"><span>PC</span><strong>PediCampos</strong></div>
                    <nav aria-label="Menu ilustrativo do painel">
                      <span className="active"><BenefitIcon name="dashboard" />Visão geral</span>
                      <span><BenefitIcon name="order" />Pedidos</span>
                      <span><BenefitIcon name="menu" />Produtos</span>
                      <span><BenefitIcon name="store" />Loja</span>
                    </nav>
                  </aside>
                  <div className="landing-admin-main">
                    <header><div><small>PAINEL DA LOJA</small><strong>Visão geral</strong></div><span>Loja aberta</span></header>
                    <div className="landing-admin-metrics">
                      <article><small>Pedidos</small><strong>Recentes</strong><i /></article>
                      <article><small>Produtos</small><strong>Organizados</strong><i /></article>
                      <article><small>Operação</small><strong>Atualizada</strong><i /></article>
                    </div>
                    <section className="landing-admin-orders">
                      <div className="landing-admin-section-title"><strong>Pedidos recentes</strong><span>Ver pedidos</span></div>
                      <div className="landing-admin-order"><span>#1048</span><div><strong>Novo pedido</strong><small>2 itens · Pix</small></div><i>Recebido</i></div>
                      <div className="landing-admin-order"><span>#1047</span><div><strong>Pedido confirmado</strong><small>3 itens · Entrega</small></div><i className="confirmed">Confirmado</i></div>
                      <div className="landing-admin-order"><span>#1046</span><div><strong>Em preparação</strong><small>1 item · Retirada</small></div><i className="preparing">Preparando</i></div>
                    </section>
                    <section className="landing-admin-products">
                      <div><span /><p><strong>Produtos</strong><small>Fotos, preços e disponibilidade</small></p></div>
                      <i>Ativos</i>
                    </section>
                  </div>
                </div>
              </div>
            </section>

            <section className="landing-differences" id="diferenciais">
              <div className="landing-v2-container landing-differences-layout">
                <header>
                  <span className="eyebrow">SEU NEGÓCIO, SUAS REGRAS</span>
                  <h2>Uma alternativa profissional aos marketplaces</h2>
                  <p>Mais identidade, proximidade com o cliente e controle sobre a operação da sua própria loja.</p>
                </header>
                <div className="landing-differences-grid">
                  {DIFFERENTIALS.map((item) => (
                    <article key={item}><span aria-hidden="true">✓</span><strong>{item}</strong></article>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {sections.plans !== false ? (
          <section className="landing-plans-section" id="planos">
            <div className="landing-v2-container">
            <div className="landing-v2-heading">
              <span className="eyebrow">Planos</span>
              <h2>Escolha o nível de operação da sua loja.</h2>
              <p>Implantação a partir de {formatCurrency(platform.implementationPrice)}.</p>
            </div>
            <div className="plans-grid">
              {landingPlans.map((plan) => (
                <PlanCard key={plan.key} plan={plan} featured={plan.highlighted} actionLabel="Quero esse" />
              ))}
            </div>
            </div>
          </section>
        ) : null}

        {sections.faq !== false ? (
          <section className="landing-faq-section" id="duvidas">
            <div className="landing-v2-container landing-faq-layout">
              <header>
                <span className="eyebrow">DÚVIDAS FREQUENTES</span>
                <h2>Respostas diretas para decidir com segurança</h2>
                <p>Entenda como funcionam a loja, os pedidos, os pagamentos e a gestão pelo painel.</p>
                <a className="btn btn-secondary btn-md" href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
              </header>
              <div className="landing-faq-list">
                {(platform.faq || []).map(({ question, answer }, index) => {
                  const expanded = openFaqIndex === index;
                  const panelId = `landing-faq-panel-${index}`;
                  return (
                    <article className="landing-faq-item" key={question}>
                      <h3>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={panelId}
                          onClick={() => setOpenFaqIndex(expanded ? -1 : index)}
                        >
                          <span>{question}</span>
                          <i aria-hidden="true">{expanded ? "−" : "+"}</i>
                        </button>
                      </h3>
                      <div id={panelId} hidden={!expanded}>
                        <p>{answer}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="landing-final-cta">
          <div className="landing-v2-container landing-final-cta-inner">
            <span className="eyebrow">SUA LOJA, DO SEU JEITO</span>
            <h2>Pronto para transformar a forma como sua loja recebe pedidos?</h2>
            <p>Tenha uma loja profissional com sua identidade e mais controle sobre cada venda.</p>
            <div>
              <a className="btn btn-primary btn-lg" href="#planos">Começar agora</a>
              <a className="btn btn-secondary btn-lg" href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer-v2" id="contato">
        <div className="landing-v2-container">
          <div className="landing-footer-v2-grid">
            <div className="landing-footer-v2-brand">
              <Link to="/" className="logo-link">
                <span className="brand-mark">{platform.logo}</span>
                <strong>{platform.name}</strong>
              </Link>
              <p>{platform.footerText}</p>
            </div>
            <nav aria-label="Produto">
              <strong>Produto</strong>
              <a href="#funcionalidades">Funcionalidades</a>
              <a href="#como-funciona">Como funciona</a>
              <a href="#painel">Painel</a>
            </nav>
            <nav aria-label="Conheça">
              <strong>Conheça</strong>
              <a href="#planos">Planos</a>
              <a href="#preview-produto">Demonstração</a>
              <a href="#duvidas">Dúvidas</a>
            </nav>
            <nav aria-label="Contato e acessos">
              <strong>Contato</strong>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
              {instagramHandle ? <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noreferrer">Instagram</a> : null}
              <Link to="/admin">Admin loja</Link>
              <Link to="/master">Master</Link>
            </nav>
          </div>
          <div className="landing-footer-v2-bottom">
            <small>© {new Date().getFullYear()} {platform.name}. Todos os direitos reservados.</small>
            <span>Tecnologia para negócios locais</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
