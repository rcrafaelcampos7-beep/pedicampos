# PROJECT_CONTEXT - PediCampos

Atualizado em: 2026-07-10

Este arquivo e a memoria principal do projeto PediCampos. Ele registra o estado atual do codigo, as decisoes ja tomadas, o que esta implementado, o que esta parcial e o que ainda e pendente.

## Identidade do projeto

- Nome: PediCampos.
- Dominio registrado/planejado: pedicampos.com.br.
- Proposta principal: oferecer uma plataforma SaaS multi-lojas para negocios locais terem cardapio digital, loja publica por link, carrinho, checkout, pedidos online e painel administrativo proprio.
- Publico-alvo: acaiterias, hamburguerias, lanchonetes, restaurantes, confeitarias, lojas de delivery local e pequenos negocios que querem vender sem depender apenas de marketplaces.
- Tipo de sistema: SaaS multi-lojas em uma SPA React/Vite. A versao atual ainda usa dados mockados persistidos em localStorage, mas a nova direcao do projeto e migrar para banco real online com Supabase.
- Modelo multi-lojas em dominio unico: cada loja usa um slug proprio no mesmo dominio.
- Exemplos de slugs:
  - pedicampos.com.br/neguinhodoacai
  - pedicampos.com.br/gordinhoburguer
  - pedicampos.com.br/nomedaloja
- Frase principal atual da marca: "Seu delivery proprio em um link."
- Frase secundaria atual: "Cardapio digital, pedidos online, Pix e WhatsApp automatico para negocios locais."
- Estrategia comercial: cobrar implantacao inicial e mensalidade por plano. O plano Premium deve ser destacado porque custa apenas R$ 20,00 a mais que o Pro no codigo atual, incentivando upgrade.

## Areas do sistema

- Landing page: rota `/`. E a pagina comercial da PediCampos, voltada para vender a plataforma.
- Loja publica: rota `/:slug`. E a vitrine da loja do cliente final, com produtos, categorias, adicionais, carrinho e acesso ao checkout.
- Admin da loja: rotas `/admin/*`. E o painel usado pelo lojista para editar a propria loja, produtos, categorias, adicionais, pedidos e configuracoes.
- Master: rotas `/master/*`. E o painel do dono da PediCampos para controlar todas as lojas, planos, pedidos gerais e configuracoes comerciais da plataforma.

## Objetivo da plataforma

A PediCampos e uma plataforma SaaS multi-lojas para:

- cardapio digital;
- delivery proprio;
- pedidos online;
- painel administrativo da loja;
- painel master geral;
- pagamento online por Pix/Cartao futuramente real, atualmente simulado;
- WhatsApp automatico futuramente real, atualmente simulado;
- planos por funcionalidades;
- cada loja em um slug proprio no mesmo dominio.

## Nova direcao tecnica - 2026-07-09

O projeto esta saindo da fase puramente local/mockada e entrando na fase de preparacao para uso real online no dominio `pedicampos.com.br`.

Decisoes registradas:

- Supabase sera o banco de dados alvo.
- Tudo que for criado no master/admin deve futuramente refletir online no dominio e em outros dispositivos.
- `localStorage` nao sera removido agora; ele sera mantido temporariamente como fallback durante a migracao.
- `src/data/mockStores.js` e `src/data/mockOrders.js` nao serao removidos agora; continuam como seed/fallback enquanto a migracao nao estiver validada.
- A primeira camada de acesso a dados foi criada em `src/services/database.js`.
- `src/services/database.js` funciona como fachada/adapter temporario e ainda usa `src/services/storage.js` por baixo.
- Depois, essa camada deve passar a falar com Supabase usando variaveis de ambiente.
- Nao deve haver SDK do Supabase espalhado diretamente pelas telas.
- O plano tecnico completo foi criado em `SUPABASE_MIGRATION_PLAN.md`.
- A area publica/comercial deve parar de usar linguagem de simulacao antes do uso real. Pix real, WhatsApp Cloud API e Supabase ainda precisam continuar claros na documentacao tecnica como pendentes/em migracao.

## Estado atual do projeto

Implementado:

- Projeto React/Vite/JavaScript com SPA e roteador proprio simples.
- Landing page da PediCampos em `/`.
- Loja publica por slug em `/:slug`.
- Lojas demo reais no mock/localStorage: Neguinho do Acai e Gordinho Burguer.
- Carrinho por loja com persistencia em localStorage.
- Modal de produto com quantidade, observacao e adicionais configuraveis.
- Checkout em `/:slug/checkout`.
- Pagamento automatico simulado por Pix e Cartao para planos Pro e Premium.
- Pedido salvo em localStorage para planos com checkout no site.
- Acompanhamento de pedido em `/:slug/pedido/:orderId`.
- Painel admin da loja.
- Painel master.
- Configuracoes da plataforma editaveis no master.
- Planos Start, Pro e Premium com recursos por plano.
- Adicionais configuraveis por loja, vinculados a produtos.
- Fachada inicial de dados criada em `src/services/database.js`, ainda usando `storage.js/localStorage`.
- `src/hooks/usePediData.js` passou a consumir `src/services/database.js` para leitura e assinatura de atualizacoes.
- Persistencia via localStorage.
- Dados mockados iniciais.
- Rewrites de SPA para Vercel em `vercel.json`.

Parcial ou simulado:

