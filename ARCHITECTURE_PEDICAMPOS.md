# ARCHITECTURE - PediCampos

Atualizado em: 2026-07-08

## Visao geral

A PediCampos e uma SPA feita com React, Vite e JavaScript.

Estado tecnico atual:

- Frontend em React.
- Build com Vite.
- CSS global em arquivos proprios.
- Sem backend real ainda.
- Dados mockados inicializados a partir de arquivos JS.
- Persistencia local via localStorage.
- Preparada conceitualmente para migrar para Supabase/backend real.
- Rewrites SPA configurados em `vercel.json`.

Principais tecnologias:

- React 19.
- React DOM 19.
- Vite 7.
- JavaScript modules.
- CSS puro.
- localStorage.

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
6. `usePediData()` assina as mudancas com `subscribeDatabase`.
7. Telas de admin/master usam `updateStore`, `updateOrder`, `updatePlatform` ou `mutateDatabase`.
8. `saveDatabase()` grava o novo estado e dispara `pedicampos:data-updated`.
9. Componentes inscritos atualizam a interface automaticamente.

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
17. Se o pagamento e Pix online e o plano e Premium, usa Pix simulado.
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

Features atuais:

- Start:
  - `publicStore`
  - `whatsappOrder`
  - `products`
  - `categories`
  - `basicAdmin`
  - `simpleCart`
- Pro:
  - tudo do Start;
  - `siteCheckout`;
  - `ordersPanel`;
  - `orderStatus`;
  - `additionals`;
  - `reportsBasic`;
  - `orderTracking`.
- Premium:
  - tudo do Pro;
  - `pixOnline`;
  - `whatsappAutomation`;
  - `coupons`;
  - `reportsAdvanced`;
  - `automations`.

Uso atual:

- `PlanGuard` protege rotas admin.
- `CheckoutPage` decide Start vs Pro/Premium.
- `CheckoutPage` filtra Pix online.
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

## Fluxo de Pix simulado

1. Loja deve ter `paymentMethods.pixOnline = true`.
2. Plano deve ter feature `pixOnline`.
3. Checkout inclui "Pix online" nas opcoes.
4. Ao selecionar, exibe QR fake e copia e cola ficticio.
5. Usuario pode clicar em "Simular pagamento aprovado".
6. Pedido e salvo como:
   - aprovado/confirmado se simulado antes de finalizar;
   - aguardando pagamento se nao simulado.

Ponto futuro:

- Criacao da cobranca real deve entrar no backend no lugar dos comentarios em `CheckoutPage`.
- Webhook futuro deve atualizar `paymentStatus` e `orderStatus`.

## Fluxo de WhatsApp simulado

Start:

- Checkout monta mensagem manual com itens, endereco, subtotal, entrega e total.
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

Normalizacoes importantes:

- Planos antigos sao normalizados para `start`, `pro`, `premium`.
- Precos antigos de planos sao migrados para defaults atuais quando detectados.
- `additionalGroups` sao criados a partir de dados antigos `addons` se necessario.
- Pedidos antigos com `addons` viram `selectedAdditionals`.
- `platformSettings` e mantido como alias de `platform`.

## UI e estilos

Estilos:

- `src/styles/global.css` concentra a maior parte do visual.
- `src/styles/variables.css` guarda variaveis CSS globais.
- Loja publica usa `--store-color` para cor principal.
- Landing usa `--color-primary`, `--color-primary-dark` e `--color-graphite`.

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

Entraria substituindo ou complementando `src/services/storage.js`.

Tabelas provaveis:

- `stores`;
- `products`;
- `categories`;
- `additional_groups`;
- `additional_options`;
- `orders`;
- `order_items`;
- `platform_settings`;
- `plans`;
- `profiles/users`.

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

## Riscos tecnicos atuais

- localStorage nao e banco real e pode ser apagado pelo navegador.
- Nao existe controle real de concorrencia.
- Nao existe autenticacao real.
- Nao existe isolamento seguro de tenant no backend.
- Pix e WhatsApp sao simulados.
- Imagens sao URLs/assets, sem upload.
- Possivel bug runtime em `AdminProducts.jsx` por falta de import de `formatCurrency`.
- Testes automatizados ainda nao existem.

## Principio para continuar

Antes de implementar novas features, ler:

1. `PROJECT_CONTEXT.md`
2. `ARCHITECTURE_PEDICAMPOS.md`
3. `TODO_PEDICAMPOS.md`
4. `CHANGELOG_PEDICAMPOS.md`

Depois, continuar pela prioridade:

1. Corrigir bugs bloqueadores.
2. Testar fluxo completo.
3. Polir responsividade.
4. Preparar deploy.
5. Planejar backend real.
