# PROJECT_CONTEXT - PediCampos

Atualizado em: 2026-07-08

Este arquivo e a memoria principal do projeto PediCampos. Ele registra o estado atual do codigo, as decisoes ja tomadas, o que esta implementado, o que esta parcial e o que ainda e pendente.

## Identidade do projeto

- Nome: PediCampos.
- Dominio registrado/planejado: pedicampos.com.br.
- Proposta principal: oferecer uma plataforma SaaS multi-lojas para negocios locais terem cardapio digital, loja publica por link, carrinho, checkout, pedidos online e painel administrativo proprio.
- Publico-alvo: acaiterias, hamburguerias, lanchonetes, restaurantes, confeitarias, lojas de delivery local e pequenos negocios que querem vender sem depender apenas de marketplaces.
- Tipo de sistema: SaaS multi-lojas em uma SPA React/Vite, com dados mockados persistidos em localStorage nesta primeira versao.
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
- Pix online futuramente real, atualmente simulado;
- WhatsApp automatico futuramente real, atualmente simulado;
- planos por funcionalidades;
- cada loja em um slug proprio no mesmo dominio.

## Estado atual do projeto

Implementado:

- Projeto React/Vite/JavaScript com SPA e roteador proprio simples.
- Landing page da PediCampos em `/`.
- Loja publica por slug em `/:slug`.
- Lojas demo reais no mock/localStorage: Neguinho do Acai e Gordinho Burguer.
- Carrinho por loja com persistencia em localStorage.
- Modal de produto com quantidade, observacao e adicionais configuraveis.
- Checkout em `/:slug/checkout`.
- Pix online simulado para plano Premium.
- Pedido salvo em localStorage para planos com checkout no site.
- Acompanhamento de pedido em `/:slug/pedido/:orderId`.
- Painel admin da loja.
- Painel master.
- Configuracoes da plataforma editaveis no master.
- Planos Start, Pro e Premium com recursos por plano.
- Adicionais configuraveis por loja, vinculados a produtos.
- Persistencia via localStorage.
- Dados mockados iniciais.
- Rewrites de SPA para Vercel em `vercel.json`.

Parcial ou simulado:

- Pix online e apenas simulado, sem Mercado Pago/Asaas/webhook.
- WhatsApp automatico e apenas simulado por mensagens geradas no painel.
- Login e fake/localStorage, sem autenticacao real.
- Upload de imagens nao existe; campos aceitam URL, iniciais ou assets locais.
- Banco de dados real ainda nao existe; tudo fica em localStorage.

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
- carrinho simples.

Recursos bloqueados:

- checkout com pedido salvo no painel;
- painel de pedidos;
- status avancado do pedido;
- adicionais configuraveis;
- Pix online;
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
- relatorios simples.

Recursos bloqueados:

- Pix online real/simulado;
- WhatsApp automatico real/simulado;
- cupons;
- relatorios avancados;
- automacoes premium.

### Premium

Preco atual no codigo: R$ 199,99/mes.

Recursos permitidos:

- tudo do Pro;
- Pix online simulado;
- QR Code Pix simulado;
- Pix copia e cola;
- confirmacao automatica simulada;
- WhatsApp automatico simulado;
- cupons;
- relatorios avancados;
- automacoes;
- recursos avancados.

Como o plano controla o sistema:

- `planHasFeature(plan, feature, platform)` verifica se o plano tem uma feature.
- `FEATURE_MIN_PLAN` define o plano minimo de algumas features.
- `/admin/pedidos` e `/admin/adicionais` usam `PlanGuard`.
- Checkout no site depende de `siteCheckout`.
- Pix online depende de `pixOnline`.
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
- `pixOnline` so aparece quando a loja tem o metodo ativo e o plano tem feature `pixOnline`.
- Loja inativa mostra aviso e nao aceita pedido.
- Loja fechada bloqueia finalizacao.

Comportamento por plano:

- Start: nao salva pedido no painel; monta mensagem e abre WhatsApp manualmente.
- Pro: salva pedido no painel e permite acompanhamento, mas sem Pix online.
- Premium: salva pedido, permite Pix online simulado e acompanhamento.

