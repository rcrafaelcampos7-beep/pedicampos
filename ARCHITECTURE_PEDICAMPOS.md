# ARCHITECTURE - PediCampos

Atualizado em: 2026-07-11

## Visao geral

A PediCampos e uma SPA feita com React, Vite e JavaScript.

Estado tecnico atual:

- Frontend em React.
- Build com Vite.
- CSS global em arquivos proprios.
- Sem backend real ainda.
- Dados mockados inicializados a partir de arquivos JS.
- Persistencia local via localStorage.
- `src/services/database.js` criado como fachada/adapter temporario sobre `storage.js`.
- `src/hooks/usePediData.js` ja consome `database.js` para leitura e assinatura de atualizacoes.
- Preparada conceitualmente para migrar para Supabase/backend real.
- Nova direcao registrada em 2026-07-09: Supabase sera o banco alvo e localStorage sera mantido temporariamente como fallback.
- Projeto Supabase `pedicampos` ja foi criado pelo usuario.
- Regiao do projeto Supabase: Oeste dos EUA (Oregon) / `us-west-2`.
- URL visivel no painel: `https://tkoo...supabase.co`.
- SQL inicial real criado em `supabase/schema.sql`.
- `supabase/schema.sql` ja foi executado no SQL Editor do Supabase.
- Retorno recebido: `Sucesso. Nenhuma linha retornada.`, considerado correto para criacao de schema.
- Tabelas ja foram conferidas no Table Editor.
- `@supabase/supabase-js` foi instalado.
- `src/services/supabaseClient.js` foi criado.
- `.env.example` foi criado.
- `.env.local` esta protegido no `.gitignore` e deve guardar as chaves reais.
- O client Supabase ja existe no React, mas ainda nao migra dados.
- `database.js` continua usando `storage.js/localStorage` como persistencia real.
- Rewrites SPA configurados em `vercel.json`.

Principais tecnologias:

- React 19.
- React DOM 19.
- Vite 7.
- JavaScript modules.
- CSS puro.
- Supabase JS SDK instalado, ainda sem migracao de dados.
- localStorage.

## Nova arquitetura alvo - Supabase

O projeto deve evoluir de uma SPA com persistencia local para uma SPA conectada a um banco real online no Supabase.

Principios:

- As telas nao devem acessar Supabase diretamente.
- Uma camada de dados deve ficar entre UI e persistencia.
- O primeiro arquivo novo foi criado em `src/services/database.js`.
- A implementacao atual de `database.js` usa `src/services/storage.js` por baixo para preservar o comportamento atual.
- Depois, `database.js` deve trocar a origem para Supabase com `VITE_DATA_SOURCE=supabase`.
- `localStorage` e mocks continuam como fallback temporario, nao como arquitetura final.
- O client Supabase existe em `src/services/supabaseClient.js`, mas `database.js` ainda nao usa Supabase.
- Nenhuma tela foi migrada diretamente para `database.js` ainda.
- O hook central `usePediData.js` ja foi migrado para a fachada.
- O schema SQL inicial, riscos e checklist estao em `SUPABASE_MIGRATION_PLAN.md`.
- O arquivo executado no SQL Editor e `supabase/schema.sql`.
- As instrucoes operacionais estao em `supabase/README.md`.
- A senha do banco nunca deve ser usada no React.
- A `anon public key` pode ser usada no frontend junto com RLS.
- `.env.example` documenta `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `.env.local` deve ficar fora do Git e guardar as chaves reais.
- As policies reais de master/admin serao refinadas depois, quando houver autenticacao real.

API inicial criada:

```js
getDatabase()
subscribeDatabase(callback)
getStores()
getStoreBySlug(slug)
getStoreById(id)
createStore(data)
updateStore(id, data)
deactivateStore(id)
deleteStore(id)
getProductsByStore(storeId)
createProduct(storeId, data)
updateProduct(productId, data)
deleteProduct(productId)
getCategoriesByStore(storeId)
createCategory(storeId, data)
updateCategory(categoryId, data)
deleteCategory(categoryId)
getAdditionalGroupsByStore(storeId)
createAdditionalGroup(storeId, data)
updateAdditionalGroup(groupId, data)
deleteAdditionalGroup(groupId)
getOrdersByStore(storeId)
getOrderById(orderId)
createOrder(storeId, data)
updateOrder(orderId, data)
updateOrderStatus(orderId, status)
getPlatformSettings()
updatePlatformSettings(data)
getPlans()
updatePlan(planId, data)
```

Variaveis de ambiente previstas:

```txt
VITE_DATA_SOURCE=local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Observacao: `.env.example` registra apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nesta etapa. `VITE_DATA_SOURCE` continua previsto para ativar a troca de origem de dados em etapa posterior.

Quando `VITE_DATA_SOURCE=local`, o app continua usando fallback local.
Quando `VITE_DATA_SOURCE=supabase`, as funcoes da camada de dados devem buscar e salvar no Supabase.

## Separacao de areas

### Landing publica da PediCampos

