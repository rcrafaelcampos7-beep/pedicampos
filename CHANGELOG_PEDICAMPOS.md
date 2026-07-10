# CHANGELOG - PediCampos

Atualizado em: 2026-07-10

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

## v0.17 - Auditoria e plano de migracao para Supabase

Implementado nesta rotina:

- Registrada a nova direcao do projeto: sair de `localStorage` como solucao final e preparar persistencia real online.
- Supabase definido como banco de dados alvo.
- `localStorage` definido como fallback temporario durante a migracao.
- `src/data/mockStores.js` e `src/data/mockOrders.js` mantidos temporariamente como seed/fallback.
- Criado `SUPABASE_MIGRATION_PLAN.md`.
- Auditados pontos de leitura e escrita:
  - `src/services/storage.js`;
  - `src/hooks/usePediData.js`;
  - `src/hooks/useCart.js`;
  - `src/App.jsx`;
  - telas master;
  - telas admin;
  - loja publica;
  - checkout;
  - acompanhamento de pedido.
- Proposto schema SQL inicial para Supabase com tabelas de plataforma, planos, lojas, usuarios de loja, categorias, produtos, adicionais, clientes, pedidos, itens e pagamentos.
- Registrada estrategia segura:
  - criar `src/services/database.js`;
  - manter implementacao local por baixo no inicio;
  - trocar para Supabase por variaveis de ambiente;
  - migrar tela por tela.
- Auditada linguagem publica/comercial que ainda cita termos de simulacao.

Arquivos alterados nesta etapa:

- `SUPABASE_MIGRATION_PLAN.md`
- `PROJECT_CONTEXT.md`
- `TODO_PEDICAMPOS.md`
- `CHANGELOG_PEDICAMPOS.md`
- `ARCHITECTURE_PEDICAMPOS.md`

Observacoes:

- Nenhum codigo funcional foi alterado.
- Nenhum mock foi removido.
- `localStorage` nao foi removido.
- Pix real, WhatsApp Cloud API e Supabase ainda nao estao integrados; estao planejados para proximas etapas.

Build:

- Primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`.
- Repeticao com permissao elevada passou com `npm run build`.

## v0.18 - Fachada inicial de dados

Implementado nesta rotina:

- Criado `src/services/database.js`.
- `database.js` atua como fachada/adapter temporario de dados.
- A fachada ainda usa `src/services/storage.js`, mocks e `localStorage` por baixo.
- Supabase real ainda nao foi conectado.
- Nenhuma tela foi migrada para usar `database.js` nesta etapa.
- `src/hooks/usePediData.js` permanece usando o fluxo atual e sera a proxima etapa correta.
- `node --check src/services/database.js` passou sem erro de sintaxe.

Funcoes expostas:

- `getDatabase`, `getStores`, `getStoreBySlug`, `getStoreById`;
- `createStore`, `updateStore`, `deactivateStore`, `deleteStore`;
- `getProductsByStore`, `createProduct`, `updateProduct`, `deleteProduct`;
- `getCategoriesByStore`, `createCategory`, `updateCategory`, `deleteCategory`;
- `getAdditionalGroupsByStore`, `createAdditionalGroup`, `updateAdditionalGroup`, `deleteAdditionalGroup`;
- `getOrdersByStore`, `getOrderById`, `createOrder`, `updateOrder`, `updateOrderStatus`;
- `getPlatformSettings`, `updatePlatformSettings`, `getPlans`, `updatePlan`.

Arquivos alterados nesta etapa:

- `src/services/database.js`
- `PROJECT_CONTEXT.md`
- `TODO_PEDICAMPOS.md`
- `CHANGELOG_PEDICAMPOS.md`
- `ARCHITECTURE_PEDICAMPOS.md`
- `SUPABASE_MIGRATION_PLAN.md`

Build:

- Primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`.
- Repeticao com permissao elevada passou com `npm run build`.

## v0.19 - usePediData consumindo a fachada de dados

Implementado nesta rotina:

- `src/hooks/usePediData.js` passou a importar `getDatabase` e `subscribeDatabase` de `src/services/database.js`.
- `src/services/database.js` passou a exportar `subscribeDatabase` como wrapper temporario sobre `src/services/storage.js`.
- O hook manteve o mesmo formato de retorno usado pelas telas:
  - `database`;
  - `stores`;
  - `orders`;
  - `platform`.
- Nenhuma tela foi migrada diretamente nesta etapa.
- Supabase real ainda nao foi conectado.
- `storage.js/localStorage` continuam sendo a persistencia real por baixo da fachada.

Chamadas migradas:

- `getDatabase`: de `storage.js` para `database.js` no hook.
- `subscribeDatabase`: de `storage.js` para `database.js` no hook.

Arquivos alterados nesta etapa:

- `src/hooks/usePediData.js`
- `src/services/database.js`
- `PROJECT_CONTEXT.md`
- `TODO_PEDICAMPOS.md`
- `CHANGELOG_PEDICAMPOS.md`
- `ARCHITECTURE_PEDICAMPOS.md`
- `SUPABASE_MIGRATION_PLAN.md`

