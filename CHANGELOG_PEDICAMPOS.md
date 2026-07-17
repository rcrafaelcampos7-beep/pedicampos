# CHANGELOG - PediCampos

Atualizado em: 2026-07-11

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
- Supabase real continuava pendente naquele momento.
- Registro historico: naquela etapa, a prioridade seguinte eram as correcoes visuais/mobile antes da volta para Supabase.
- Estado atual posterior: essas pendencias visuais/mobile ja foram corrigidas no codigo; a prioridade voltou para Supabase.

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

## v0.25 - Ajuste do carrinho mobile

Implementado:

- Ajustado o layout mobile dos controles de quantidade do carrinho em `src/styles/global.css`.
- No mobile, os controles ficam mais compactos e alinhados em linha, no formato `[-] [quantidade] [+]`.
- O ajuste ficou restrito ao breakpoint mobile e preserva o desktop.
- Calculo do carrinho, checkout, planos, precos, pagamentos, componente inteiro e Supabase nao foram alterados.

Build:

- `npm run build` passou apos a correcao.

Proxima pendencia visual/mobile:

- Melhorar o menu superior do admin mobile.

## v0.26 - Ajuste do menu admin mobile

Implementado:

- Adicionada a classe `admin-shell` em `src/components/admin/AdminLayout.jsx` para escopar o ajuste ao admin.
- Melhorada a navegacao mobile do admin em `src/styles/global.css`.
- A barra horizontal rolavel foi preservada, agora com trilho visual, melhor espacamento e links em formato de pilula.
- Desktop, rotas, login, permissoes, carrinho, checkout, planos, precos, pagamentos e Supabase nao foram alterados.
- O master nao foi alterado.

Build:

- `npm run build` passou apos a correcao.

Proxima pendencia visual/mobile:

- Adicionar scroll automatico ao editar produtos no admin mobile.

## v0.27 - Scroll automatico ao editar produtos

Implementado:

- Adicionado `useRef` ao formulario de produtos em `src/pages/AdminProducts.jsx`.
- Ao tocar em `Editar`, `editProduct` preenche o formulario e chama `scrollIntoView({ behavior: "smooth", block: "start" })`.
- O comportamento de criacao e edicao de produtos foi preservado.
- Desktop, regras de produto, calculo, precos, planos, checkout, pedidos e Supabase nao foram alterados.

Build:

- `npm run build` passou apos a correcao.

Proxima pendencia visual/mobile:

- Adicionar scroll automatico ao editar adicionais no admin mobile.

## v0.28 - Scroll automatico ao editar adicionais

Implementado:

- Adicionado `useRef` ao formulario de adicionais em `src/pages/AdminAdditionals.jsx`.
- Ao tocar em `Editar`, `editGroup` preenche o formulario e chama `scrollIntoView({ behavior: "smooth", block: "start" })`.
- O comportamento de criacao e edicao de grupos/adicionais foi preservado.
- Vinculos com produtos e opcoes do grupo foram preservados.
- Desktop, regras de adicionais, calculo, precos, planos, checkout, pedidos e Supabase nao foram alterados.

Build:

- `npm run build` passou apos a correcao.

Proxima pendencia visual/mobile:

- Revisar cards/chips de adicionais no mobile.

## v0.29 - Revisao dos cards e chips de adicionais mobile

Implementado:

- Ajustado o visual mobile dos cards e chips de adicionais em `src/styles/global.css`.
- Cards de grupos ganharam melhor espacamento no mobile.
- Chips/opcoes passaram a usar grade responsiva, com quebra de linha mais confortavel e tamanho mais consistente.
- Comportamento de adicionais, criacao/edicao/exclusao, vinculos com produtos, calculo, precos, planos, checkout, pedidos e Supabase nao foram alterados.
- Desktop foi preservado porque o ajuste ficou restrito ao breakpoint mobile.
- O ciclo de pendencias visuais/mobile registrado no teste manual foi concluido no codigo.

Build:

- `npm run build` passou apos a correcao.

Proxima etapa:

- Subir localmente novamente e testar visualmente no navegador real.

## v0.30 - SQL inicial real do Supabase

Implementado:

- Criado `supabase/schema.sql` para ser executado no SQL Editor do projeto Supabase `pedicampos`.
- Criado `supabase/README.md` com instrucoes de execucao, conferencia das tabelas e variaveis futuras.
- O schema cria 15 tabelas: `platform_settings`, `plans`, `stores`, `store_users`, `store_settings`, `categories`, `products`, `additional_groups`, `additional_options`, `additional_group_products`, `customers`, `orders`, `order_items`, `order_item_additionals` e `payment_methods`.
- RLS e ativado em todas as 15 tabelas.
- Policies temporarias permitem leitura publica apenas de catalogo ativo e criacao publica de pedidos.
- Clientes e pedidos nao ficam publicamente legiveis por padrao.
- React ainda nao foi conectado ao Supabase.
- `localStorage`, mocks e `database.js` local continuam como estado real atual do app.

Proxima etapa:

- Conferir no Table Editor se as 15 tabelas foram criadas com RLS ativo.

## v0.31 - Schema executado no Supabase

Registrado:

- Projeto Supabase criado com nome `pedicampos`.
- Regiao escolhida: Oeste dos EUA (Oregon) / `us-west-2`.
- URL do projeto aparece no painel como `https://tkoo...supabase.co`.
- `supabase/schema.sql` foi executado no SQL Editor do Supabase.
- O retorno foi `Sucesso. Nenhuma linha retornada.`.
- Esse retorno e esperado porque o SQL cria tabelas, funcoes, triggers, RLS e policies, sem consultar dados.
- React ainda nao foi conectado ao Supabase.
- `src/services/database.js` continua usando `src/services/storage.js/localStorage` por baixo.
- Nenhuma loja foi migrada para o banco real ainda.
- `localStorage`, mocks e `storage.js` continuam preservados.

Tabelas esperadas no Table Editor:

- `platform_settings`
- `plans`
- `stores`
- `store_users`
- `store_settings`
- `categories`
- `products`
- `additional_groups`
- `additional_options`
- `additional_group_products`
- `customers`
- `orders`
- `order_items`
- `order_item_additionals`
- `payment_methods`

Seguranca registrada:

- Nao colocar senha do banco no codigo React.
- A `anon public key` pode ir no frontend.
- RLS deve proteger os dados.
- Policies reais de master/admin serao refinadas depois com autenticacao real.

Proxima etapa:

- Conferir tabelas, RLS, policies, indices e triggers de `updated_at` no painel do Supabase.
- Depois instalar `@supabase/supabase-js`, criar `.env.local`, criar `src/services/supabaseClient.js` e conectar sem migrar dados ainda.
- Primeiras funcoes a migrar depois da conexao: `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.

Build:

- `npm run build` passou apos atualizar as memorias com o estado real do Supabase.

## v0.32 - Client Supabase preparado no React

Implementado nesta rotina:

- Instalado `@supabase/supabase-js`.
- Criado `src/services/supabaseClient.js`.
- O client le `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Se as variaveis nao existirem, o client exporta `null` e nao quebra o app inteiro.
- Criado `.env.example` com as variaveis esperadas.
- `.env.local` foi adicionado explicitamente ao `.gitignore`.
- Nenhuma chave real foi colocada no codigo.
- Nenhuma senha do banco foi usada no React.
- Supabase ainda nao esta migrando dados.
- `src/services/database.js` continua usando `src/services/storage.js/localStorage` como fallback real.
- Nenhuma tela, regra, plano, preco ou visual foi alterado.
- Nenhum commit, add ou push foi feito nesta etapa.

Proxima etapa:

- Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` reais.
- Testar conexao basica Supabase sem migrar lojas ainda.

Build:

- `npm run build` passou apos preparar o client Supabase.

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
- Build apos ajuste mobile dos controles de quantidade do carrinho passou.
- Build apos ajuste do menu superior do admin mobile passou.
- Build apos scroll automatico ao editar produtos no admin passou.
- Build apos scroll automatico ao editar adicionais no admin passou.
- Build apos revisao dos cards/chips de adicionais no admin mobile passou.
- Build apos criacao do SQL inicial real do Supabase passou.
- Build apos atualizacao das memorias com o estado real do Supabase passou.
- Build apos preparacao do client Supabase passou.
- Observacao: a primeira tentativa no sandbox falhou por acesso negado ao resolver `vite.config.js`; a tentativa com permissao elevada passou.

## Pendencias conhecidas registradas

- Teste visual/manual em navegador real foi realizado em `http://127.0.0.1:5174`.
- Pendencias visuais/mobile registradas foram corrigidas no codigo; necessario testar novamente no navegador real.
- Precos comerciais finais confirmados: implantacao R$ 599,99; Start R$ 99,99/mes; Pro R$ 179,99/mes; Premium R$ 199,99/mes.
## 2026-07-12 - Adapter Supabase-first para lojas