- Pagamento online por Pix/Cartao e apenas simulado, sem Mercado Pago/Asaas/webhook/gateway real.
- WhatsApp automatico e apenas simulado por mensagens geradas no painel.
- Login e fake/localStorage, sem autenticacao real.
- Upload de imagens nao existe; campos aceitam URL, iniciais ou assets locais.
- Banco de dados real ainda nao existe; tudo fica em localStorage, mas a migracao para Supabase ja foi planejada em `SUPABASE_MIGRATION_PLAN.md`.

## Rotas existentes

- `/`: landing page comercial da PediCampos.
- `/:slug`: loja publica de uma loja ativa. Se o slug nao existir, mostra "Loja nao encontrada". Se a loja estiver inativa, mostra "Esta loja esta temporariamente indisponivel.".
- `/:slug/checkout`: checkout da loja. Bloqueia loja inativa e loja fechada. No Start envia para WhatsApp; no Pro/Premium salva pedido conforme recursos do plano.
- `/:slug/pedido/:orderId`: acompanhamento do pedido salvo.
- `/admin`: se autenticado, redireciona para `/admin/dashboard`; se nao, mostra login fake do admin.
- `/admin/dashboard`: dashboard da loja selecionada.
- `/admin/pedidos`: painel de pedidos da loja. Protegido por `PlanGuard`; disponivel a partir do Pro.
- `/admin/produtos`: CRUD de produtos da loja selecionada.
- `/admin/categorias`: CRUD e ordenacao de categorias da loja selecionada.
- `/admin/adicionais`: CRUD de grupos de adicionais. Protegido por `PlanGuard`; disponivel a partir do Pro.
- `/admin/configuracoes`: configuracoes da loja selecionada.
- `/master`: se autenticado, redireciona para `/master/dashboard`; se nao, mostra login fake do master.
- `/master/dashboard`: visao geral de lojas, pedidos e faturamento simulado.
- `/master/lojas`: lista lojas, edita dados principais, ativa/desativa, acessa vitrine publica.
- `/master/criar-loja`: cria uma nova loja no mock/localStorage.
- `/master/pedidos`: lista pedidos de todas as lojas com filtros.
- `/master/planos`: exibe planos e permite associar plano a uma loja.
- `/master/configuracoes`: edita identidade, landing page, secoes, FAQ, implantacao e planos.

## Logins fake e acessos de demonstracao

Admin da loja:

- Rota: `/admin`.
- E-mail padrao preenchido: `admin@neguinho.com`.
- Senha padrao: `123456`.
- O login aceita uma loja selecionada no select quando a senha e `123456`.
- Se e-mail e senha baterem com uma loja, usa essa loja.
- Se nao houver match exato mas a senha for `123456`, usa a loja selecionada.
- Lojas demo tambem possuem:
  - Neguinho do Acai: `admin@neguinho.com` / `123456`.
  - Gordinho Burguer: `admin@gordinho.com` / `123456`.
- Ao entrar, grava:
  - `pedicampos.admin.auth = "true"`;
  - `pedicampos.admin.storeId = id da loja`.
- Apos login, navega para `/admin/dashboard`.
- O admin sempre edita a loja selecionada em `pedicampos.admin.storeId`.

Master:

- Rota: `/master`.
- E-mail: `master@pedicampos.com.br`.
- Senha: `123456`.
- Ao entrar, grava `pedicampos.master.auth = "true"`.
- Apos login, navega para `/master/dashboard`.

## Lojas demo

As lojas demo nao sao paginas fixas. Elas existem dentro de `src/data/mockStores.js`, sao inicializadas em `localStorage`, aparecem no painel master, podem ser editadas e suas mudancas refletem na loja publica.

### Neguinho do Acai

- Id: `store-neguinho`.
- Nome: Neguinho do Acai.
- Slug: `neguinhodoacai`.
- Acesso publico: `/neguinhodoacai`.
- Segmento: Acai e lanches.
- Plano atual: `pro`.
- Status inicial: ativa e aberta.
- Cor principal: `#7c3aed`.
- WhatsApp: `559999100100`.
- E-mail admin: `admin@neguinho.com`.
- Senha admin: `123456`.
- Categorias:
  - Acai;
  - Barcas;
  - Milk-shakes;
  - Bebidas;
  - Combos.
- Produtos principais:
  - Acai 300ml;
  - Acai 500ml;
  - Acai 700ml;
  - Barca de Acai;
  - Milk-shake de Morango;
  - Milk-shake de Chocolate;
  - Combo Casal;
  - Coca-Cola lata;
  - Agua mineral.
- Adicionais existentes:
  - Acompanhamentos: maximo 3, multipla escolha, gratis e pagos.
  - Calda especial: maximo 1, selecao unica, gratis e pagos.
- Editavel pelo master: sim.
- Editavel pelo admin: sim.
- Onde os dados ficam: `pedicampos.database.v1.stores[]` no localStorage.

### Gordinho Burguer

- Id: `store-gordinho`.
- Nome: Gordinho Burguer.
- Slug: `gordinhoburguer`.
- Acesso publico: `/gordinhoburguer`.
- Segmento: Hamburgueria.
- Plano atual: `premium`.
- Status inicial: ativa e aberta.
- Cor principal: `#ef4444`.
- WhatsApp: `559999200200`.
- E-mail admin: `admin@gordinho.com`.
- Senha admin: `123456`.
- Categorias:
  - Artesanais;
  - Smash;
  - Hot Dog;
  - Combos;
  - Bebidas.