- Rota: `/`.
- Arquivo: `src/pages/LandingPage.jsx`.
- Objetivo: vender a plataforma PediCampos.
- Dados: `platform` dentro de `pedicampos.database.v1`.
- Editavel pelo master em `/master/configuracoes`.

### Loja publica por slug

- Rota: `/:slug`.
- Arquivo: `src/pages/StorePage.jsx`.
- Objetivo: vitrine da loja do lojista.
- Dados: loja encontrada por `store.slug`.
- Usa:
  - `StoreHeader`;
  - `CategoryTabs`;
  - `ProductCard`;
  - `ProductModal`;
  - `CartDrawer`.

### Admin da loja

- Rotas: `/admin/*`.
- Arquivos em `src/pages/Admin*.jsx`.
- Layout: `src/components/admin/AdminLayout.jsx`.
- Objetivo: lojista gerenciar a propria loja.
- Loja selecionada: `pedicampos.admin.storeId`.
- Login fake: `pedicampos.admin.auth`.

### Master da plataforma

- Rotas: `/master/*`.
- Arquivos em `src/pages/Master*.jsx`.
- Layout: `src/components/master/MasterLayout.jsx`.
- Objetivo: dono da PediCampos controlar lojas, pedidos, planos e landing.
- Login fake: `pedicampos.master.auth`.

## Estrutura de pastas

```txt
src/
  assets/
    gordinho-banner.png
    neguinho-banner.png
    pedicampos-hero.png
  components/
    admin/
    layout/
    master/
    store/
    ui/
  data/
    mockOrders.js
    mockStores.js
  hooks/
    useCart.js
    usePediData.js
  pages/
    Admin*.jsx
    CheckoutPage.jsx
    LandingPage.jsx
    Master*.jsx
    OrderTrackingPage.jsx
    StorePage.jsx
  routes/
    router.jsx
  services/
    database.js
    storage.js
  styles/
    global.css
    variables.css
  utils/
    formatCurrency.js
    orderStatus.js
    plans.js
    slug.js
    whatsappMessage.js
```

## Roteamento

Arquivo: `src/App.jsx`.

O roteamento e manual, baseado no path atual:

- `/` renderiza `LandingPage`.
- Paths que comecam com `admin` entram em `AdminRouter`.
- Paths que comecam com `master` entram em `MasterRouter`.
- Um segmento unico e tratado como `/:slug`.
- Dois segmentos com `checkout` viram `/:slug/checkout`.
- Tres segmentos com `pedido` viram `/:slug/pedido/:orderId`.
- Demais paths renderizam `NotFound`.

Arquivo auxiliar: `src/routes/router.jsx`.

- `normalizePath` remove barra final.
- `navigate` usa `window.history.pushState`.
- `usePath` escuta `popstate`.
- `Link` intercepta clique e navega sem reload.

## Multi-loja / multi-tenant

O projeto e multi-loja no nivel de dados.

Cada loja tem:

- `id`;
- `slug`;
- `name`;
- `segment`;
- `plan`;
- `active`;
- `open`;
- `primaryColor`;
- `whatsapp`;
- `address`;
- `categories`;
- `products`;
- `additionalGroups`;
- `paymentMethods`.

Separacao por loja:

- Produtos ficam dentro da propria loja em `store.products`.
- Categorias ficam dentro da propria loja em `store.categories`.
- Adicionais ficam dentro da propria loja em `store.additionalGroups`.
- Pedidos tem `storeId`, `storeSlug` e `storeName`.
- Carrinho e separado por `storeId` na chave `pedicampos.cart.${storeId}`.
- O admin seleciona uma loja por `pedicampos.admin.storeId`.

Regra importante:

- Dados de lojas nao devem se misturar.
- Qualquer futura migracao para backend deve preservar `storeId` como chave de tenant.

## Fluxo de dados

1. `src/data/mockStores.js` define as lojas iniciais.
2. `src/data/mockOrders.js` define pedidos iniciais.
3. `src/services/storage.js` cria o banco inicial com `createInitialDatabase()`.
4. Na primeira carga, `getDatabase()` salva tudo em `localStorage` na chave `pedicampos.database.v1`.
5. Depois disso, a aplicacao passa a ler do localStorage.
6. `usePediData()` le e assina as mudancas por `src/services/database.js`.
7. Telas de admin/master usam `updateStore`, `updateOrder`, `updatePlatform` ou `mutateDatabase`.
8. `saveDatabase()` grava o novo estado e dispara `pedicampos:data-updated`.
9. Componentes inscritos atualizam a interface automaticamente.

Este e o fluxo real atual. Ele sera preservado temporariamente enquanto cada tela e migrada com seguranca para `src/services/database.js`.

Fluxo simplificado:

```txt
mockStores.js / mockOrders.js
        ↓
createInitialDatabase()
        ↓
localStorage: pedicampos.database.v1
        ↓
usePediData()
        ↓
loja publica / admin / master
        ↓
updateStore / updateOrder / updatePlatform
        ↓
localStorage atualizado
        ↓
interface reflete mudanca
```

Observacao: no codigo atual, `usePediData()` importa `getDatabase` e `subscribeDatabase` de `src/services/database.js`; a fachada ainda encaminha para `storage.js/localStorage`.