- Adicionados conversores explicitos entre linhas de `stores` e o modelo atual do app.
- Migradas seis operacoes de lojas em `database.js`, com fallback para `storage.js` quando o client nao existe ou a operacao falha.
- Preservado o formato com `plan`, `primaryColor`, `banner` e arrays locais vazios para entidades ainda nao migradas.
- Resultado Supabase vazio passou a permanecer vazio, sem mistura automatica com mocks.
- Teste real confirmou leitura anonima e revelou bloqueio de escrita por RLS (`42501`). Nenhuma loja de teste foi criada.
- Telas, visual, produtos, categorias, adicionais, pedidos, `storage.js` e `localStorage` nao foram alterados.

## 2026-07-12 - Supabase Auth para master

- Adicionada camada `auth.js` usando `signInWithPassword` e verificacao da role master ativa em `store_users`.
- Login master passou a usar credenciais digitadas, erro amigavel e sem senha fixa no codigo.
- Rotas master e logout passaram a usar sessao real do Supabase.
- Adicionada migration idempotente `002_master_auth.sql`; writes em `stores` ficam exclusivos do master autenticado.
- Fallback fake opcional limitado ao modo DEV e configurado somente por variaveis explicitas.
- Admins das lojas e telas de dados continuam fora desta migracao.

## 2026-07-12 - Gerenciamento master de lojas assincrono

- `MasterCreateStore` deixou de gravar diretamente com `mutateDatabase` e passou a usar o adapter Supabase-first.
- `MasterStores` deixou de usar `storage.updateStore` e passou a carregar e alterar lojas por `database.js`.
- Adicionados estados de carregamento, erro, lista vazia e bloqueio durante operacoes.
- A lista remota e atualizada depois de edicao, ativacao ou desativacao.
- Nenhuma entidade alem de lojas foi migrada; fallback local foi mantido.

## 2026-07-12 - Migration inicial dos planos

- Adicionada `003_seed_plans.sql` para preencher a dependencia de `stores.plan_key`.
- Incluidos Start (99.99), Pro (179.99) e Premium (199.99), ativos e na ordem comercial atual.
- A migration usa conflito pela chave com `do nothing`, sem alterar precos previamente existentes.
- Nenhuma tela, regra comercial ou entidade de catalogo/pedidos foi alterada.

## 2026-07-12 - Loja publica por slug Supabase

- `StorePage` deixou de localizar a loja apenas no snapshot local e passou a consultar `getStoreBySlug`.
- Adicionados estados de carregamento e falha, validacao de slug e protecao contra resposta assincrona obsoleta.
- Loja Supabase sem produtos abre normalmente e informa que nenhum produto esta disponivel.
- Mantidos o fallback local, o formato atual da loja e as policies RLS existentes.

## 2026-07-12 - Adapter Supabase-first de categorias

- Migradas leitura, criacao, atualizacao e exclusao de categorias em `database.js`.
- Adicionados mapeamentos `store_id`/`storeId` e `sort_order`/`order`.
- Resposta remota vazia permanece vazia e sucesso remoto nao gera gravacao local paralela.
- Policies existentes foram preservadas; INSERT anonimo foi bloqueado com `42501`.
- Tela admin permaneceu local por ainda nao existir Auth real dos admins de loja.
- Produtos, adicionais e pedidos nao foram alterados.

## 2026-07-12 - Supabase Auth para usuarios das lojas

- Expandida a camada de auth com login e resolucao de vinculos de loja.
- AdminLogin passou a aceitar apenas credenciais Supabase autorizadas, sem senha fixa e sem seletor de lojas.
- Rotas admin deixaram de confiar nas chaves locais antigas e passaram a revalidar sessao + `store_users`.
- AdminLayout passou a usar logout real e deixou de permitir troca manual para lojas nao vinculadas.
- Nenhuma policy foi afrouxada e nenhuma migration adicional foi necessaria.
- AdminCategories e produtos nao foram integrados nesta etapa.

## 2026-07-12 - AdminCategories integrado ao Supabase

- A tela deixou de alterar categorias aninhadas via `storage.updateStore`.
- Listagem, criacao, edicao, exclusao e ordenacao agora aguardam o adapter Supabase-first.
- O unico identificador de loja usado vem da rota autenticada.
- Adicionados estados de carregamento, erro, vazio e operacao em andamento.
- Fallback local e RLS foram preservados; produtos nao foram migrados.

## 2026-07-12 - Produtos Supabase-first