Proxima etapa registrada:

- Testar rotas principais e fluxo completo novamente.

Build:

- Primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`.
- Repeticao com permissao elevada passou com `npm run build`.

## v0.20 - Teste pos-adaptacao de usePediData

Validado nesta rotina:

- Rotas principais responderam 200 no Vite local:
  - `/`;
  - `/neguinhodoacai`;
  - `/gordinhoburguer`;
  - `/admin`;
  - `/master`.
- Lojas demo carregaram corretamente via `database.js`.
- Carrinho validado por simulacao isolada:
  - adicionar item;
  - manter adicionais;
  - alterar quantidade;
  - recalcular total;
  - remover item.
- Adicionais validados:
  - grupo vinculado ao produto aparece nos dados;
  - adicional gratis tem preco 0;
  - adicional pago soma no total.
- Checkout e pedidos validados por modulo:
  - Pix, Cartao e Dinheiro continuam disponiveis nas lojas demo;
  - entrega e retirada seguem no modelo esperado;
  - Start continua sem checkout salvo e com fluxo WhatsApp/manual;
  - Pro continua com pedido salvo no painel;
  - Premium continua com pedido salvo e previa de WhatsApp automatico/automacoes.
- `database.subscribeDatabase` recebeu eventos de criacao/alteracao vindos de `storage.js`, preservando o comportamento do hook central.
- Pedido Pro apareceu em `getOrdersByStore`, e alteracao de status refletiu em `getOrderById`.
- Master continuou carregando lojas, planos e configuracoes.

Resultado:

- Nenhum bug causado pela troca de `usePediData.js` para `database.js` foi encontrado.
- Pendencia de copy publica, nao causada pela troca do hook:
  - `src/pages/CheckoutPage.jsx` ainda contem textos com `simulado`;
  - `src/pages/LandingPage.jsx` ainda contem `mock` e `localStorage`.
- O navegador interno do Codex nao estava disponivel nesta sessao; a validacao foi feita por HTTP local, Vite SSR com localStorage fake e inspecao de codigo.

Build:

- Primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`.
- Repeticao com permissao elevada passou com `npm run build`.

## v0.21 - Revisao de copy publica

Implementado nesta rotina:

- Removida linguagem publica que fazia o produto parecer teste, mock ou simulacao.
- Landing passou a usar "Loja exemplo" e texto de vitrine real da PediCampos.
- Checkout deixou de mostrar `simulado`, `ficticio` e `DEMO` no fluxo de Pix/Cartao.
- Defaults publicos da plataforma em `src/services/storage.js` foram revisados:
  - botao principal da landing;
  - FAQ;
  - descricao e features dos planos Pro/Premium.
- `storage.js` passou a normalizar copies legadas ja salvas no banco local, sem alterar regras comerciais.
- Rotulos internos muito visiveis no admin/master foram profissionalizados.

Arquivos alterados nesta etapa:

- `src/pages/LandingPage.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/services/storage.js`
- `src/pages/AdminDashboard.jsx`
- `src/pages/AdminLogin.jsx`
- `src/pages/MasterLogin.jsx`
- `src/pages/MasterDashboard.jsx`
- `src/components/admin/AdminLayout.jsx`
- `PROJECT_CONTEXT.md`
- `TODO_PEDICAMPOS.md`
- `CHANGELOG_PEDICAMPOS.md`
- `ARCHITECTURE_PEDICAMPOS.md`
- `SUPABASE_MIGRATION_PLAN.md`

Observacoes:

- Documentacao tecnica, codigo, comentarios e normalizacao de legado podem manter termos como `localStorage`, `mock` e `simulado` quando necessario.
- Supabase real ainda nao foi conectado.
- Precos, planos, regras comerciais e logica de pagamento nao foram alterados.

Build:

- Primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`.
- Repeticao com permissao elevada passou com `npm run build`.

## v0.22 - Preparacao para teste manual local

Realizado nesta rotina:

- Projeto preparado para teste visual/manual no navegador real.
- Comando solicitado: `npm run dev`.
- O servidor Vite ja estava ativo e respondeu 200.
- Endereco local confirmado: `http://127.0.0.1:5174`.
- Observacao: a porta correta do projeto e 5174 porque `package.json` define `vite --host 127.0.0.1 --port 5174 --strictPort`.
- Rotas verificadas por HTTP local:
  - `/`;
  - `/neguinhodoacai`;
  - `/gordinhoburguer`;
  - `/admin`;
  - `/master`.

Logins disponiveis para teste:

- Admin Neguinho do Acai: `admin@neguinho.com` / `123456`.
- Admin Gordinho Burguer: `admin@gordinho.com` / `123456`.
- Admin tambem aceita selecionar uma loja e usar senha `123456`.
- Master: `master@pedicampos.com.br` / `123456`.