## Modelo de dados principal

Banco mock:

```js
{
  stores: Store[],
  orders: Order[],
  platform: PlatformSettings,
  platformSettings: PlatformSettings
}
```

Store:

```js
{
  id,
  name,
  slug,
  segment,
  plan,
  active,
  open,
  primaryColor,
  whatsapp,
  email,
  password,
  address,
  openingHours,
  deliveryTime,
  deliveryFee,
  logo,
  banner,
  paymentMethods,
  categories,
  products,
  additionalGroups
}
```

Product:

```js
{
  id,
  name,
  description,
  price,
  categoryId,
  image,
  active
}
```

Category:

```js
{
  id,
  name,
  order,
  active
}
```

AdditionalGroup:

```js
{
  id,
  storeId,
  name,
  description,
  required,
  min,
  max,
  selectionType,
  productIds,
  active,
  options
}
```

Order:

```js
{
  id,
  number,
  storeId,
  storeSlug,
  storeName,
  createdAt,
  updatedAt,
  customer,
  fulfillment,
  address,
  notes,
  paymentMethod,
  paymentStatus,
  orderStatus,
  subtotal,
  deliveryFee,
  total,
  pixCode,
  items
}
```

## Fluxo de pedido

1. Cliente acessa `/:slug`.
2. `StorePage` encontra a loja por `store.slug`.
3. Se a loja nao existe, mostra "Loja nao encontrada".
4. Se a loja esta inativa, mostra "Esta loja esta temporariamente indisponivel.".
5. Cliente escolhe categoria/produto.
6. `ProductModal` abre o produto.
7. Se o plano permite adicionais, o modal carrega grupos ativos vinculados ao produto.
8. Cliente escolhe adicionais, quantidade e observacao.
9. Item e adicionado ao carrinho via `useCart`.
10. Carrinho fica salvo em `pedicampos.cart.${storeId}`.
11. Cliente vai para `/:slug/checkout`.
12. Checkout valida dados do cliente e endereco.
13. Checkout calcula subtotal, entrega e total.
14. Se a loja esta fechada, bloqueia finalizacao.
15. Se o plano e Start, monta mensagem e abre WhatsApp manualmente.
16. Se o plano e Pro ou Premium, cria pedido em `orders`.
17. Se o pagamento e Pix ou Cartao com pagamento automatico habilitado a partir do Pro, usa pagamento simulado.
18. Pedido e salvo com status adequado.
19. Cliente vai para `/:slug/pedido/:orderId`.
20. Pedido aparece no admin da loja em `/admin/pedidos` se o plano permite.
21. Lojista pode confirmar pagamento e alterar status.
22. Painel exibe previa da mensagem WhatsApp simulada.

## Fluxo de planos

Arquivo: `src/utils/plans.js`.

Conceitos:

- `PLAN_KEYS`: `["start", "pro", "premium"]`.
- `DEFAULT_FEATURES_BY_PLAN`: recursos padrao por plano.
- `FEATURE_MIN_PLAN`: plano minimo de cada recurso bloqueavel.
- `normalizePlan`: padroniza nomes de plano.
- `planHasFeature`: verifica se plano tem recurso.
- `getPlanName`: pega nome exibivel do plano.
- `getPlanPriceLabel`: pega preco formatado.
- `getActivePlans`: retorna planos ativos para landing/master.

Valores comerciais padrao:

- Implantacao: R$ 599,99.
- Start: R$ 99,99/mes.
- Pro: R$ 179,99/mes.
- Premium: R$ 199,99/mes.

Features atuais:

- Start:
  - `publicStore`
  - `whatsappOrder`
  - `products`
  - `categories`
  - `basicAdmin`
  - `simpleCart`
  - `paymentsManual`
  - `pixManual`
  - `cardManual`
- Pro:
  - tudo do Start;
  - `siteCheckout`;
  - `ordersPanel`;
  - `orderStatus`;
  - `additionals`;
  - `reportsBasic`;
  - `orderTracking`;
  - `pixAutomatic`;
  - `cardAutomatic`;
  - `onlinePayments`;
  - `automaticPaymentConfirmation`.
- Premium:
  - tudo do Pro;
  - `whatsappAutomation`;
  - `coupons`;
  - `reportsAdvanced`;
  - `automations`.

Uso atual:

- `PlanGuard` protege rotas admin.
- `CheckoutPage` decide Start vs Pro/Premium.
- `CheckoutPage` exibe `Pix`, `Cartao` e `Dinheiro` como labels publicos.
- `CheckoutPage` usa `onlinePayments`, `pixAutomatic` e `cardAutomatic` para liberar pagamento automatico simulado.
- `ProductModal` so mostra adicionais se o plano tiver `additionals`.
- Landing e master usam configuracoes comerciais de planos.

## Fluxo de adicionais

Arquitetura:

- Adicionais pertencem a loja, nao ao codigo fixo.
- Cada loja tem `additionalGroups`.
- Cada grupo tem `productIds` para vincular a produtos.
- Cada grupo tem `options`.
- Cada option tem preco e status.
- O modal de produto filtra:
  - grupos ativos;
  - grupos cujo `productIds` contem o produto;
  - opcoes ativas;
  - plano com feature `additionals`.