- Migradas as quatro operacoes de produtos e adicionados conversores snake_case/camelCase.
- AdminProducts passou a usar produtos e categorias remotas da loja autorizada.
- Criacao, edicao, preco, categoria, status e exclusao agora sao assincronos com recarga da lista.
- Adicionada migration 004 com trigger de integridade entre produto, categoria e loja.
- Scroll de edicao, URL de imagem e fallback local foram preservados.
- Adicionais e pedidos nao foram migrados.

## 2026-07-12 - Adicionais Supabase-first

- Migradas leitura e manutencao de grupos, opcoes e links grupo-produto.
- AdminAdditionals passou a usar dados remotos da loja autenticada com estados assincronos.
- Adicionada migration 005 com dois triggers de integridade e RPC atomica protegida por RLS.
- Vinculos sao deduplicados e opcoes gratis/pagas preservam seus valores.
- Scroll automatico, layout e fallback local foram mantidos.
- Pedidos nao foram migrados.

## 2026-07-12 - Configuracoes e metodos de pagamento

- Adicionados adapters Supabase-first para `store_settings` e `payment_methods`.
- AdminSettings passou a salvar perfil publico, operacao, Pix e metodos remotos.
- StorePage e CheckoutPage passaram a hidratar configuracoes por `store_id`.
- Migration 006 adicionou RPC de perfil limitada, sem acesso a plano ou ativacao comercial.
- Checkout passou a respeitar entrega, retirada, taxa, minimo e metodos configurados.
- Nenhum gateway, pagamento real ou pedido remoto foi implementado.

## 2026-07-12 - Pedidos Supabase-first

- Adicionada migration 007 para criacao atomica e acompanhamento por token UUID.
- Adapter passou a converter pedidos, clientes, itens e adicionais relacionais.
- Checkout aguarda criacao remota, bloqueia envio duplicado e navega pelo token publico.
- OrderTracking passou a usar RPC segura sem leitura publica geral.
- AdminOrders passou a listar e atualizar pedidos remotos da loja autorizada.
- Totais enviados pelo navegador sao ignorados pela RPC; pagamentos/WhatsApp reais nao foram integrados.

## 2026-07-12 - Fix catalogo publico Supabase

- StorePage passou a carregar categorias, produtos e adicionais remotos junto das configuracoes.
- Aplicados filtros defensivos de status ativo e links para produtos ativos.
- Produto sem categoria continua suportado.
- Policies existentes foram suficientes; nenhuma migration ou permissao de escrita foi alterada.

## 2026-07-12 - Correcao de pedidos ausentes no admin

- Corrigido o fallback amplo que mascarava erros Supabase e fazia AdminOrders ler uma lista local vazia.
- `getOrdersByStore` agora carrega pedidos, clientes, itens e adicionais em etapas filtradas pela loja.
- Criacao, leitura e atualizacao de pedidos so usam fallback em indisponibilidade real de rede/client.
- AdminOrders passou a exibir falha de consulta sem confundi-la com ausencia de pedidos.
- Nenhuma policy ou migration foi alterada; escrita e leitura administrativa continuam sob RLS.

## 2026-07-12 - Permissao da RPC de criacao de pedidos

- Diagnosticado erro real `42501 permission denied for table customers` no primeiro `INSERT ... RETURNING` da RPC.
- Criada migration 008 para executar apenas `create_public_order` como definer, sem conceder leitura publica de customers/orders.
- Mantidos `search_path` fixo, EXECUTE somente para anon/authenticated e validacoes server-side existentes.
- Checkout e adapter agora registram code/message/details/hint somente em desenvolvimento.
- Nenhum fallback local foi adicionado para erros de RPC, RLS, schema, FK ou validacao.

## 2026-07-12 - Auditoria da RPC apos migration 008

- A chamada remota direta passou e criou o pedido temporario `80EE5827` com um item e duas opcoes.
- Tracking confirmou persistencia, loja correta, status recebido e total calculado no banco.
- Adicionado diagnostico read-only de pg_proc para identificar overloads, owner, `prosecdef`, config e definicao real.
- Logs de desenvolvimento passaram a incluir IDs/quantidades do payload sem dados pessoais.
- Nenhuma migration 009 foi criada porque a funcao alvo respondeu corretamente.

## 2026-07-12 - Correcao da origem da loja no checkout

- Impedido que uma loja antiga do fallback local forneca `p_store_id` para uma RPC remota.
- Checkout passou a resolver o slug estritamente no Supabase ao carregar e antes de criar o pedido.
- Carrinho passou a persistir seu `storeId`; divergencias limpam os itens com mensagem amigavel.
- Mantido diagnostico DEV seguro com slug, IDs resolvido/carrinho/enviado.
- Nenhuma migration, RPC, policy ou fallback de erro RPC foi alterado.