- Produtos principais:
  - X-Bacon Artesanal;
  - Smash Duplo;
  - Gordinho Especial;
  - Hot Dog Completo;
  - Combo Smash + Batata;
  - Combo Familia;
  - Batata Frita;
  - Coca-Cola 1L;
  - Guarana lata.
- Adicionais existentes:
  - Adicionais do lanche: maximo 4, multipla escolha.
  - Escolha sua bebida: obrigatorio, minimo 1, maximo 1, selecao unica.
- Editavel pelo master: sim.
- Editavel pelo admin: sim.
- Onde os dados ficam: `pedicampos.database.v1.stores[]` no localStorage.

## Landing page

Arquivo principal: `src/pages/LandingPage.jsx`.

Estrutura atual:

- Header com logo, navegacao, botao de demonstracao e WhatsApp comercial.
- Hero com chamada principal, subtitulo, botoes, estatisticas e mockup visual.
- Cards de destaque vindos de `platform.featureHighlights`.
- Secao "Como funciona".
- Secao de funcionalidades.
- Secao de demonstracao usando uma loja real do mock/localStorage.
- Secao de planos.
- FAQ.
- Rodape com links para master, admin, WhatsApp e Instagram.

Dados da landing:

- Vem de `database.platform` e tambem e mantido como alias em `database.platformSettings`.
- Editavel em `/master/configuracoes`.
- Secoes podem ser ativadas/desativadas por `platform.sections`.

Valores comerciais finais:

- Implantacao: R$ 599,99.
- Plano Start: R$ 99,99/mes.
- Plano Pro: R$ 179,99/mes.
- Plano Premium: R$ 199,99/mes.
- Premium destacado com selo "Melhor escolha" e texto "Por apenas R$ 20,00 a mais que o Pro".

Observacao: todos os valores comerciais usam gatilho com `,99`.

## Planos e funcionalidades

Arquivo principal: `src/utils/plans.js`.

### Start

Preco atual no codigo: R$ 99,99/mes.

Recursos permitidos:

- loja publica basica;
- cardapio;
- categorias;
- produtos;
- logo;
- banner;
- cores;
- endereco;
- horario;
- botao WhatsApp;
- pedido simples pelo WhatsApp;
- painel basico para produtos/categorias/configuracoes;
- carrinho simples;
- Pix manual;
- Cartao manual/na entrega;
- dinheiro.

Recursos bloqueados:

- checkout com pedido salvo no painel;
- painel de pedidos;
- status avancado do pedido;
- adicionais configuraveis;
- pagamento online automatico;
- confirmacao automatica de pagamento;
- WhatsApp automatico;
- cupons;
- relatorios avancados;
- automacoes.

### Pro

Preco atual no codigo: R$ 179,99/mes.

Recursos permitidos:

- tudo do Start;
- checkout no site;
- pedido salvo no painel;
- painel de pedidos;
- status do pedido;
- dashboard com metricas simples;
- adicionais configuraveis;
- controle de produtos;
- categorias;
- configuracoes;
- acompanhamento do pedido;
- Pix automatico simulado com QR Code/copia e cola;
- Cartao automatico simulado;
- pagamento automatico simulado;
- confirmacao automatica de pagamento simulada;
- relatorios simples.

Recursos bloqueados:

- WhatsApp automatico real/simulado;
- cupons;
- relatorios avancados;
- automacoes premium.

### Premium

Preco atual no codigo: R$ 199,99/mes.

Recursos permitidos:

- tudo do Pro;
- WhatsApp automatico simulado;
- mensagens automaticas por status;
- cupons;
- relatorios avancados;
- automacoes;
- recursos avancados.

Como o plano controla o sistema:

- `planHasFeature(plan, feature, platform)` verifica se o plano tem uma feature.
- `FEATURE_MIN_PLAN` define o plano minimo de algumas features.
- `/admin/pedidos` e `/admin/adicionais` usam `PlanGuard`.
- Checkout no site depende de `siteCheckout`.
- Pagamento automatico simulado depende de `onlinePayments`, `pixAutomatic`, `cardAutomatic` e `automaticPaymentConfirmation`.
- Adicionais no modal do produto dependem de `additionals`.
- Os recursos por plano podem ser sobrescritos em `platform.featuresByPlan`.

## Painel Master

O master e o painel do dono da PediCampos.

Implementado:

- dashboard geral em `/master/dashboard`;
- listar lojas em `/master/lojas`;
- criar loja em `/master/criar-loja`;
- editar loja em modal dentro de `/master/lojas`;
- ativar/desativar loja;
- alterar plano da loja;
- acessar loja publica;
- pedidos gerais em `/master/pedidos`;
- tela de planos em `/master/planos`;
- configuracoes da PediCampos em `/master/configuracoes`;
- alterar textos da landing page;
- alterar precos dos planos;
- alterar valor de implantacao;
- alterar slogan;
- alterar WhatsApp comercial;
- alterar Instagram;
- alterar secoes visiveis;
- persistir tudo no localStorage.

Campos principais editaveis de loja no master:

- nome;
- slug;
- segmento;
- plano;
- WhatsApp;
- cor principal;
- logo;
- banner;
- taxa de entrega;
- tempo medio;
- endereco;
- status ativa/inativa;
- status aberta/fechada.

Comportamento de slug:

- Em criacao e edicao pelo master, `uniqueSlug` evita conflito.
- Se o slug mudar, o link antigo deixa de encontrar a loja e o novo slug passa a funcionar.