Pedidos:

- Salvos dentro de `pedicampos.database.v1.orders`.
- Numero/id e gerado com os ultimos 6 digitos de `Date.now()`.
- Campos principais: `id`, `number`, `storeId`, `storeSlug`, `storeName`, `customer`, `fulfillment`, `address`, `paymentMethod`, `paymentStatus`, `orderStatus`, `subtotal`, `deliveryFee`, `total`, `pixCode`, `items`.

## Pix simulado

Implementado no checkout:

- Aparece no checkout quando:
  - o plano tem feature `pixOnline`;
  - a loja tem `paymentMethods.pixOnline = true`;
  - o cliente escolhe Pix online.
- Exibe QR Code visual fake.
- Gera Pix copia e cola ficticio no formato `000201PEDICAMPOS-slug-valor-DEMO`.
- Botao "Copiar Pix" tenta copiar para clipboard.
- Botao "Simular pagamento aprovado" muda o estado local `pixApproved`.
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

- `src/main.jsx`: entrada React.
- `src/App.jsx`: roteamento principal e protecao fake de admin/master.
- `src/routes/router.jsx`: roteador simples com `Link`, `navigate`, `usePath`.
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

- Corrigida estrutura responsiva da landing/hero para evitar sobreposicao entre hero e cards.
- Criada logica de lojas reais no mock/localStorage em vez de paginas fixas.
- Criacao/edicao/ativacao/desativacao de lojas pelo master.
- Loja inativa mostra aviso publico e nao aceita pedido.
- Slug alterado passa a controlar o acesso publico.
- Adicionais passaram a ser grupos cadastraveis por loja e vinculados a produtos.
- Planos Start/Pro/Premium passaram a controlar recursos.
- Landing passou a ler configuracoes do master.
- `vercel.json` foi adicionado para suportar rotas SPA no deploy.

Bugs/pendencias conhecidas:

- `src/pages/AdminProducts.jsx` usa `formatCurrency(product.price)` mas, no estado atual lido, nao importa `formatCurrency`. Isso pode quebrar em runtime ao abrir/renderizar `/admin/produtos`. Nao foi corrigido aqui porque esta tarefa pediu somente documentacao.
- Produtos inativos aparecem como "Indisponivel" na loja publica, nao somem. Isso atende uma das possibilidades pedidas anteriormente, mas deve ser revisado se a decisao final for esconder.
- Necessario testar visualmente desktop/mobile em navegador real.
- Necessario testar fluxo completo apos limpar localStorage e apos migrar dados antigos.
- `mockOrders.js` ainda tem pedidos com `addons`; a normalizacao converte para `selectedAdditionals`.
- Pix e WhatsApp sao simulados.
- Login e permissoes sao fake.

Build:

- Build anterior conhecido passou com `npm run build`.
- Build final desta rotina passou em 2026-07-08 com `npm run build`.
- Observacao: a primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`; a repeticao com permissao elevada passou.

## Proximas etapas recomendadas

1. Rodar `npm run build` e registrar resultado.
2. Abrir fluxo completo no navegador:
   - landing;
   - loja demo;
   - produto com adicionais;
   - carrinho;
   - checkout;
   - pedido;
   - admin pedidos.
3. Corrigir pendencia de runtime em `AdminProducts.jsx`, se confirmada.
4. Testar responsividade desktop/mobile da landing, loja, carrinho e checkout.
5. Testar master:
   - criar loja;
   - editar slug;
   - mudar cor;
   - ativar/desativar;
   - mudar plano.
6. Testar admin:
   - editar produto/preco;
   - criar categoria;
   - criar adicional;
   - vincular adicional a produto;
   - atualizar status de pedido.
7. Revisar bloqueios por plano.
8. Manter precos comerciais finais com gatilho em `,99`.
9. Polir visual.
10. Preparar deploy Vercel.
11. Integrar Supabase futuramente.
12. Integrar Pix real futuramente.
13. Integrar WhatsApp real futuramente.