## 2026-07-12 - Carrinho novo vinculado a loja remota

- StorePage deixou de aceitar fallback local ao resolver a loja do carrinho.
- useCart passou a persistir `storeId` no envelope e nos itens novos.
- Corrigida a janela de inicializacao que poderia escrever estado vazio antes de ler a chave da loja.
- Adicionados logs DEV seguros para adicao, persistencia e leitura no checkout.

## 2026-07-12 - Autoridade unica do Supabase para lojas

- Removida a competicao entre snapshot local e lojas remotas nas areas migradas.
- usePediData passou a hidratar lojas assincronamente pelo facade remoto.
- Fallback de lojas foi limitado a client ausente ou falha real de rede; null remoto nao injeta mock.
- Admin Auth passou a resolver a loja vinculada sem fallback local.
- Adicionada migracao local versionada que remove apenas colisoes de slug e seus carrinhos legados.
- Nenhuma RPC, migration SQL, policy ou dado Supabase foi alterado.

## 2026-07-12 - ID raiz preservado ao hidratar settings

- `store_settings.id` passou a ser exposto como `settingsId`.
- Merges em StorePage, CheckoutPage e AdminSettings passaram a reafirmar o ID da loja.
- Auditados payment methods e outros merges; nenhum outro objeto filho era espalhado sobre store com `id` concorrente.
- Pedido remoto `BB6F8698` foi criado e acompanhado com o store ID correto.

## 2026-07-13 - Dashboard administrativo Supabase-first

- AdminDashboard passou a buscar pedidos e produtos remotos ao montar.
- Metricas e ultimos pedidos deixaram de usar o snapshot local de usePediData.
- Adicionados estados de carregamento, erro e vazio.
- Dashboard e AdminOrders receberam acao manual Atualizar, sem polling ou Realtime.

## 2026-07-13 - Timeline especifica por atendimento

- Adicionado status “Pronto para retirada”.
- Timeline e acoes administrativas agora variam entre delivery e pickup.
- Status legado de entrega em pedido pickup e normalizado apenas na apresentacao.
- Badges, filtros do admin e template WhatsApp seguem a mesma regra compartilhada.

## 2026-07-13 - Auditoria de producao Sprint 1

- Criado `AUDIT_PEDICAMPOS_SPRINT1.md` com achados criticos, altos, medios e baixos.
- CRUD Supabase-first deixou de converter erros RLS/FK/schema/validacao em gravacoes locais aparentes; fallback permanece apenas para conectividade/client ausente.
- MasterPlans deixou de gravar plano somente no localStorage e passou a usar `database.updateStore` assincrono.
- Documentado como bloqueador o INSERT anonimo direto nas tabelas de pedidos, alem de pendencias de validacao da RPC, entitlement, painel master, escala e testes.
- Nenhuma migration, layout, regra comercial, commit ou push foi realizado.
- Build, checks JS e diff check passaram; o alerta de chunk acima de 500 kB foi registrado como pendencia de performance.

## 2026-07-13 - Bloqueio de escrita anonima direta em pedidos

- Criada migration idempotente `009_lock_direct_order_writes.sql`.
- Removidas as quatro policies publicas de INSERT e revogados todos os privilegios diretos de tabela de `PUBLIC` e `anon`.
- Preservados CRUD de authenticated sob RLS e EXECUTE anon/authenticated nas RPCs publicas endurecidas.
- Criado diagnostico read-only para grants, policies, owner, SECURITY DEFINER, search_path e funcoes DML anonimas.
- Nenhuma alteracao de frontend, regra comercial ou layout foi feita; execucao remota permanece manual.
- Build, node check, diff check e assercoes estruturais SQL passaram; matriz remota A-I ficou documentada como pendente pos-aplicacao.

## 2026-07-13 - Validacao server-side de adicionais no pedido

- Criada migration `010_validate_order_additionals.sql` com a assinatura existente de `create_public_order`.
- A fase pre-write passou a validar required/min/max, selecao unica, duplicidade, correspondencia opcao/grupo, atividade e vinculo com produto/loja.
- Preservados calculo server-side, snapshots, atomicidade, owner postgres, SECURITY DEFINER, search_path e grants da RPC.
- Criado `010_validate_order_additionals_test.sql`, com fixtures isoladas, cenarios A-J e ROLLBACK final.
- Nenhuma tela ou payload do checkout foi alterado; execucao remota permanece pendente.
- Build, node check, diff check e cobertura estrutural A-J passaram localmente.