## Painel Admin da Loja

O admin edita a loja selecionada no login fake.

Implementado:

- dashboard da loja;
- pedidos da loja, quando o plano permite;
- produtos;
- categorias;
- adicionais, quando o plano permite;
- configuracoes;
- alterar nome, slug, segmento, logo, banner, cor, WhatsApp, endereco, horario, tempo medio, status aberto/fechado, status ativa/inativa, taxa de entrega e formas de pagamento;
- criar/editar/excluir produtos;
- ativar/desativar produtos;
- vincular grupos de adicionais a produtos;
- criar/editar/excluir categorias;
- ordenar categorias;
- criar/editar/excluir grupos de adicionais;
- ativar/desativar grupos e opcoes de adicionais;
- visualizar pedidos;
- alterar status;
- confirmar pagamento manualmente;
- ver previa de mensagens WhatsApp simuladas;
- respeitar limitacoes de plano via `PlanGuard` e `planHasFeature`.

Cada loja deve ver apenas seus proprios dados. O filtro acontece por `store.id` e pelo `storeId` salvo na sessao fake.

## Adicionais configuraveis

Regra principal: adicionais sao dados cadastraveis pelo lojista e vinculados a produtos. Nao devem ser fixos no codigo.

Implementado:

- Cada loja possui seus proprios `additionalGroups`.
- Cada grupo pertence a uma loja por `storeId`.
- Cada grupo pode ser vinculado a qualquer produto daquela loja por `productIds`.
- Cada grupo pode ser obrigatorio ou opcional.
- Cada grupo pode ter minimo e maximo de escolhas.
- A selecao pode ser unica (`single`) ou multipla (`multiple`).
- Opcoes podem ser gratis ou pagas.
- Preco `0` significa gratis.
- Preco maior que `0` soma no total do item.
- Grupos e opcoes podem ser ativados/desativados.
- Adicionais gratis aparecem no carrinho e no pedido, mas nao alteram o preco.
- O modal de produto valida obrigatoriedade, minimo e maximo.

Estrutura de dados atual:

```js
additionalGroups: [
  {
    id,
    storeId,
    name,
    description,
    required,
    min,
    max,
    selectionType, // "single" ou "multiple"
    productIds,
    active,
    options: [
      {
        id,
        name,
        price,
        active
      }
    ]
  }
]
```

Estrutura salva no carrinho/pedido:

```js
selectedAdditionals: [
  {
    groupId,
    groupName,
    optionId,
    optionName,
    name,
    price
  }
]
```

Onde os adicionais aparecem:

- modal do produto;
- carrinho;
- checkout;
- pedido salvo;
- acompanhamento do pedido;
- painel de pedidos.

Compatibilidade:

- Pedidos antigos/mock podem ter `addons`.
- `storage.js` normaliza itens antigos para `selectedAdditionals`.
- Componentes ainda exibem fallback `(selectedAdditionals || addons || [])`.

## Carrinho e checkout

Carrinho:

- Hook: `src/hooks/useCart.js`.
- Chave: `pedicampos.cart.${storeId}`.
- Cada loja tem carrinho separado.
- Produto e adicionado com:
  - `productId`;
  - nome;
  - preco base;
  - quantidade;
  - adicionais selecionados;
  - observacao;
  - imagem;
  - total.
- A quantidade recalcula o total usando preco unitario + adicionais.
- Observacao fica em `note` e `observation`.

Checkout:

- Arquivo: `src/pages/CheckoutPage.jsx`.
- Rota: `/:slug/checkout`.
- Valida nome, telefone e endereco quando for entrega.
- Permite entrega ou retirada.
- Usa taxa de entrega da loja.
- Formas de pagamento vem de `store.paymentMethods`.
- Na area publica do checkout, as formas aparecem apenas como `Pix`, `Dinheiro` e `Cartao`.
- O card publico "Formas ativas" foi removido do resumo lateral; o resumo mostra somente itens, subtotal, entrega e total.
- `pixOnline` continua como recurso interno para QR Code/copia e cola, mas o label publico deve ser sempre `Pix`.
- Loja inativa mostra aviso e nao aceita pedido.
- Loja fechada bloqueia finalizacao.

Comportamento por plano:

- Start: nao salva pedido no painel; monta mensagem e abre WhatsApp manualmente.
- Pro: salva pedido no painel, permite acompanhamento e pagamento automatico simulado por Pix e Cartao.
- Premium: tudo do Pro mais WhatsApp automatico simulado, mensagens por status e automacoes.

Pedidos:

- Salvos dentro de `pedicampos.database.v1.orders`.
- Numero/id e gerado com os ultimos 6 digitos de `Date.now()`.
- Campos principais: `id`, `number`, `storeId`, `storeSlug`, `storeName`, `customer`, `fulfillment`, `address`, `paymentMethod`, `paymentStatus`, `orderStatus`, `subtotal`, `deliveryFee`, `total`, `pixCode`, `items`.

## Pagamento automatico simulado

Implementado no checkout:

- Aparece no checkout quando:
  - o plano tem `onlinePayments`;
  - para Pix, o plano tem `pixAutomatic` e a loja tem Pix ativo;
  - para Cartao, o plano tem `cardAutomatic` e a loja tem Cartao ativo.
