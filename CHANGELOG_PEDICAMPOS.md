# CHANGELOG - PediCampos

Atualizado em: 2026-07-09

Este changelog registra as principais alteracoes feitas ate o estado atual do projeto. Datas sao aproximadas dentro do ciclo de desenvolvimento local.

## v0.1 - Criacao inicial da base

Implementado:

- Criado projeto React/Vite/JavaScript.
- Criada entrada `src/main.jsx`.
- Criado roteamento simples em `src/routes/router.jsx`.
- Criada estrutura de paginas em `src/pages`.
- Criada estrutura de componentes em `src/components`.
- Criados estilos globais em `src/styles/global.css` e variaveis em `src/styles/variables.css`.
- Criado `README.md`.
- Criados scripts em `package.json`:
  - `npm run dev`;
  - `npm run build`;
  - `npm run preview`.
- Ajustado dev server para `127.0.0.1:5174`.

Arquivos principais:

- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/routes/router.jsx`
- `src/styles/global.css`
- `src/styles/variables.css`

## v0.2 - Dados mockados e multi-loja

Implementado:

- Criado mock de lojas em `src/data/mockStores.js`.
- Criado mock de pedidos em `src/data/mockOrders.js`.
- Criada persistencia em localStorage em `src/services/storage.js`.
- Criado banco mock principal `pedicampos.database.v1`.
- Criada normalizacao de dados ao carregar localStorage.
- Criadas lojas demo como lojas reais:
  - Neguinho do Acai;
  - Gordinho Burguer.
- Cada loja recebeu:
  - id;
  - slug;
  - segmento;
  - plano;
  - status ativa/inativa;
  - status aberta/fechada;
  - cor;
  - WhatsApp;
  - categorias;
  - produtos;
  - adicionais;
  - configuracoes de pagamento.

Arquivos principais:

- `src/data/mockStores.js`
- `src/data/mockOrders.js`
- `src/services/storage.js`
- `src/hooks/usePediData.js`

## v0.3 - Loja publica, carrinho e checkout

Implementado:

- Criada loja publica por slug em `src/pages/StorePage.jsx`.
- Criado header de loja em `src/components/store/StoreHeader.jsx`.
- Criadas abas de categorias em `src/components/store/CategoryTabs.jsx`.
- Criado card de produto em `src/components/store/ProductCard.jsx`.
- Criado modal de produto em `src/components/store/ProductModal.jsx`.
- Criado carrinho em `src/hooks/useCart.js`.
- Criado drawer/modal de carrinho em `src/components/store/CartDrawer.jsx`.
- Criado checkout em `src/pages/CheckoutPage.jsx`.
- Criada pagina de acompanhamento em `src/pages/OrderTrackingPage.jsx`.
- Criada timeline em `src/components/store/OrderTimeline.jsx`.
- Criadas regras de loja inativa e loja fechada.
- Criado pedido salvo no mock/localStorage para planos com checkout.
- Criado fluxo Start via WhatsApp manual.
- Criado Pix online simulado para Premium.

Arquivos principais:

- `src/pages/StorePage.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/OrderTrackingPage.jsx`
- `src/hooks/useCart.js`
- `src/components/store/*`
- `src/utils/formatCurrency.js`
- `src/utils/orderStatus.js`

## v0.4 - Painel admin da loja

Implementado:

- Criado login fake admin em `src/pages/AdminLogin.jsx`.
- Criado layout admin em `src/components/admin/AdminLayout.jsx`.
- Criado dashboard admin em `src/pages/AdminDashboard.jsx`.
- Criado painel de pedidos em `src/pages/AdminOrders.jsx`.
- Criado CRUD de produtos em `src/pages/AdminProducts.jsx`.
- Criado CRUD de categorias em `src/pages/AdminCategories.jsx`.
- Criada tela de configuracoes da loja em `src/pages/AdminSettings.jsx`.
- Criada selecao de loja via localStorage:
  - `pedicampos.admin.auth`;
  - `pedicampos.admin.storeId`.
- Criada previa de mensagem WhatsApp simulada no pedido.
- Criada alteracao manual de status do pedido.

Arquivos principais:

- `src/pages/AdminLogin.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/AdminOrders.jsx`
- `src/pages/AdminProducts.jsx`
- `src/pages/AdminCategories.jsx`
- `src/pages/AdminSettings.jsx`
- `src/components/admin/AdminLayout.jsx`
- `src/utils/whatsappMessage.js`

## v0.5 - Painel master

Implementado:

- Criado login fake master em `src/pages/MasterLogin.jsx`.
- Criado layout master em `src/components/master/MasterLayout.jsx`.
- Criado dashboard master em `src/pages/MasterDashboard.jsx`.
- Criada listagem/edicao de lojas em `src/pages/MasterStores.jsx`.
- Criada criacao de loja em `src/pages/MasterCreateStore.jsx`.
- Criado painel de pedidos gerais em `src/pages/MasterOrders.jsx`.
- Criada tela de planos em `src/pages/MasterPlans.jsx`.
- Criada tela de configuracoes da plataforma em `src/pages/MasterSettings.jsx`.
- Criada ativacao/desativacao de lojas.
- Criada edicao de slug, plano, cor, logo, banner, WhatsApp, endereco, taxa e status.
- Nova loja criada pelo master ja entra no localStorage e funciona publicamente pelo slug.
- Loja inativa mostra aviso publico e nao aceita pedidos.

Arquivos principais:

- `src/pages/MasterLogin.jsx`
- `src/pages/MasterDashboard.jsx`
- `src/pages/MasterStores.jsx`
- `src/pages/MasterCreateStore.jsx`
- `src/pages/MasterOrders.jsx`
- `src/pages/MasterPlans.jsx`
- `src/pages/MasterSettings.jsx`
- `src/components/master/MasterLayout.jsx`
- `src/utils/slug.js`

## v0.6 - Landing page e polimento responsivo

Implementado:

- Criada landing comercial em `src/pages/LandingPage.jsx`.
- Landing passou a usar dados editaveis do master.
- Criado hero com grid desktop e coluna unica mobile.
- Corrigido bug de responsividade/sobreposicao em que cards ficavam por baixo do banner no desktop.
- Criadas secoes:
  - header;
  - hero;
  - cards de destaque;
  - como funciona;
  - funcionalidades;
  - demonstracao;
  - planos;
  - FAQ;
  - rodape.
- Criadas imagens/assets:
  - `src/assets/pedicampos-hero.png`;
  - `src/assets/neguinho-banner.png`;
  - `src/assets/gordinho-banner.png`.
- Ajustado CSS para manter secoes no fluxo normal da pagina.

Arquivos principais:

- `src/pages/LandingPage.jsx`
- `src/styles/global.css`
- `src/assets/*.png`

## v0.7 - Planos e bloqueios por recurso

Implementado:

- Criado utilitario de planos em `src/utils/plans.js`.
- Criados planos:
  - Start;
  - Pro;
  - Premium.
- Criadas features por plano.
- Criado `PlanGuard` em `src/components/admin/PlanGuard.jsx`.
- `/admin/pedidos` bloqueado para planos sem `ordersPanel`.
- `/admin/adicionais` bloqueado para planos sem `additionals`.
- Checkout no site controlado por `siteCheckout`.
- Pix online controlado por `pixOnline`.
- Landing exibe planos ativos vindos de `platform.plans`.
- Master permite editar precos, textos e destaque dos planos.
- Premium destacado como melhor escolha.

Arquivos principais:

- `src/utils/plans.js`
- `src/components/admin/PlanGuard.jsx`
- `src/pages/MasterPlans.jsx`
- `src/pages/MasterSettings.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/LandingPage.jsx`

## v0.8 - Adicionais configuraveis

Implementado:

- Adicionais deixaram de ser dados fixos por produto.
- Criada estrutura `additionalGroups` por loja.
- Criados grupos de adicionais com:
  - `storeId`;
  - nome;
  - descricao;
  - obrigatorio/opcional;
  - minimo;
  - maximo;
  - selecao unica/multipla;
  - produtos vinculados;
  - opcoes;
  - status ativo/inativo.
- Criada tela `/admin/adicionais`.
- Produtos passaram a vincular/desvincular grupos de adicionais.
- Modal de produto passou a ler grupos ativos vinculados ao produto.
- Carrinho passou a salvar `selectedAdditionals`.
- Checkout, pedido salvo, acompanhamento e painel de pedidos passaram a exibir adicionais.
- Dados antigos com `addons` sao normalizados/fallback.

Arquivos principais:

- `src/pages/AdminAdditionals.jsx`
- `src/pages/AdminProducts.jsx`
- `src/components/store/ProductModal.jsx`
- `src/components/store/CartDrawer.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/AdminOrders.jsx`
- `src/pages/OrderTrackingPage.jsx`
- `src/services/storage.js`
- `src/data/mockStores.js`

## v0.9 - Configuracoes da plataforma

Implementado:

- `defaultPlatformSettings` expandido em `src/services/storage.js`.
- Plataforma passou a ter:
  - identidade;
  - cores;
  - slogan;
  - subtitulo;
  - textos do hero;
  - botoes do hero;
  - implantacao;
  - feature highlights;
  - funcionalidades;
  - passos "como funciona";
  - FAQ;
  - planos;
  - features por plano.
- Master configuracoes passou a editar landing e planos.
- Landing passou a refletir mudancas salvas no localStorage.

Arquivos principais:

- `src/services/storage.js`
- `src/pages/MasterSettings.jsx`
- `src/pages/LandingPage.jsx`
- `src/components/ui/PlanCard.jsx`

## v0.10 - Preparacao para deploy SPA

Implementado:

- Adicionado `vercel.json` com rewrite de todas as rotas para `/index.html`.
- Objetivo: permitir acesso direto a rotas como `/neguinhodoacai`, `/admin` e `/master` em deploy Vercel.

Arquivo principal:

- `vercel.json`

## v0.11 - Memoria permanente do projeto

Implementado nesta rotina:

- Criado `PROJECT_CONTEXT.md`.
- Criado `TODO_PEDICAMPOS.md`.
- Criado `CHANGELOG_PEDICAMPOS.md`.
- Criado `ARCHITECTURE_PEDICAMPOS.md`.
- Documentado estado atual do projeto antes de novas implementacoes.

Observacoes:

- Esta versao nao implementa funcionalidade nova.
- Esta versao nao refatora codigo.
- Esta versao apenas registra a memoria do projeto.

## v0.12 - Revisao responsiva e visual

Implementado:

- Revisada responsividade das telas principais por CSS, sem alterar regras de negocio.
- Arquivo alterado: `src/styles/global.css`.
- Menus mobile da landing configurados com rolagem horizontal.
- Sidebar admin/master adaptada para mobile como barra superior com rolagem horizontal.
- Tabelas do admin/master mantidas com scroll horizontal controlado.
- Modais ajustados com limite de altura e scroll interno.
- Botoes, textos, cards, carrinho e metricas ajustados para telas pequenas.

Build:

- `npm run build` passou apos a revisao responsiva.

## v0.13 - Correcoes e validacoes de estabilidade

Implementado/validado:

- Corrigido import ausente de `formatCurrency` em `src/pages/AdminProducts.jsx`.
- Import adicionado: `import { formatCurrency } from "../utils/formatCurrency.js";`.
- `npm run build` passou apos a correcao do import.
- Sistema testado com localStorage limpo:
  - `pedicampos.database.v1` foi criado corretamente;
  - mocks iniciais carregaram;
  - Neguinho do Acai carregou;
  - Gordinho Burguer carregou;
  - `platform` e `platformSettings` carregaram com PediCampos.
- Rotas principais responderam 200:
  - `/`;
  - `/neguinhodoacai`;
  - `/gordinhoburguer`;
  - `/admin`;
  - `/master`.
- Precos oficiais confirmados/corrigidos:
  - Implantacao: R$ 599,99;
  - Start: R$ 99,99/mes;
  - Pro: R$ 179,99/mes;
  - Premium: R$ 199,99/mes.
- Normalizacao/migracao no storage ajustada para corrigir valores antigos `179`/`199` para `179.99`/`199.99`.

Proxima tarefa registrada:

- Testar painel master: `/master`, login fake, dashboard, lojas, criacao/edicao, slug, plano, ativar/desativar, `/master/configuracoes` e reflexos na landing/loja publica.

## v0.14 - Comunicacao publica de formas de pagamento

Implementado:

- Removido do checkout publico o card lateral "Formas ativas".
- O resumo lateral do checkout publico agora fica limitado a itens, subtotal, entrega e total.
- A loja publica e o checkout nao exibem informacoes internas de plano, upgrade ou recurso bloqueado para o consumidor final.
- As formas de pagamento publicas passaram a aparecer apenas como:
  - Pix;
  - Dinheiro;
  - Cartao.
- Labels publicos antigos `Pix online`, `Pix na entrega` e `Cartao na entrega` foram substituidos por labels simples.
- Internamente, `pixOnline` continua existindo para controlar QR Code/copia e cola simulado quando o plano/recurso permitir.
- Mensagem manual de WhatsApp do checkout inclui `Forma de pagamento: Pix` quando Pix e escolhido.
- Se existir chave Pix configurada na loja, a mensagem pode incluir `Chave Pix`.
- `storage.js` passou a normalizar metodos antigos (`pixDelivery`, `cardDelivery`) e labels antigos de pedidos para `Pix`, `Dinheiro` e `Cartao`.
- Admin da loja passou a usar nomenclatura interna mais clara para pagamento: `Pix`, `Pix automatico / QR Code`, `Dinheiro` e `Cartao`.

Arquivos alterados nesta etapa:

- `src/pages/CheckoutPage.jsx`
- `src/pages/StorePage.jsx`
- `src/pages/AdminSettings.jsx`
- `src/services/storage.js`
- `src/data/mockStores.js`
- `src/data/mockOrders.js`
- `src/utils/whatsappMessage.js`
- `PROJECT_CONTEXT.md`
- `TODO_PEDICAMPOS.md`
- `CHANGELOG_PEDICAMPOS.md`
- `ARCHITECTURE_PEDICAMPOS.md`

Build:

- `npm run build` passou apos a correcao.

## v0.15 - Regra comercial de pagamentos por plano

Implementado:

- Atualizada regra oficial de pagamento por plano:
  - Start: pedido pelo WhatsApp e pagamento manual por Pix, Cartao ou Dinheiro;
  - Pro: pedido salvo no painel, acompanhamento e pagamento automatico simulado por Pix e Cartao;
  - Premium: tudo do Pro mais WhatsApp automatico simulado, mensagens por status e automacoes.
- `src/utils/plans.js` passou a registrar features comerciais de pagamento:
  - `paymentsManual`;
  - `pixManual`;
  - `cardManual`;
  - `pixAutomatic`;
  - `cardAutomatic`;
  - `onlinePayments`;
  - `automaticPaymentConfirmation`.
- Checkout publico manteve os labels simples `Pix`, `Cartao` e `Dinheiro`.
- Pro e Premium agora podem exibir experiencia simulada de pagamento por Pix e Cartao.
- Status antigo `Pagamento na entrega` deixou de ser usado e foi substituido por status publico amigavel.
- `storage.js` passou a normalizar status antigos de pagamento.
- Pagina de acompanhamento separa:
  - pagamento;
  - status do pagamento.
- Mensagem de WhatsApp para Start mantem `Forma de pagamento: Pix`, `Forma de pagamento: Cartao` ou `Forma de pagamento: Dinheiro`.

Arquivos alterados nesta etapa:

- `src/utils/plans.js`
- `src/utils/orderStatus.js`
- `src/pages/CheckoutPage.jsx`
- `src/pages/OrderTrackingPage.jsx`
- `src/services/storage.js`
- `src/data/mockOrders.js`
- `src/data/mockStores.js`
- `src/pages/AdminSettings.jsx`
- `src/pages/StorePage.jsx`
- `src/utils/whatsappMessage.js`
- `PROJECT_CONTEXT.md`
- `TODO_PEDICAMPOS.md`
- `CHANGELOG_PEDICAMPOS.md`
- `ARCHITECTURE_PEDICAMPOS.md`

Build:

- `npm run build` passou apos a correcao.

## v0.16 - Auditoria final antes da troca de chat

Auditoria realizada:

- Termos pesquisados no projeto inteiro:
  - `Pix na entrega`;
  - `Pagamento na entrega`;
  - `Pix online`;
  - `Cartao na entrega`;
  - `pixDelivery`;
  - `cardDelivery`;
  - `paymentOnDelivery`;
  - `pix_delivery`;
  - `pix_on_delivery`;
  - `card_delivery`;
  - `payment_on_delivery`.
- Resultado:
  - nao existem termos antigos visiveis ao cliente final nas telas publicas;
  - ocorrencias restantes em `src/services/storage.js` sao normalizacao/migracao de dados antigos;
  - ocorrencias restantes em `src/pages/CheckoutPage.jsx` sao fallback interno de compatibilidade para `paymentMethods` antigos e exibem labels publicos simples;
  - ocorrencias restantes em Markdown sao documentacao/memoria explicando a remocao;
  - nenhum BUG publico foi encontrado.

Estado real registrado:

- `formatCurrency` ja corrigido.
- `npm run build` passando.
- localStorage limpo ja testado.
- Rotas principais ja responderam 200.
- Precos oficiais mantidos com gatilho `,99`.
- Responsividade inicial revisada.
- Master testado manualmente e funcionando.
- Planos revisados:
  - Start = pedido via WhatsApp + pagamento manual;
  - Pro = pedido no painel + Pix/Cartao automatico simulado;
  - Premium = tudo do Pro + WhatsApp automatico/automacoes.
- Pagamento publico normalizado para `Pix`, `Cartao` e `Dinheiro`.
- Card "Formas ativas" removido do checkout publico.
- Adicionais configuraveis validados manualmente: grupo, opcao e vinculo com produto funcionando.
- Opcao gratis com preco 0 deve aparecer como `Gratis`.
- Opcao paga deve somar no total.

Proxima tarefa registrada:

- Testar fluxo completo de pedido de ponta a ponta: loja publica, produto, adicionais gratis/pagos, carrinho, checkout, pagamento conforme plano, pedido salvo ou WhatsApp conforme plano, acompanhamento, pedido no admin, alteracao de status e confirmacao de que nao ha termos internos visiveis ao cliente final.

Build:

- `npm run build` passou apos a auditoria.

## Builds e verificacoes

- Build anterior conhecido: `npm run build` passou durante o desenvolvimento.
- Build final desta rotina: `npm run build` passou em 2026-07-08.
- Build apos correcao do import de `formatCurrency` passou.
- Build apos ajustes responsivos em `src/styles/global.css` passou.
- Build apos ajuste de comunicacao publica de pagamento passou.
- Build apos ajuste da regra comercial de pagamentos por plano passou.
- Build apos auditoria final de termos antigos de pagamento passou.
- Observacao: a primeira tentativa no sandbox falhou por acesso negado ao resolver `vite.config.js`; a tentativa com permissao elevada passou.

## Pendencias conhecidas registradas

- Necessario teste visual em navegador real.
- Necessario teste completo de fluxo de pedido ponta a ponta.
- Precos comerciais finais confirmados: implantacao R$ 599,99; Start R$ 99,99/mes; Pro R$ 179,99/mes; Premium R$ 199,99/mes.