## 2026-07-13 - Idempotencia e limites da criacao publica

- Criada `011_order_idempotency_and_limits.sql` com chave UUID unica por loja e nova assinatura publica da RPC.
- Advisory lock serializa retries concorrentes; uma chave existente retorna ID, numero e public token originais sem novas linhas.
- Aplicados limites documentados de itens, quantidade, opcoes, notas, cliente, endereco e JSON total.
- A funcao validada v10 passou a ser privada; o overload publico antigo e removido para impedir bypass.
- Checkout/database enviam uma chave opaca reutilizada para o mesmo fingerprint de carrinho e removida no sucesso.
- Criados diagnostico e teste rollback-only A-K. Rate limit externo continua pendente; execucao remota permanece manual.

## 2026-07-14 - Dados globais remotos no painel Master

- `MasterDashboard` passou a carregar lojas, pedidos e planos do Supabase e a calcular metricas do dia com dados reais.
- `MasterOrders` passou a listar pedidos de todas as lojas com loading, erro, vazio, filtros e atualizacao manual.
- `MasterStores` passou a calcular quantidade de pedidos e faturamento por loja com pedidos remotos e a exibir planos remotos.
- Adicionadas consultas estritas `getAllStoresForMaster`, `getAllOrdersForMaster`, `getPlansForMaster` e `getMasterDashboardMetrics`.
- As consultas Master nao usam localStorage em client ausente, falha de rede, RLS ou schema; a tela apresenta erro controlado.
- Nenhuma migration, regra comercial, Realtime ou paginacao foi adicionada. Build, node check e diff check passaram.

## 2026-07-14 - Entitlements centralizados por plano

- Criada migration `012_plan_entitlements.sql` sem alterar precos, atividade dos planos ou lojas vinculadas.
- Populados somente `feature_flags` ainda vazios de Start, Pro e Premium; valores nao vazios nao sao sobrescritos.
- Adicionados `store_has_feature` e `get_store_entitlements`, ambos com owner/search_path/grants controlados.
- A RPC publica de pedidos exige `saved_orders`; tracking exige `order_tracking`; RLS dos snapshots e pagamento online aplicam os mesmos flags.
- App, checkout, loja publica, auth admin, settings, pedidos, relatorios e automacao de WhatsApp passaram a usar entitlements canonicos.
- Criados diagnostico read-only e teste rollback-only da migration 012. Build e checks locais passaram; execucao remota permanece manual.

## 2026-07-14 - Sprint 2.1 upload de imagens

- Criada migration `013_storage_images.sql` com buckets publicos de leitura e escrita tenant autenticada.
- Configurados limite de 5 MB e MIME `image/jpeg`, `image/png`, `image/webp`.
- Criado `storageImages.js` com validacao de arquivo/path/origem, nomes UUID, cache imutavel e exclusao limitada aos buckets PediCampos.
- AdminSettings ganhou upload e preview de logo/banner sem remover campos URL.
- AdminProducts ganhou upload e preview; produtos novos usam primeiro o UUID criado no banco.
- Substituicoes removem a imagem anterior somente depois de upload e persistencia; falhas tentam limpar apenas o arquivo novo.
- Criados audit/checklist SQL. Build, node check e diff check passaram; execucao remota permanece manual.

## 2026-07-14 - separação de logo, banner e iniciais

- StoreHeader deixou de imprimir a URL da logo e passou a renderizar imagem com fallback seguro para iniciais configuradas ou derivadas do nome.
- AdminSettings ganhou seções independentes para logo e banner, URLs opcionais, upload da galeria, nome do arquivo, preview e estado de envio.
- Iniciais de fallback passaram a usar `store_settings.extra.fallbackInitials`; nenhuma coluna ou migration foi adicionada.
- Compatibilidade com URLs externas antigas e URLs públicas do Supabase Storage foi preservada.

## 2026-07-14 - editor de recorte de imagens

- Adicionado `react-easy-crop` aos uploads administrativos de logo, banner e produto.
- Criado modal responsivo com arraste, suporte a toque/pinça, zoom, cancelar e confirmar recorte.
- Criado processamento canvas centralizado: 512x512 para logo, 1600x900 para banner e 800x800 para produto.
- JPEG e WEBP são recomprimidos em qualidade 0,88; PNG preserva transparência e o limite de 5 MB continua aplicado antes e depois do recorte.
- URLs manuais, imagens existentes, buckets e policies não foram alterados.