Calculo:

1. Usuario seleciona opcoes.
2. `ProductModal` monta `selectedAdditionals`.
3. Soma `price` de cada adicional.
4. Total do item = `(product.price + addonTotal) * quantity`.
5. Item salvo no carrinho.
6. Carrinho recalcula quantidade usando `unitPrice + adicionais`.
7. Checkout soma `item.total`.
8. Pedido salva os itens com `selectedAdditionals`.

Validacao:

- Grupo obrigatorio exige pelo menos 1.
- `min` exige minimo quando maior que 0.
- `max` limita selecoes quando maior que 0.
- `selectionType = single` usa radio e permite uma opcao.
- `selectionType = multiple` usa checkbox.

Compatibilidade:

- Dados antigos com `addons` sao convertidos por `normalizeOrderItem`.
- UI ainda usa fallback para `addons`.

## Fluxo de master criando loja

1. Usuario acessa `/master/criar-loja`.
2. Preenche nome, slug, segmento, WhatsApp, endereco, cor, logo, banner, plano e status.
3. `slugify` e `uniqueSlug` garantem slug valido/unico.
4. `createEmptyStore` cria a loja base.
5. `mutateDatabase` adiciona a loja no inicio de `database.stores`.
6. Navega para `/master/lojas`.
7. Loja aparece automaticamente na lista.
8. Loja ja pode ser acessada por `/:slug`.
9. Se ativa, abre layout padrao mesmo sem produtos.
10. Se inativa, mostra aviso publico.

## Fluxo de edicao da loja

Pelo master:

- `MasterStores` usa `updateStore`.
- Pode editar dados principais e plano.
- Pode ativar/desativar.
- Pode alterar slug.
- Mudancas refletem em loja publica porque todas as areas leem o mesmo localStorage.

Pelo admin:

- `AdminSettings` usa `updateStore`.
- Pode editar dados da loja selecionada.
- Pode alterar formas de pagamento.
- Pode abrir/fechar.
- Pode ativar/desativar.

## Fluxo de pagamento automatico simulado

1. Loja deve ter `paymentMethods.pix` ou `paymentMethods.card` ativo.
2. Plano deve ter `onlinePayments`.
3. Para Pix automatico, o plano deve ter `pixAutomatic`.
4. Para Cartao automatico, o plano deve ter `cardAutomatic`.
5. Checkout publico exibe as opcoes como `Pix` e `Cartao`, sem nomes tecnicos.
6. Ao escolher Pix com recurso automatico, exibe QR fake e copia e cola ficticio.
7. Ao escolher Cartao com recurso automatico, exibe confirmacao de pagamento simulada.
8. Usuario pode clicar em "Simular pagamento aprovado".
9. Pedido e salvo como:
   - aprovado/confirmado se simulado antes de finalizar;
   - aguardando pagamento se nao simulado.

Ponto futuro:

- Criacao da cobranca real deve entrar no backend no lugar dos comentarios em `CheckoutPage`.
- Webhook futuro deve atualizar `paymentStatus` e `orderStatus`.

## Fluxo de WhatsApp simulado

Start:

- Checkout monta mensagem manual com itens, endereco, subtotal, entrega e total.
- Quando Pix e escolhido, a mensagem informa `Forma de pagamento: Pix`.
- Se a loja tiver chave Pix configurada, a mensagem pode incluir `Chave Pix`.
- Abre `https://wa.me/{store.whatsapp}?text=...`.
- Nao salva pedido no painel.

Pro/Premium:

- Pedido salvo no painel.
- Admin muda status.
- `generateWhatsAppMessage(order, status)` gera previa da mensagem.
- Ainda nao envia de verdade.

Futuro:

- Chamar WhatsApp Cloud API ao mudar status.
- Usar templates aprovados.
- Registrar envio.

## LocalStorage

Chaves:

- `pedicampos.database.v1`: banco mock principal.
- `pedicampos.cart.${storeId}`: carrinho da loja.
- `pedicampos.admin.auth`: login fake admin.
- `pedicampos.admin.storeId`: loja selecionada no admin.
- `pedicampos.master.auth`: login fake master.

Eventos:

- `pedicampos:data-updated`: disparado ao salvar banco.
- `pedicampos:session-updated`: ouvido em `App.jsx`, mas o codigo atual nao mostrou emissores principais alem de navegacao/sessao.

## Arquitetura de persistencia

Funcoes principais em `src/services/storage.js`:

- `createInitialDatabase()`: cria banco inicial normalizado.
- `getDatabase()`: le banco do localStorage ou inicializa.
- `saveDatabase(nextDatabase)`: salva e dispara evento.
- `mutateDatabase(mutator)`: clona banco, aplica mutacao e salva.
- `subscribeDatabase(callback)`: assina mudancas.
- `resetDatabase()`: recria banco inicial.
- `updateStore(storeId, updater)`: altera loja.
- `createOrder(order)`: adiciona pedido.
- `updateOrder(orderId, updater)`: altera pedido.
- `updatePlatform(updater)`: altera configuracoes da plataforma.