- Para Pix, exibe QR Code visual fake.
- Para Pix, gera copia e cola ficticio no formato `000201PEDICAMPOS-slug-valor-DEMO`.
- Para Cartao, exibe confirmacao de pagamento com cartao simulada.
- Botao "Simular pagamento aprovado" muda o estado local `automaticPaymentApproved`.
- Se aprovado antes de finalizar, pedido e salvo com pagamento aprovado e status "Pagamento confirmado".
- Se nao aprovado, pedido fica aguardando pagamento.

Futuro:

- Integrar Mercado Pago ou Asaas.
- Criar cobranca real no backend.
- Trocar QR fake pelo QR retornado pela API.
- Confirmar pagamento por webhook.

## WhatsApp automatico simulado

Implementado:

- Utilitario: `src/utils/whatsappMessage.js`.
- Funcao: `generateWhatsAppMessage(order, status)`.
- Usado em `/admin/pedidos` para mostrar previa da mensagem automatica.
- Gera mensagens por status, incluindo link de acompanhamento.
- No plano Start, o checkout gera mensagem manual e abre `wa.me` da loja.

Futuro:

- Integrar WhatsApp Cloud API.
- Disparar mensagens reais quando o status do pedido mudar.
- Criar templates aprovados.
- Registrar historico/envio.

## LocalStorage e dados

Importante: localStorage continua sendo o mecanismo real do codigo atual, mas deixou de ser a direcao final do produto. A partir de 2026-07-09 ele deve ser tratado como fallback temporario ate a migracao para Supabase.

Chaves usadas:

- `pedicampos.database.v1`: banco mock principal.
- `pedicampos.cart.${storeId}`: carrinho separado por loja.
- `pedicampos.admin.auth`: flag fake de login admin.
- `pedicampos.admin.storeId`: loja selecionada no admin.
- `pedicampos.master.auth`: flag fake de login master.

Formato de `pedicampos.database.v1`:

```js
{
  stores: [],
  orders: [],
  platform: {},
  platformSettings: {}
}
```

Observacoes:

- Nao existem chaves separadas `stores`, `orders`, `plans` ou `additionalGroups` no localStorage.
- Esses dados ficam dentro de `pedicampos.database.v1`.
- `platformSettings` e alias de compatibilidade para `platform`.
- `additionalGroups` fica dentro de cada store.
- Eventos customizados atualizam a interface sem reload: `pedicampos:data-updated` e `pedicampos:session-updated`.

## Arquivos importantes

- `SUPABASE_MIGRATION_PLAN.md`: plano tecnico da migracao para Supabase, schema SQL proposto, riscos, fallback e checklist.
- `src/main.jsx`: entrada React.
- `src/App.jsx`: roteamento principal e protecao fake de admin/master.
- `src/routes/router.jsx`: roteador simples com `Link`, `navigate`, `usePath`.
- `src/services/database.js`: fachada/adapter temporario de dados para preparar Supabase sem alterar telas ainda.
- `src/hooks/usePediData.js`: hook central de leitura das telas; agora consome `database.js`.
- `src/services/storage.js`: inicializacao, normalizacao, localStorage, updates de loja, pedido e plataforma.
- `src/data/mockStores.js`: lojas demo, produtos, categorias, adicionais e criacao de loja vazia.
- `src/data/mockOrders.js`: pedidos iniciais mockados.
- `src/utils/formatCurrency.js`: formatacao BRL.
- `src/utils/orderStatus.js`: status de pedido/pagamento e timeline.
- `src/utils/whatsappMessage.js`: mensagens simuladas de WhatsApp.
- `src/utils/plans.js`: planos, features e regras de acesso.
- `src/utils/slug.js`: slugify e slug unico.
- `src/pages/LandingPage.jsx`: landing comercial.
- `src/pages/StorePage.jsx`: loja publica por slug.
- `src/pages/CheckoutPage.jsx`: checkout e criacao de pedidos.
- `src/pages/OrderTrackingPage.jsx`: acompanhamento de pedido.
- `src/pages/AdminLogin.jsx`: login fake do admin.
- `src/pages/AdminDashboard.jsx`: dashboard da loja.
- `src/pages/AdminOrders.jsx`: pedidos da loja.
- `src/pages/AdminProducts.jsx`: produtos.
- `src/pages/AdminCategories.jsx`: categorias.
- `src/pages/AdminAdditionals.jsx`: adicionais.
- `src/pages/AdminSettings.jsx`: configuracoes da loja.
- `src/pages/MasterLogin.jsx`: login fake master.
- `src/pages/MasterDashboard.jsx`: dashboard master.
- `src/pages/MasterStores.jsx`: lojas.
- `src/pages/MasterCreateStore.jsx`: criacao de loja.
- `src/pages/MasterOrders.jsx`: pedidos gerais.
- `src/pages/MasterPlans.jsx`: planos.
- `src/pages/MasterSettings.jsx`: configuracoes comerciais/landing.
- `src/components/admin/AdminLayout.jsx`: layout admin.
- `src/components/admin/PlanGuard.jsx`: bloqueio por plano.
- `src/components/master/MasterLayout.jsx`: layout master.
- `src/components/store/*`: componentes da loja publica.
- `src/components/ui/*`: componentes de UI.
- `src/styles/global.css`: estilos principais.
- `src/styles/variables.css`: variaveis CSS.
- `src/assets/*.png`: imagens geradas/localizadas para hero e banners.
- `vercel.json`: rewrite de todas as rotas para `index.html` na Vercel.

## Estado atual dos bugs e ajustes recentes

Ajustes recentes implementados:

- Corrigido o texto repetido de adicionais no acompanhamento do pedido:
  - arquivo alterado: `src/pages/OrderTrackingPage.jsx`;
  - os adicionais agora aparecem com o prefixo unico `Adicionais:` seguido das opcoes em linha, por exemplo `Adicionais: Bacon extra + R$ 5,00, Cheddar + R$ 4,00`;
  - nenhuma regra comercial, preco, plano, logica de pagamento ou Supabase foi alterado;
  - `npm run build` passou apos a correcao.
- Teste visual/manual local realizado em `http://127.0.0.1:5174` antes da troca de chat:
  - nenhum ajuste de codigo deve ser iniciado antes da proxima conversa;
  - as pendencias encontradas devem ser corrigidas antes de iniciar Supabase real;
  - acompanhamento do pedido em desktop tem texto de adicionais repetido/mal formatado, por exemplo `Adicionais: Bacon extra + R$ 5,00, Adicionais: Cheddar + R$ 4,00`;
  - carrinho mobile tem controles de quantidade muito largos e pouco centralizados;
  - menu superior do admin no mobile fica apertado, com itens cortados/espremidos;
  - em `AdminProducts`, ao tocar em Editar no mobile, a tela nao rola automaticamente ate o formulario;
  - em `AdminAdditionals`, ao tocar em Editar no mobile, a tela nao rola automaticamente ate o formulario;
  - em `AdminAdditionals` mobile, cards e chips/opcoes funcionam, mas ficam visualmente carregados;
  - arquivos provaveis: `src/pages/OrderTrackingPage.jsx`, `src/components/store/CartDrawer.jsx`, `src/components/admin/AdminLayout.jsx`, `src/pages/AdminProducts.jsx`, `src/pages/AdminAdditionals.jsx` e `src/styles/global.css`;
  - ordem sugerida para a proxima conversa: corrigir texto repetido de adicionais no acompanhamento; melhorar carrinho mobile; melhorar menu mobile do admin; adicionar scroll automatico ao editar produtos; adicionar scroll automatico ao editar adicionais; revisar cards/chips de adicionais no mobile; rodar `npm run build`; testar novamente no navegador local.
- Projeto preparado para teste visual/manual local em 2026-07-10:
  - comando solicitado: `npm run dev`;
  - o servidor Vite ja estava ativo e respondeu 200;
  - endereco local confirmado: `http://127.0.0.1:5174`;
  - observacao: o script `npm run dev` usa `vite --host 127.0.0.1 --port 5174 --strictPort`, portanto a porta correta neste projeto e 5174;
  - rotas verificadas com resposta 200: `/`, `/neguinhodoacai`, `/gordinhoburguer`, `/admin` e `/master`;
  - servidor nao deve ser encerrado ate o teste manual terminar;
  - links para teste manual:
    - `http://127.0.0.1:5174/`;
    - `http://127.0.0.1:5174/neguinhodoacai`;
    - `http://127.0.0.1:5174/gordinhoburguer`;
    - `http://127.0.0.1:5174/admin`;
    - `http://127.0.0.1:5174/master`;
  - logins disponiveis:
    - Admin Neguinho do Acai: `admin@neguinho.com` / `123456`;
    - Admin Gordinho Burguer: `admin@gordinho.com` / `123456`;
    - Admin tambem aceita selecionar uma loja e usar senha `123456`;
    - Master: `master@pedicampos.com.br` / `123456`;
  - checklist manual recomendado: landing, loja publica, produto, adicionais gratis/pagos, carrinho, checkout, acompanhamento, admin pedidos, alteracao de status, master lojas/configuracoes, responsividade mobile e ausencia de termos publicos como `simulado`, `mock`, `localStorage`, `teste` ou `dados ficticios`;
  - copy publica ja foi revisada para linguagem de produto real;
  - `src/services/database.js` continua como fachada temporaria;
  - `src/hooks/usePediData.js` ja consome `database.js`;
  - `src/services/storage.js` e `localStorage` continuam como fallback;
  - Supabase real ainda nao foi conectado;
  - proxima etapa apos o teste manual: corrigir qualquer bug visual encontrado ou iniciar a conexao Supabase.
- Copy publica revisada em 2026-07-10 para remover linguagem de teste/simulacao:
  - `src/pages/LandingPage.jsx` deixou de exibir `mock`, `localStorage`, `Loja demo` e "Demonstração real no mock";
  - `src/pages/CheckoutPage.jsx` deixou de exibir `simulado`, `ficticio` e `DEMO` no Pix/Cartao;
  - `src/services/storage.js` teve defaults publicos revisados para landing, FAQ e planos;
  - `src/services/storage.js` tambem normaliza copies legadas ja salvas em `pedicampos.database.v1`;
  - rotulos internos muito visiveis no admin/master foram profissionalizados;
  - termos como `localStorage`, `mock` e `simulado` continuam permitidos em documentacao tecnica, codigo, comentarios e normalizacao de legado;
  - Supabase real ainda nao foi conectado.