## 2026-07-14 - persistência confirmada de logo e banner

- Corrigido o fluxo para considerar identidade visual salva somente após confirmação dos valores retornados pelo Supabase.
- Adicionada verificação estrita entre `p_logo`/`p_banner_url` e `stores.logo`/`stores.banner_url`, com nova leitura em retorno inesperado.
- Logs completos de payload, resposta e erro foram limitados ao ambiente DEV.
- Compensação continua removendo uploads novos em falha; imagens antigas só são excluídas depois da confirmação.
- Confirmado que `stores.logo_url` não existe no schema remoto; nenhuma migration foi criada.
## 2026-07-15 - Sprint 2.2 paginação

- Adicionado `PaginationControls` reutilizável com Anterior, Próxima, página, total de páginas e total de registros.
- Adicionados helpers paginados para stores, orders, products, categories, additional_groups e plans.
- Todas as consultas principais usam `count: "exact"` e `.range()`; tamanho padrão centralizado em `DEFAULT_PAGE_SIZE = 20`.
- Filtros de pedidos Admin/Master passaram ao servidor e reiniciam somente a página do resultado filtrado.
- Filtros de retirada preservam compatibilidade com pedidos antigos salvos como `out_for_delivery`/“Saiu para entrega”.
- CRUD/status preserva a página atual; exclusão da última linha ajusta para a última página válida.
- MasterStores deixou de carregar todos os pedidos globais; métricas são obtidas apenas para as lojas visíveis.
- MasterPlans deixou de misturar dados do `usePediData` com Supabase.
- Nenhuma migration, regra comercial ou layout geral foi alterado.
- Smoke test remoto de leitura confirmou contagem e range nas cinco tabelas públicas testadas.

## 2026-07-15 - seed da loja-demo Brasa House Burger

- Adicionado `supabase/seeds/lojateste_demo_catalog.sql`, propositalmente fora das migrations obrigatórias.
- O seed resolve `lojateste` por slug e prepara perfil comercial, 6 categorias, 29 produtos, 5 grupos, 20 opções e 56 vínculos.
- Incluídos 22 pedidos-demo com clientes fictícios, snapshots consistentes, entrega/retirada, valores e status realistas.
- Reexecução usa UUIDs determinísticos, upserts limitados aos registros controlados e proteção contra colisões com nomes manuais.
- Adicionados audit somente leitura e cleanup seletivo. Nenhuma migration, policy, RLS, frontend ou dado remoto foi alterado/executado.

## 2026-07-15 - infraestrutura de imagens dos produtos-demo

- Removido do seed de catálogo o fallback que copiava banner/logo para `products.image_url`.
- Reexecuções agora preservam integralmente imagens existentes e deixam novos produtos sem imagem até existir uma URL específica.
- Adicionado `lojateste_demo_product_images.sql` com mapa explícito, validação do path `product-images/{storeId}/{productId}` e proteção contra sobrescrita manual.
- Adicionado audit por produto com categoria, URL, unicidade, compartilhamentos, pendências e validação do bucket/path.
- Nenhuma imagem foi gerada, pesquisada, enviada ou atualizada remotamente.

## 2026-07-15 - Sprint 2.3 performance e code splitting

- Todas as páginas passaram a chunks por rota; Admin e Master possuem routers lazy independentes e mantêm os guards existentes.
- Adicionado fallback de carregamento acessível para imports e verificação de sessão.
- Chunk inicial reduzido de 595,15 kB para 198,01 kB; nenhum chunk final ultrapassa 500 kB.
- `react-easy-crop` foi isolado em chunk de 29,69 kB, solicitado apenas por AdminProducts/AdminSettings.
- Hero e dois banners mock foram convertidos de PNG para WebP, reduzindo 5.963,75 kB para 256,98 kB.
- Adicionados `loading="lazy"` e `decoding="async"` em imagens não críticas; imagens principais preservam carregamento prioritário.
- `usePediData` deixou de importar o adapter Supabase de forma eager, mantendo a atualização remota assíncrona.
- Nenhuma dependência foi removida, pois todas as dependências declaradas possuem uso comprovado.

## 15/07/2026 - Consolidação das lojas-demo