Observacao de migracao:

- `src/services/storage.js` continua critico e nao deve ser apagado agora.
- `src/services/database.js` ja envolve essas funcoes com nomes preparados para banco real.
- `src/services/database.js` ainda usa `storage.js/localStorage` como adapter temporario.
- `src/services/supabaseClient.js` ja existe, mas ainda nao foi ligado ao `database.js`.
- Supabase ainda nao esta migrando dados.
- `src/hooks/usePediData.js` foi migrado para `database.js` nesta etapa.
- Nenhuma tela foi migrada diretamente para `database.js` nesta etapa.
- O objetivo e reduzir chamadas diretas a `storage.js` nas telas antes de conectar Supabase.
- Depois da migracao, `storage.js` pode virar fallback/dev seed ou ser removido em uma etapa futura.

Funcoes exportadas por `src/services/database.js`:

- `getDatabase()`
- `subscribeDatabase(callback)`
- `getStores()`
- `getStoreBySlug(slug)`
- `getStoreById(id)`
- `createStore(data)`
- `updateStore(id, data)`
- `deactivateStore(id)`
- `deleteStore(id)`
- `getProductsByStore(storeId)`
- `createProduct(storeId, data)`
- `updateProduct(productId, data)`
- `deleteProduct(productId)`
- `getCategoriesByStore(storeId)`
- `createCategory(storeId, data)`
- `updateCategory(categoryId, data)`
- `deleteCategory(categoryId)`
- `getAdditionalGroupsByStore(storeId)`
- `createAdditionalGroup(storeId, data)`
- `updateAdditionalGroup(groupId, data)`
- `deleteAdditionalGroup(groupId)`
- `getOrdersByStore(storeId)`
- `getOrderById(orderId)`
- `createOrder(storeId, data)`
- `updateOrder(orderId, data)`
- `updateOrderStatus(orderId, status)`
- `getPlatformSettings()`
- `updatePlatformSettings(data)`
- `getPlans()`
- `updatePlan(planId, data)`

Normalizacoes importantes:

- Planos antigos sao normalizados para `start`, `pro`, `premium`.
- Features antigas de planos sao complementadas com a regra comercial atual, incluindo pagamento automatico no Pro/Premium.
- Precos antigos de planos sao migrados para defaults atuais quando detectados.
- Valores antigos `179`/`199` nos planos Pro/Premium sao corrigidos para `179.99`/`199.99`.
- Metodos antigos de pagamento (`pixDelivery`, `pix_delivery`, `pix_on_delivery`, `cardDelivery`) sao normalizados para `pix` e `card`.
- Labels antigos de pedidos como "Pix online", "Pix na entrega" e "Cartao na entrega" sao normalizados para `Pix`, `Dinheiro` e `Cartao`.
- Status antigo `Pagamento na entrega` e variantes antigas sao normalizados para status publico amigavel.
- Auditoria final confirmou que termos antigos de pagamento restantes no codigo sao apenas normalizacao/migracao ou fallback interno de compatibilidade.
- `additionalGroups` sao criados a partir de dados antigos `addons` se necessario.
- Pedidos antigos com `addons` viram `selectedAdditionals`.
- `platformSettings` e mantido como alias de `platform`.

Validacoes atuais:

- LocalStorage limpo inicializa `pedicampos.database.v1` corretamente.
- Mocks iniciais carregam Neguinho do Acai e Gordinho Burguer.
- `platform` e `platformSettings` carregam com PediCampos.
- Rotas principais responderam 200: `/`, `/neguinhodoacai`, `/gordinhoburguer`, `/admin` e `/master`.
- `src/pages/AdminProducts.jsx` importa `formatCurrency` de `../utils/formatCurrency.js`.
- `node --check src/services/database.js` passou sem erro de sintaxe.
- `src/hooks/usePediData.js` importa `getDatabase` e `subscribeDatabase` de `src/services/database.js`.
- Teste pos-adaptacao de `usePediData.js` confirmou que `database.subscribeDatabase` recebe eventos disparados por escritas ainda feitas em `storage.js`.
- Rotas principais responderam 200 via Vite local apos a adaptacao do hook: `/`, `/neguinhodoacai`, `/gordinhoburguer`, `/admin` e `/master`.
- Validacao isolada confirmou lojas, adicionais, carrinho, checkout por regras, pedidos Pro/Premium, status de pedido e dados do master sem regressao causada pela troca do hook.
- Copy publica revisada: `CheckoutPage.jsx`, `LandingPage.jsx` e defaults publicos de `storage.js` nao devem exibir `simulado`, `mock`, `localStorage`, `ficticio` ou `DEMO` para cliente final.
- Termos tecnicos como `localStorage`, `mock` e `simulado` ainda podem aparecer em documentacao, codigo, comentarios e normalizacao de legado.
- `npm run build` passou apos a correcao de `formatCurrency` e apos os ajustes responsivos.
- `npm run build` passou apos a criacao de `src/services/database.js`.
- `npm run build` passou apos a migracao de `src/hooks/usePediData.js` para `database.js`.
- `npm run build` passou apos o teste pos-adaptacao de `usePediData.js`.
- `npm run build` passou apos a revisao de copy publica.
- Loja publica/checkout nao deve expor plano, upgrade, "Pix online" ou "Pix na entrega" para o consumidor final.
- Checkout publico deve mostrar formas de pagamento apenas como `Pix`, `Dinheiro` e `Cartao`.
- Resumo lateral do checkout deve mostrar somente itens, subtotal, entrega e total.
- Pagina de acompanhamento deve separar `Pagamento` e `Status do pagamento`.
- Auditoria final pesquisou `Pix na entrega`, `Pagamento na entrega`, `Pix online`, `Cartao na entrega`, `pixDelivery`, `cardDelivery`, `paymentOnDelivery`, `pix_delivery`, `pix_on_delivery`, `card_delivery` e `payment_on_delivery`.
- Nenhum desses termos antigos ficou visivel ao cliente final.