Estado tecnico registrado:

- Copy publica ja foi revisada para linguagem de produto real.
- `src/services/database.js` existe como fachada temporaria.
- `src/hooks/usePediData.js` ja consome `database.js`.
- `storage.js/localStorage` continuam como fallback.
- Supabase real ainda nao foi conectado.
- Servidor local nao deve ser encerrado ate o teste manual terminar.

Proxima etapa:

- Corrigir as pendencias visuais/mobile encontradas no teste manual antes de iniciar a conexao Supabase.

## v0.23 - Registro de pendencias do teste visual/manual

Registrado antes da troca de chat:

- Teste visual/manual foi realizado no navegador local em `http://127.0.0.1:5174`.
- Nenhuma correcao foi implementada nesta etapa.
- Nenhum codigo funcional, visual, regra comercial, preco, plano ou integracao foi alterado.
- Supabase real continua pendente.
- A proxima conversa deve comecar por correcoes visuais/mobile antes de iniciar Supabase real.

Pendencias visuais registradas:

- Acompanhamento do pedido em desktop:
  - texto de adicionais aparece repetido/mal formatado;
  - exemplo: `Adicionais: Bacon extra + R$ 5,00, Adicionais: Cheddar + R$ 4,00`;
  - arquivo provavel: `src/pages/OrderTrackingPage.jsx`.
- Carrinho mobile:
  - controles de quantidade ficam muito largos e pouco centralizados;
  - arquivos provaveis: `src/components/store/CartDrawer.jsx` e `src/styles/global.css`.
- Menu superior do admin no mobile:
  - navegacao fica apertada e com itens cortados/espremidos;
  - arquivos provaveis: `src/components/admin/AdminLayout.jsx` e `src/styles/global.css`.
- Admin produtos mobile:
  - ao tocar em `Editar`, a tela nao rola automaticamente ate o formulario;
  - arquivo provavel: `src/pages/AdminProducts.jsx`.
- Admin adicionais mobile:
  - ao tocar em `Editar`, a tela nao rola automaticamente ate o formulario;
  - cards e chips/opcoes podem ficar carregados visualmente;
  - arquivos provaveis: `src/pages/AdminAdditionals.jsx` e `src/styles/global.css`.

Ordem sugerida para o proximo chat:

1. Corrigir texto repetido de adicionais no acompanhamento.
2. Melhorar carrinho mobile.
3. Melhorar menu mobile do admin.
4. Adicionar scroll automatico ao editar produtos.
5. Adicionar scroll automatico ao editar adicionais.
6. Revisar cards/chips de adicionais no mobile.
7. Rodar `npm run build`.
8. Testar novamente no navegador local.

## v0.24 - Correcao dos adicionais no acompanhamento

Implementado:

- Corrigida a renderizacao dos adicionais em `src/pages/OrderTrackingPage.jsx`.
- O acompanhamento do pedido deixou de repetir o prefixo `Adicionais:` para cada opcao.
- Os adicionais agora aparecem em linha limpa, por exemplo: `Adicionais: Bacon extra + R$ 5,00, Cheddar + R$ 4,00`.
- Nenhuma regra comercial, preco, plano, logica de pagamento, fluxo de Supabase ou visual geral foi alterado.

Build:

- `npm run build` passou apos a correcao.

Proxima pendencia visual/mobile:

- Melhorar os controles de quantidade do carrinho mobile.

## Builds e verificacoes

- Build anterior conhecido: `npm run build` passou durante o desenvolvimento.
- Build final desta rotina: `npm run build` passou em 2026-07-08.
- Build apos correcao do import de `formatCurrency` passou.
- Build apos ajustes responsivos em `src/styles/global.css` passou.
- Build apos ajuste de comunicacao publica de pagamento passou.
- Build apos ajuste da regra comercial de pagamentos por plano passou.
- Build apos auditoria final de termos antigos de pagamento passou.
- Build apos criacao do plano de migracao Supabase e atualizacao das memorias passou.
- Build apos criacao de `src/services/database.js` passou.
- Build apos adaptacao de `src/hooks/usePediData.js` para `database.js` passou.
- Build apos teste pos-adaptacao de `usePediData.js` passou.
- Build apos revisao de copy publica passou.
- Build apos finalizacao/revisao das memorias antes da troca de chat passou em 2026-07-10.
- Build apos correcao dos adicionais no acompanhamento passou.
- Observacao: a primeira tentativa no sandbox falhou por acesso negado ao resolver `vite.config.js`; a tentativa com permissao elevada passou.

## Pendencias conhecidas registradas

- Teste visual/manual em navegador real foi realizado em `http://127.0.0.1:5174`.
- Necessario corrigir as pendencias visuais/mobile restantes e testar novamente o fluxo completo.
- Precos comerciais finais confirmados: implantacao R$ 599,99; Start R$ 99,99/mes; Pro R$ 179,99/mes; Premium R$ 199,99/mes.