- Criada migration 014 com metadados de demo independentes do status ativo, constraints, índice de Landing e escrita master-only.
- Criados seeds idempotentes para Neguinho do Açaí e Gordinho Burguer, sem Auth, senhas, uploads ou alteração da Brasa House.
- MasterStores passou a editar e exibir demo, destaque, ordem e rótulo.
- Landing passou a carregar demos remotas ordenadas, sem fallback para mocks em resposta vazia.
- Adicionado adaptador para banners locais legados e inventário que registra a ausência de imagens específicas de produtos.
- Adicionados diagnósticos, cleanups conservadores, template Admin e checklist de remoção futura dos mocks.

## 15/07/2026 - Sprint 2.4: testes automatizados e CI

- Adicionados Vitest, jsdom, React Testing Library, jest-dom, user-event e cobertura V8.
- Criados 11 arquivos com 71 casos para utils, carrinho, componentes, AdminOrders, CheckoutPage, StorePage, MasterStores e facade Supabase.
- Configurados scripts `test`, `test:run`, `test:coverage` e `validate`; lint não foi simulado sem ESLint real.
- Criado workflow GitHub Actions para PRs e pushes em `main`, com Node 22, cache npm, testes e build.
- Cobertura inicial: 35,11% statements, 26,57% branches, 34,54% functions e 38,34% lines; sem threshold arbitrário no primeiro ciclo.
- Adicionado `TESTING.md` com isolamento, comandos e estratégia futura de integração Supabase.

## 15/07/2026 - Sprint 2.5: rate limit e observabilidade

- Criada migration 015 com tabela privada efêmera, funções service-role-only, índices, expiração e revogação do EXECUTE público direto da RPC.
- Criada Edge Function `create-order` com CORS restrito, POST/OPTIONS, body de 256 KiB, validação estrutural, requestId e 429 com Retry-After.
- `database.createOrder` passou a usar `supabase.functions.invoke`, preservando chave idempotente e sem fallback em erro Edge/RLS.
- Checkout ganhou mensagem específica e amigável para rate limit.
- Criado logger central sanitizado; logs diretos do frontend foram substituídos e URLs/payloads deixaram de ser registrados.
- Adicionados 15 testes de Edge, logger, 429 e facade, totalizando 86 casos.
- Cobertura global passou para 38,08% statements e 41,52% lines; core Edge ficou em 90% de statements.

## 16/07/2026 - Correções do teste local da Sprint 2.5

- Impedido `src` vazio no `CartDrawer`, `ProductCard` e `ProductModal`; produtos sem imagem usam ausência controlada ou placeholder neutro.
- `logInfo` deixou de passar por `sanitizeError`, eliminando `UNKNOWN_ERROR` e mensagens vazias de eventos rotineiros.
- Mantidos logs informativos seguros somente em desenvolvimento e warnings/erros sanitizados em produção.

## 17/07/2026 - Auditoria técnica pré-UX

- Auditados arquitetura, autenticação, RLS/grants locais, checkout, pedidos, dashboards, legado, bundle e UX técnica, sem alterar banco ou ambiente remoto.
- Reforçada a validação pura da Edge para carrinho e IDs, a normalização de IP e a cobertura de CORS/idempotência.
- Corrigidos slug automático da criação de loja, imagens vazias/herdadas, conflito visual de logo no checkout e filtro de catálogo por categoria ativa.
- Adicionados testes de Auth, Storage, dashboards, checkout, acompanhamento, produtos, criação Master e segurança dos mocks.
- Validação final: 120 testes em 20 arquivos, build aprovado, `node --check` aprovado e `git diff --check` aprovado; lint segue pendente por ausência do script.

## 17/07/2026 - Gates técnicos pré-UX

- Configurado ESLint flat para React/Vite, React Hooks, React Refresh, Vitest e arquivos Node, ignorando TypeScript/Deno e artefatos gerados.
- Adicionados scripts `lint` e `lint:fix`; `validate` agora inclui lint antes de testes e build.
- Criado diagnóstico Supabase somente leitura para migrations 009–015, tabelas, funções, grants, RLS, Storage, triggers e índices.
- Criado checklist de validação manual do ambiente remoto, sem executar migration ou deploy.
- Lint passou com zero erros e 12 warnings documentados; os 120 testes e o build permaneceram aprovados.

## 17/07/2026 - Gate remoto pré-UX aprovado

- O resumo consolidado retornou `PRE_UX_REMOTE_GATE = PASS` no Supabase.
- O inventário confirmou as assinaturas críticas e eliminou falsos negativos ao trocar comparação textual por resolução com `to_regprocedure` e OID.
- Os diagnósticos permaneceram somente leitura; nenhuma função, migration, policy, Edge Function ou dado foi alterado.