- Teste pos-adaptacao de `src/hooks/usePediData.js` realizado em 2026-07-10:
  - rotas principais responderam 200 via Vite local: `/`, `/neguinhodoacai`, `/gordinhoburguer`, `/admin` e `/master`;
  - lojas `neguinhodoacai` e `gordinhoburguer` carregaram corretamente via `database.js`;
  - validacao isolada com Vite SSR e localStorage fake confirmou adicionais vinculados a produto, adicional gratis com preco 0 e adicional pago somando no total;
  - carrinho foi validado com adicionar item, manter adicionais, alterar quantidade, recalcular total e remover item;
  - checkout foi validado por regras/dados para Pix, Cartao, Dinheiro, entrega e retirada;
  - regras por plano continuam preservadas: Start sem checkout salvo e com WhatsApp/manual; Pro com pedido salvo; Premium com pedido salvo e previa de WhatsApp automatico/automacoes;
  - pedidos criados por `storage.js` continuaram visiveis por `database.js`, confirmando compatibilidade do hook central;
  - `database.subscribeDatabase` recebeu criacao/alteracao de pedidos feitas por `storage.js`;
  - `/admin/pedidos` foi validado por `getOrdersByStore` e alteracao de status refletiu em `getOrderById`;
  - master continuou carregando lojas, planos e configuracoes;
  - nenhum bug causado pela troca de `usePediData.js` para `database.js` foi encontrado;
  - pendencia de copy publica foi corrigida na etapa seguinte;
  - o navegador interno do Codex nao estava disponivel nesta sessao, entao a validacao foi feita por HTTP local, Vite SSR e inspecao de codigo.
- Adaptado `src/hooks/usePediData.js` para consumir `src/services/database.js`:
  - `getDatabase` agora vem de `database.js`;
  - `subscribeDatabase` agora vem de `database.js`;
  - `database.js` expoe `subscribeDatabase` como wrapper temporario sobre `storage.js`;
  - formato retornado pelo hook foi mantido: `database`, `stores`, `orders` e `platform`;
  - nenhuma tela foi migrada diretamente nesta etapa;
  - Supabase real ainda nao foi conectado;
  - localStorage segue como fallback por baixo de `storage.js`.
- Criada a primeira camada de abstracao de dados:
  - arquivo: `src/services/database.js`;
  - atua como fachada/adapter temporario;
  - ainda usa `src/services/storage.js`, mocks e localStorage por baixo;
  - Supabase real ainda nao foi conectado;
  - nenhuma tela foi migrada para usar essa camada ainda;
  - `node --check src/services/database.js` passou;
  - `npm run build` passou com permissao elevada apos a falha conhecida do sandbox.
- Auditoria de migracao para Supabase realizada:
  - identificado que `src/services/storage.js` concentra carregamento, normalizacao e escrita do banco local;
  - identificado que `src/hooks/usePediData.js` e a principal entrada de leitura das telas;
  - identificado que `src/pages/MasterCreateStore.jsx` ainda usa `createEmptyStore` de `src/data/mockStores.js`;
  - identificado que master/admin/checkout gravam dados por `updateStore`, `mutateDatabase`, `updatePlatform`, `createOrder` e `updateOrder`;
  - criado `SUPABASE_MIGRATION_PLAN.md` com schema SQL inicial e estrategia segura de migracao;
  - nenhum codigo funcional foi alterado nesta auditoria.

- Corrigido import ausente de `formatCurrency` em `src/pages/AdminProducts.jsx`:
  - `import { formatCurrency } from "../utils/formatCurrency.js";`
- Corrigida comunicacao publica das formas de pagamento:
  - card publico "Formas ativas" removido de `src/pages/CheckoutPage.jsx`;
  - checkout publico exibe somente `Pix`, `Dinheiro` e `Cartao`;
  - labels publicos `Pix online`, `Pix na entrega` e `Cartao na entrega` deixaram de aparecer para o consumidor final;
  - mensagem manual de WhatsApp inclui `Forma de pagamento: Pix` quando Pix e escolhido;
  - se houver chave Pix configurada na loja, a mensagem pode incluir `Chave Pix`;
  - `storage.js` normaliza metodos antigos (`pixDelivery`, `cardDelivery`) e labels antigos de pedidos para os nomes publicos simples;
  - arquivos alterados nesta etapa: `src/pages/CheckoutPage.jsx`, `src/pages/StorePage.jsx`, `src/pages/AdminSettings.jsx`, `src/services/storage.js`, `src/data/mockStores.js`, `src/data/mockOrders.js`, `src/utils/whatsappMessage.js`.
- Atualizada regra comercial de pagamentos:
  - Start: pedido via WhatsApp e pagamento manual por Pix, Cartao ou Dinheiro;
  - Pro: pedido no painel, acompanhamento e pagamento automatico simulado por Pix e Cartao;
  - Premium: tudo do Pro mais WhatsApp automatico simulado, mensagens por status e automacoes;
  - pagina de acompanhamento separa `Pagamento` e `Status do pagamento`;
  - `Pagamento na entrega` foi removido como status publico e dados antigos sao normalizados para status amigavel;
  - arquivos alterados nesta etapa tambem incluem `src/utils/plans.js`, `src/utils/orderStatus.js` e `src/pages/OrderTrackingPage.jsx`.
- Auditoria final de termos antigos de pagamento realizada antes da troca de chat:
  - termos pesquisados: `Pix na entrega`, `Pagamento na entrega`, `Pix online`, `Cartao na entrega`, `pixDelivery`, `cardDelivery`, `paymentOnDelivery`, `pix_delivery`, `pix_on_delivery`, `card_delivery`, `payment_on_delivery`;
  - nao existem termos antigos visiveis ao cliente final nas telas publicas `/:slug`, `/:slug/checkout`, `/:slug/pedido/:orderId` ou componentes publicos de loja;
  - ocorrencias restantes em `src/services/storage.js` sao normalizacao/migracao de dados antigos e estao OK;
  - ocorrencias restantes em `src/pages/CheckoutPage.jsx` sao fallback interno de compatibilidade para `paymentMethods` antigos e exibem publicamente apenas `Pix`/`Cartao`;
  - ocorrencias restantes em Markdown sao documentacao/memoria explicando a remocao e estao OK;
  - nenhum BUG publico foi encontrado nesta auditoria.