## UI e estilos

Estilos:

- `src/styles/global.css` concentra a maior parte do visual.
- `src/styles/variables.css` guarda variaveis CSS globais.
- Loja publica usa `--store-color` para cor principal.
- Landing usa `--color-primary`, `--color-primary-dark` e `--color-graphite`.
- Responsividade principal fica em `src/styles/global.css`.
- Menus mobile usam rolagem horizontal controlada quando o espaco fica curto.
- Sidebar do admin/master vira barra superior com rolagem horizontal em telas menores.
- Tabelas administrativas usam scroll horizontal controlado para nao estourar o viewport.
- Modais usam limite de altura, scroll interno e ajustes de padding no mobile.
- Botoes, textos, cards, carrinho e metricas possuem quebras/empilhamento para telas pequenas.

Componentes UI:

- `Button`
- `Card`
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `Badge`
- `MetricCard`
- `StatusBadge`
- `Modal`
- `EmptyState`
- `PlanCard`

## Deploy

Arquivo:

- `vercel.json`

Conteudo atual:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Objetivo:

- Suportar rotas client-side em deploy Vercel.
- Permitir abrir diretamente `/neguinhodoacai`, `/admin`, `/master`, etc.

## Futuras integracoes

### Supabase

Supabase passou a ser o banco alvo oficial do projeto em 2026-07-09.

Nao deve substituir tudo de uma vez. A camada de service inicial ja existe em `src/services/database.js`, preservando localStorage/mocks como fallback temporario.

Tabelas propostas:

- `platform_settings`;
- `plans`;
- `stores`;
- `store_users`;
- `categories`;
- `products`;
- `additional_groups`;
- `additional_options`;
- `additional_group_products`;
- `customers`;
- `orders`;
- `order_items`;
- `order_item_additionals`;
- `payment_methods`;
- `store_settings`.

O schema SQL inicial esta documentado em `SUPABASE_MIGRATION_PLAN.md` e materializado em `supabase/schema.sql`.

Estado atual em 2026-07-11:

- O schema ja foi executado no SQL Editor do projeto Supabase `pedicampos`.
- O retorno `Sucesso. Nenhuma linha retornada.` foi considerado correto.
- As 15 tabelas esperadas foram conferidas no Table Editor.
- RLS, policies, indices e triggers de `updated_at` ainda precisam ser conferidos no painel.
- O React ja possui `src/services/supabaseClient.js`.
- `@supabase/supabase-js` ja foi instalado.
- `.env.example` foi criado.
- `.env.local` ainda deve ser criado localmente com as chaves reais e nao deve ir para o Git.
- `database.js` continua usando `storage.js/localStorage` como fallback real.

Proxima conexao planejada:

- Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Nao usar senha do banco no frontend.
- Testar conexao basica Supabase com `src/services/supabaseClient.js`.
- Conectar a camada de dados sem migrar dados ainda.
- Depois migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.

### Autenticacao real

Entraria no lugar dos logins fake:

- Admin da loja com usuario vinculado a `storeId`.
- Master com role global.
- Regras de acesso por tenant.

### Storage de imagens

Entraria para:

- logos;
- banners;
- imagens de produtos.

Substituiria campos de URL/manual por upload real.

### Pix real

Entraria no checkout:

- criar cobranca no backend;
- retornar QR Code e copia e cola;
- salvar identificador de cobranca;
- receber webhook;
- atualizar status do pedido.

Possiveis provedores:

- Mercado Pago;
- Asaas.

### WhatsApp Cloud API

Entraria em `AdminOrders`/backend:

- disparar mensagem ao criar pedido;
- disparar mensagem ao mudar status;
- usar templates aprovados;
- registrar historico de envio.

### Deploy Vercel e dominio

Passos futuros:

- configurar projeto na Vercel;
- configurar variaveis de ambiente;
- apontar `pedicampos.com.br`;
- validar rewrites;
- validar localStorage em HTTPS;
- preparar migracao para backend.

## Teste local manual

Estado em 2026-07-10:

- Servidor local preparado para teste visual/manual.
- Comando usado pelo projeto: `npm run dev`.
- Endereco confirmado: `http://127.0.0.1:5174`.
- O `package.json` fixa Vite em `127.0.0.1:5174` com `--strictPort`; portanto 5174 e a porta correta neste projeto.
- Rotas que devem ser abertas no teste:
  - `http://127.0.0.1:5174/`;
  - `http://127.0.0.1:5174/neguinhodoacai`;
  - `http://127.0.0.1:5174/gordinhoburguer`;
  - `http://127.0.0.1:5174/admin`;
  - `http://127.0.0.1:5174/master`.
- Logins:
  - Admin Neguinho do Acai: `admin@neguinho.com` / `123456`;
  - Admin Gordinho Burguer: `admin@gordinho.com` / `123456`;
  - Admin com loja selecionada: senha `123456`;
  - Master: `master@pedicampos.com.br` / `123456`.
- Checklist manual: landing, loja publica, produto, adicionais gratis/pagos, carrinho, checkout, acompanhamento, admin pedidos, alteracao de status, master lojas/configuracoes, responsividade mobile e ausencia de termos publicos como `simulado`, `mock`, `localStorage`, `teste` ou `dados ficticios`.
- `database.js` segue como fachada temporaria e `usePediData.js` ja usa essa fachada.
- `storage.js/localStorage` continuam como fallback.
- `src/services/supabaseClient.js` ja existe, mas Supabase ainda nao migra dados.
- Build de integridade apos finalizacao das memorias: `npm run build` passou em 2026-07-10 com permissao elevada apos a falha conhecida do sandbox ao resolver `vite.config.js`.
- Build apos correcao dos adicionais no acompanhamento do pedido: `npm run build` passou.
- Build apos ajuste mobile dos controles de quantidade do carrinho: `npm run build` passou.
- Build apos ajuste do menu superior do admin mobile: `npm run build` passou.
- Build apos scroll automatico ao editar produtos no admin: `npm run build` passou.
- Build apos scroll automatico ao editar grupos/adicionais no admin: `npm run build` passou.
- Build apos revisao dos cards/chips de adicionais no admin mobile: `npm run build` passou.
- Build apos atualizacao das memorias com o estado real do Supabase: `npm run build` passou em 2026-07-11.

Correcoes ja realizadas apos o teste visual/manual:

- Acompanhamento do pedido em desktop:
  - texto repetido de adicionais corrigido em `src/pages/OrderTrackingPage.jsx`;
  - adicionais renderizam em linha com prefixo unico, por exemplo `Adicionais: Bacon extra + R$ 5,00, Cheddar + R$ 4,00`.
- Carrinho mobile:
  - controles de quantidade ajustados em `src/styles/global.css`;
  - no mobile, os controles ficam compactos em linha, no formato `[-] [quantidade] [+]`;
  - calculo e comportamento do carrinho foram preservados.
- Menu superior do admin mobile:
  - ajustado em `src/components/admin/AdminLayout.jsx` e `src/styles/global.css`;
  - a navegacao mobile do admin segue como barra horizontal rolavel, com trilho visual, melhor espacamento e links em formato de pilula;
  - desktop, rotas e logica foram preservados.
- Admin produtos mobile:
  - scroll automatico ao tocar em `Editar` corrigido em `src/pages/AdminProducts.jsx`;
  - o formulario de produtos usa `useRef` e `scrollIntoView({ behavior: "smooth", block: "start" })`;
  - comportamento de criacao/edicao e desktop foram preservados.
- Admin adicionais mobile:
  - scroll automatico ao tocar em `Editar` corrigido em `src/pages/AdminAdditionals.jsx`;
  - o formulario de adicionais usa `useRef` e `scrollIntoView({ behavior: "smooth", block: "start" })`;
  - comportamento de criacao/edicao, vinculos e opcoes foram preservados.
- Admin adicionais mobile:
  - cards/chips de opcoes revisados em `src/styles/global.css`;
  - cards ganharam melhor espacamento no mobile;
  - chips/opcoes usam grade responsiva com quebra de linha mais legivel;
  - desktop e comportamento dos adicionais foram preservados.

Pendencias visuais/mobile restantes:

- Nenhuma pendencia visual/mobile registrada no teste manual permanece aberta no codigo.
- Proxima etapa: testar novamente no navegador real em `http://127.0.0.1:5174`.

## Riscos tecnicos atuais

- localStorage nao e banco real e pode ser apagado pelo navegador.
- Nao existe controle real de concorrencia.
- Nao existe autenticacao real.
- Nao existe isolamento seguro de tenant no backend.
- Pix e WhatsApp sao simulados.
- Imagens sao URLs/assets, sem upload.
- Testes automatizados ainda nao existem.

## Principio para continuar

Antes de implementar novas features, ler:

1. `PROJECT_CONTEXT.md`
2. `ARCHITECTURE_PEDICAMPOS.md`
3. `TODO_PEDICAMPOS.md`
4. `CHANGELOG_PEDICAMPOS.md`

Depois, continuar pela prioridade:

1. Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` reais.
2. Testar conexao basica Supabase sem migrar dados.
3. Conferir RLS, policies, indices e triggers de `updated_at`, se ainda nao tiver sido validado item por item.
4. Manter `database.js/storage.js/localStorage` como fallback.
5. Depois migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.
## Adapter de lojas Supabase - 2026-07-12

As operacoes exportadas de lojas em `database.js` sao assincronas e tentam Supabase primeiro. `storeToSupabase` limita writes a `plan_key`, `name`, `slug`, `segment`, `active`, `open`, `primary_color`, `whatsapp`, `logo` e `banner_url`. `storeFromSupabase` devolve o contrato camelCase atual e mantem `categories`, `products` e `additionalGroups` vazios, pois essas entidades nao foram migradas.

Em client ausente ou erro de consulta/escrita, a operacao equivalente usa `storage.js`. Sucesso remoto com zero linhas e um estado valido, portanto nao aciona fallback. O fallback pode causar divergencia se uma escrita online falhar; o console registra a troca de backend.

`getDatabase` e `subscribeDatabase` continuam locais e sincronos. Nao existe assinatura Realtime nem atualizacao automatica do hook a partir dessas funcoes assincronas. As telas master ainda gravam diretamente em `storage.js`, logo o compartilhamento local/dominio ainda depende de uma etapa posterior de integracao das telas e de Auth/RLS.

## Autorizacao master

Supabase Auth mantem a sessao no client. A autorizacao nao depende apenas da autenticacao: `isMasterUser` consulta uma linha ativa em `store_users` cujo `auth_user_id` corresponde ao usuario e cuja role e `master`. No banco, `public.is_master()` repete a mesma regra com `auth.uid()` para RLS.

Auditoria: `platform_settings` tem SELECT publico e administracao master; `plans` tem SELECT publico apenas de ativos e administracao master; `stores` tem leitura publica de ativos e, apos a migration 002, INSERT/UPDATE/DELETE somente master; `store_users` permite ao autenticado ler a propria linha e ao master gerenciar autorizacoes. O role `anon` nao recebe write administrativo.

O fallback de login usa `sessionStorage`, exige build DEV e flag explicita. Ele nao produz JWT Supabase e, portanto, nao contorna RLS nem habilita writes remotos.

## Estado assincrono das telas master de lojas

`MasterStores` mantem uma lista propria carregada por `getStores()`, separada do snapshot local de `usePediData`. Isso limita a mudanca as telas de lojas: pedidos e configuracao comercial continuam vindo do hook local. Depois de cada mutation, a tela executa nova leitura para refletir o estado confirmado pelo adapter.

`MasterCreateStore` consulta as lojas antes de gerar o slug e aguarda `createStore()`. O adapter decide entre Supabase e fallback; a tela nao grava uma copia adicional no localStorage.

`subscribeDatabase` continua sendo uma assinatura de eventos do localStorage e nao recebe eventos remotos Supabase. Nao foi adicionado Realtime nesta etapa; abrir/recarregar a listagem dispara uma consulta atualizada.

## Seed relacional dos planos

`stores.plan_key` referencia a chave unica `plans.key`. Como o schema inicial nao inclui dados, `003_seed_plans.sql` cria somente as linhas basicas necessarias para satisfazer essa integridade referencial.

A migration usa `on conflict (key) do nothing`: primeira execucao insere os planos ausentes; execucoes posteriores preservam integralmente registros existentes, inclusive precos que venham a ser alterados pelo painel master. Features e regras comerciais do frontend nao sao regravadas por este seed.

## Resolucao publica de loja por slug

`StorePage` possui estado assincrono isolado e chama `getStoreBySlug`. O adapter consulta `public.stores` primeiro e somente usa storage local quando Supabase esta ausente ou retorna erro. Uma resposta remota `null` e definitiva para aquela consulta e nao e substituida por mock.

As colecoes `categories`, `products` e `additionalGroups` retornam vazias no adapter relacional enquanto nao forem migradas. Isso representa um cardapio vazio, nao uma loja inexistente.

A policy publica de `stores` usa `active = true`. Assim, anon nao consegue diferenciar slug inexistente de loja inativa sem uma RPC/resposta publica especifica. O frontend preserva o estado visual de indisponibilidade para linhas inativas que sejam legitimamente retornadas, sem ampliar a policy nesta etapa.

## Persistencia relacional de categorias

Categorias usam `categories.id` UUID, `store_id` obrigatorio, `name`, `active` e `sort_order`. O adapter devolve o contrato atual `{ id, storeId, name, active, order }` e inclui timestamps sem aninhar a categoria na linha de loja.

Leituras sempre aplicam `.eq("store_id", storeId)`. No banco, leitura publica exige categoria ativa e loja ativa; writes exigem `can_access_store(store_id)`, que aceita master ou usuario ativo ligado a mesma loja. O role anon nao possui escrita.

O login fake do admin nao gera `auth.uid()`. Por isso `AdminCategories` continua no fluxo local e nao foi conectado ao adapter: uma sessao master eventualmente aberta no mesmo navegador nao deve ser tratada como identidade do lojista. A proxima camada necessaria e Auth real dos usuarios de loja.