- Estado atual real antes da troca de chat:
  - `formatCurrency` ja corrigido em `src/pages/AdminProducts.jsx`;
  - localStorage limpo ja testado;
  - rotas principais ja responderam 200;
  - precos oficiais mantidos com `,99`;
  - responsividade inicial revisada;
  - master testado manualmente e funcionando;
  - pagamento publico normalizado para `Pix`, `Cartao` e `Dinheiro`;
  - card "Formas ativas" removido do checkout publico;
  - adicionais configuraveis validados manualmente: grupo, opcao e vinculo com produto funcionando;
  - adicional gratis com preco 0 deve aparecer como `Gratis`;
  - adicional pago deve somar no total.
- `npm run build` passou apos a correcao do import de `formatCurrency`.
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
- Precos oficiais corrigidos/mantidos com gatilho em `,99`:
  - Implantacao: R$ 599,99;
  - Start: R$ 99,99/mes;
  - Pro: R$ 179,99/mes;
  - Premium: R$ 199,99/mes.
- Normalizacao/migracao em `storage.js` ajustada para corrigir valores antigos `179`/`199` para `179.99`/`199.99`.
- Corrigida estrutura responsiva da landing/hero para evitar sobreposicao entre hero e cards.
- Revisao de responsividade e visual concentrada em `src/styles/global.css`.
- Menus mobile da landing passaram a usar rolagem horizontal controlada.
- Sidebar do admin/master foi adaptada para mobile como barra superior com rolagem horizontal.
- Tabelas do admin/master mantem scroll horizontal controlado em telas menores.
- Modais passaram a usar limite de altura com `dvh`, scroll interno e padding menor no mobile.
- Botoes, textos, carrinho, cards e metricas foram ajustados para reduzir cortes e estouros em telas pequenas.
- Criada logica de lojas reais no mock/localStorage em vez de paginas fixas.
- Criacao/edicao/ativacao/desativacao de lojas pelo master.
- Loja inativa mostra aviso publico e nao aceita pedido.
- Slug alterado passa a controlar o acesso publico.
- Adicionais passaram a ser grupos cadastraveis por loja e vinculados a produtos.
- Planos Start/Pro/Premium passaram a controlar recursos.
- Landing passou a ler configuracoes do master.
- `vercel.json` foi adicionado para suportar rotas SPA no deploy.

Bugs/pendencias conhecidas:

- Pendencias visuais/mobile restantes do teste manual local:
  - controles de quantidade do carrinho mobile largos/pouco centralizados;
  - menu superior do admin mobile apertado e com itens espremidos;
  - editar produto no admin mobile nao rola ate o formulario;
  - editar grupo/adicional no admin mobile nao rola ate o formulario;
  - cards/chips de adicionais no mobile precisam de melhor espacamento e organizacao.
- Produtos inativos aparecem como "Indisponivel" na loja publica, nao somem. Isso atende uma das possibilidades pedidas anteriormente, mas deve ser revisado se a decisao final for esconder.
- Necessario testar visualmente desktop/mobile em navegador real.
- Necessario testar fluxo completo apos migrar dados antigos.
- `mockOrders.js` ainda tem pedidos com `addons`; a normalizacao converte para `selectedAdditionals`.
- Pix e WhatsApp sao simulados.
- Login e permissoes sao fake.

Build:

- Build anterior conhecido passou com `npm run build`.
- Build final desta rotina passou em 2026-07-08 com `npm run build`.
- Build apos correcao do import de `formatCurrency` passou com `npm run build`.
- Build apos a revisao responsiva de `src/styles/global.css` passou com `npm run build`.
- Build apos ajuste de comunicacao publica de pagamento passou com `npm run build`.
- Build apos ajuste da regra comercial de pagamentos por plano passou com `npm run build`.
- Build apos auditoria final de termos antigos de pagamento passou com `npm run build`.
- Build apos criacao de `SUPABASE_MIGRATION_PLAN.md` e atualizacao das memorias passou com `npm run build`.
- Build apos criacao de `src/services/database.js` passou com `npm run build`.
- Build apos adaptacao de `src/hooks/usePediData.js` para `database.js` passou com `npm run build`.
- Build apos teste pos-adaptacao de `usePediData.js` passou com `npm run build`.
- Build apos revisao de copy publica passou com `npm run build`.
- Build apos correcao do texto de adicionais no acompanhamento do pedido passou com `npm run build`.
- Observacao: a primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`; a repeticao com permissao elevada passou.

## Proximas etapas recomendadas

1. Corrigir ajustes visuais/mobile encontrados no teste manual antes de iniciar Supabase real.
2. Melhorar carrinho mobile.
3. Melhorar menu mobile do admin.
4. Adicionar scroll automatico ao editar produtos e adicionais no admin mobile.
5. Revisar cards/chips de adicionais no mobile.
6. Rodar `npm run build` e testar novamente no navegador local.
7. Depois desses ajustes, retomar preparacao/conexao Supabase.
