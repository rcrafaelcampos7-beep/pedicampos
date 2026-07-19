# PROJECT_CONTEXT - PediCampos

Atualizado em: 2026-07-12

## Migracao incremental de lojas - 2026-07-12

- `database.js` passou a usar Supabase primeiro em `getStores`, `getStoreBySlug`, `getStoreById`, `createStore`, `updateStore` e `deactivateStore`.
- `storeFromSupabase` e `storeToSupabase` convertem entre snake_case relacional e o formato camelCase atual das telas.
- Somente colunas de `stores` sao enviadas. Campos de `store_settings`, pagamentos e colecoes aninhadas continuam locais.
- Client ausente ou erro Supabase aciona fallback para `storage.js`. Uma consulta remota bem-sucedida e vazia retorna `[]`, sem mocks.
- Leitura anonima foi validada e retornou zero lojas. Escrita anonima foi bloqueada pela RLS (`42501 permission denied for table stores`).
- Nenhum dado temporario foi criado remotamente.
- `usePediData` e as telas master ainda usam o snapshot/assinatura local sincrona; nao ha realtime Supabase nesta etapa. Assim, local e dominio ainda nao compartilham lojas criadas pelas telas ate o fluxo assincromo ser ligado a elas e a escrita ser autorizada.

## Supabase Auth do master - 2026-07-12

- Criada a camada `src/services/auth.js` com login por senha, logout, sessao, usuario, assinatura de eventos e validacao da role master em `store_users`.
- A rota `/master/*` exige sessao Supabase valida e uma linha ativa `role = 'master'` ligada a `auth.uid()`; a chave local antiga nao autoriza mais o master.
- `MasterLogin` nao contem senha fixa e preserva o layout, com erro generico e estado de carregamento.
- `002_master_auth.sql` restringe INSERT/UPDATE/DELETE de `stores` a master autenticado. Leitura publica de lojas ativas continua.
- O primeiro usuario deve ser criado manualmente em Supabase Authentication e depois autorizado em `store_users` pela migration com UUID/e-mail substituidos.
- Fallback fake existe somente com `import.meta.env.DEV` e `VITE_ENABLE_FAKE_MASTER_AUTH=true`; nunca funciona no build de producao.
- Admins de lojas continuam com login local e ficam pendentes.

## Telas master de lojas no Supabase - 2026-07-12

- O login master real esta funcionando e as telas `MasterCreateStore` e `MasterStores` passaram a chamar o adapter assincrono Supabase-first.
- Criacao aguarda `createStore`, bloqueia envio duplicado e navega somente apos a operacao terminar.
- Listagem usa `getStores`; edicao usa `updateStore`; desativacao usa `deactivateStore`; ativacao usa `updateStore` com `active: true`.
- A lista e recarregada depois de editar ou alterar status e possui estados de loading, erro e vazio.
- O fallback local de `database.js` continua preservado e nao ha segunda gravacao local quando o Supabase responde com sucesso.
- Lojas persistidas no Supabase passam a ser compartilhadas entre local e dominio. `subscribeDatabase` continua observando apenas localStorage; atualizacoes remotas aparecem ao recarregar a listagem, nao por Realtime.
- Categorias sao a proxima entidade planejada. Produtos, adicionais e pedidos continuam locais.

## Seed inicial dos planos Supabase - 2026-07-12

- A tabela `plans` foi confirmada vazia, bloqueando a FK `stores.plan_key` para `start`, `pro` e `premium`.
- Criada a migration incremental `supabase/migrations/003_seed_plans.sql`.
- A carga inicial insere Start por R$ 99,99, Pro por R$ 179,99 e Premium por R$ 199,99, todos ativos.
- `on conflict (key) do nothing` torna a migration idempotente e impede sobrescrever precos ou configuracoes existentes.
- Alteracoes comerciais futuras continuam destinadas ao painel master.
- Proximo passo: executar a migration no Supabase e depois testar criacao, edicao e desativacao de uma loja real.

## Loja publica por slug no Supabase - 2026-07-12

- `StorePage` agora busca a loja com `await getStoreBySlug(slug)` em estado assincrono proprio.
- A rota trata loading, erro inesperado, slug invalido, loja inexistente, loja inativa quando visivel e loja ativa sem produtos.
- Resultado remoto bem-sucedido sem linha nao mistura mocks; fallback local continua somente quando o adapter detecta indisponibilidade/erro Supabase.
- Lojas novas podem abrir com cardapio vazio enquanto categorias e produtos nao forem migrados, exibindo mensagem publica apropriada.
- Pela RLS atual, anon le somente lojas ativas. Uma loja remota inativa fica oculta e aparece como nao encontrada ao publico; a tela de indisponibilidade continua aplicavel quando a loja inativa e retornada por contexto autorizado ou fallback.
- Proxima etapa: categorias.

## Adapter Supabase de categorias - 2026-07-12

- `getCategoriesByStore`, `createCategory`, `updateCategory` e `deleteCategory` agora sao Supabase-first em `database.js`.
- Conversores explicitos preservam `storeId`, `name`, `active` e `order`, mapeando `store_id` e `sort_order`.
- Toda leitura e filtrada por `store_id`; writes dependem da policy `can_access_store` e nao permitem role anon.
- Nenhuma migration foi necessaria: schema, FK, indice e policies existentes ja atendem ao isolamento.
- `AdminCategories` foi inicialmente mantido local ate a conclusao do Auth dos usuarios de loja; agora ja usa o adapter assincrono.
- Fallback local permanece apenas quando o client esta ausente ou Supabase retorna erro; sucesso vazio retorna `[]` sem categorias locais.
- Teste anon confirmou leitura vazia e bloqueio de INSERT com `42501`, sem linha criada.
- Proxima etapa correta: Supabase Auth para usuarios das lojas e vinculacao em `store_users`; depois integrar `AdminCategories`. Produtos continuam pendentes.

## Supabase Auth dos usuarios de loja - 2026-07-12

- O login `/admin` agora usa `supabase.auth.signInWithPassword` e nao possui senha fixa nem seletor livre de loja.
- A autorizacao exige vinculo ativo em `store_users`, `store_id` preenchido e role `store_admin` ou `store_staff`.
- A rota admin resolve a loja pelo vinculo do `auth.uid()`; chaves antigas de localStorage nao concedem acesso nem permitem trocar para outra loja.
- Refresh restaura a sessao pelo client Supabase e revalida o vinculo; logout usa `supabase.auth.signOut()`.
- Master continua autorizado separadamente pela role `master`; uma role master nao e aceita como usuario de loja.
- Nenhuma migration foi necessaria porque schema, `can_access_store` e policies atuais ja atendem ao isolamento.
- Multiplos vinculos ja sao retornados pela camada; nesta versao o primeiro por data de criacao e usado, sem tela de selecao.
- Nao foi mantido fallback fake para admin. Categorias, produtos, adicionais e pedidos ja usam adapters Supabase-first.

## AdminCategories no Supabase - 2026-07-12

- `AdminCategories` agora carrega, cria, edita, exclui e reordena categorias pelas funcoes assincronas de `database.js`.
- O `store.id` vem exclusivamente da loja resolvida pela sessao Auth e pelo vinculo ativo em `store_users` no `AdminRouter`.
- A tela nao aceita `store_id` de formulario, URL ou localStorage e nao faz gravacao paralela em `storage.js`.
- Foram adicionados loading, lista vazia, erros amigaveis e bloqueio durante operacoes.
- A lista e recarregada depois de cada mutation. O fallback local do adapter permanece.
- O isolamento definitivo continua em `can_access_store(store_id)`; o teste CRUD visual/Table Editor deve ser feito com o usuario real vinculado.
- Proxima etapa: produtos. Adicionais e pedidos continuam pendentes.

## Produtos no Supabase - 2026-07-12

- `getProductsByStore`, `createProduct`, `updateProduct` e `deleteProduct` agora sao Supabase-first com conversores explicitos.
- `AdminProducts` carrega produtos e categorias remotas da loja autenticada e executa CRUD/status assincrono.
- O formato preserva `id`, `storeId`, `categoryId`, nome, descricao, preco, URL de imagem, status e timestamps.
- Criada `004_product_category_store.sql` para impedir que `category_id` aponte para categoria de outra loja.
- O `store.id` vem somente da sessao/vinculo autorizado; RLS continua protegendo writes por loja.
- Upload real nao existe: `image_url` recebe somente a URL/string atual.
- Adicionais nao sao gravados nem vinculados nesta etapa; pedidos tambem continuam pendentes.
- A migration 004 deve ser executada antes do teste CRUD cruzado. Proxima etapa: adicionais.

## Adicionais no Supabase - 2026-07-12

- Grupos, opcoes e vinculos com produtos agora usam as tres tabelas relacionais do Supabase.
- `AdminAdditionals` carrega grupos e produtos remotos e executa criacao, edicao, status e exclusao assincronos.
- Criada `005_additionals_integrity.sql` com validacoes de mesma loja e RPC atomica `save_additional_group` com `security invoker`.
- A RPC substitui opcoes/vinculos dentro de uma transacao, evita estado parcial e elimina vinculos duplicados.
- Preco zero continua Gratis; precos positivos continuam numericos e somaveis.
- `store.id` vem somente da sessao autorizada e RLS permanece ativo. INSERT anon foi bloqueado com `42501`.
- Fallback local permanece; resposta remota vazia nao mistura mocks.
- Pedidos continuam locais. Proxima etapa correta: configuracoes da loja e formas de pagamento, dependencias do checkout antes de pedidos.

## Configuracoes da loja e pagamentos - 2026-07-12

- `store_settings` e `payment_methods` agora possuem adapters Supabase-first e estao integrados ao `AdminSettings`.
- `stores` mantem identidade, slug, visual, WhatsApp e aberto/fechado; `store_settings` guarda operacao/entrega/Pix/instrucoes; `payment_methods` guarda Pix, dinheiro e cartao ativos.
- Criada migration 006 com RPC restrita para o lojista atualizar apenas o perfil publico. Plano e `active` continuam exclusivos do master.
- AdminSettings possui loading, erro, sucesso e bloqueio de envio duplicado.
- StorePage e CheckoutPage carregam settings/metodos remotos e usam defaults controlados quando nao ha linha.
- Checkout respeita entrega/retirada, taxa, pedido minimo, chave Pix, instrucoes e metodos ativos; pedidos agora sao remotos, mas pagamentos continuam sem gateway real.
- INSERT anon em ambas as tabelas foi bloqueado com `42501`; fallback local permanece.
- Proxima etapa: pedidos, depois de validar manualmente estas configuracoes.

## Pedidos no Supabase - 2026-07-12

- Checkout, acompanhamento publico e AdminOrders agora usam o adapter Supabase-first.
- Criada migration 007 com `public_token` UUID, desconto, indice e RPC atomica de criacao.
- A RPC recebe IDs/quantidades, valida loja, atendimento, pagamento, produtos e adicionais, e recalcula subtotal/taxa/total no banco.
- Nomes/precos de produtos e adicionais sao salvos como snapshots nas tabelas de itens.
- Acompanhamento usa token UUID + slug por RPC dedicada; nao existe SELECT publico geral de pedidos.
- Admin lista e altera status somente sob `can_access_store(store_id)`; master continua com acesso total.
- Start continua enviando ao WhatsApp; Pro/Premium criam pedido conforme fluxo atual, sem gateway real.
- Pix/cartao e WhatsApp reais continuam pendentes. Fallback local permanece.

## Correcao do catalogo publico remoto - 2026-07-12

- Bug manual: a loja abria pelo slug, mas mostrava cardapio vazio apesar de haver produtos no Supabase.
- Causa: `storeFromSupabase` entrega colecoes vazias e StorePage hidratava somente settings/metodos.
- StorePage agora carrega em paralelo categorias, produtos e grupos/opcoes/vinculos por `store_id`.
- Somente registros ativos sao exibidos; links sao filtrados para produtos ativos. Produto ativo sem categoria continua visivel.
- Leitura anon real de `lojateste` confirmou catalogo completo sem erro de RLS.
- Nenhuma migration foi necessaria. Pedidos continuam aguardando validacao manual apos esta correcao.

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
- Projeto Supabase real ja foi criado com nome `pedicampos`.
- Regiao escolhida no Supabase: Oeste dos EUA (Oregon) / `us-west-2`.
- A URL do projeto aparece no painel como `https://tkoo...supabase.co`.
- `supabase/schema.sql` foi executado no SQL Editor do Supabase.
- O retorno `Sucesso. Nenhuma linha retornada.` foi recebido e e esperado para criacao de tabelas, funcoes, triggers e policies.
- Tabelas conferidas no Table Editor; RLS, policies, indices e triggers de `updated_at` ainda devem ser validados item por item se nao tiverem sido conferidos.
- Tudo que for criado no master/admin deve futuramente refletir online no dominio e em outros dispositivos.
- `localStorage` nao sera removido agora; ele sera mantido temporariamente como fallback durante a migracao.
- `src/data/mockStores.js` e `src/data/mockOrders.js` nao serao removidos agora; continuam como seed/fallback enquanto a migracao nao estiver validada.
- A primeira camada de acesso a dados foi criada em `src/services/database.js`.
- `src/services/database.js` funciona como fachada/adapter temporario e ainda usa `src/services/storage.js` por baixo.
- Depois, essa camada deve passar a falar com Supabase usando variaveis de ambiente.
- Nao deve haver SDK do Supabase espalhado diretamente pelas telas.
- O plano tecnico completo foi criado em `SUPABASE_MIGRATION_PLAN.md`.
- A area publica/comercial deve parar de usar linguagem de simulacao antes do uso real. Pix real, WhatsApp Cloud API e Supabase ainda precisam continuar claros na documentacao tecnica como pendentes/em migracao.
- `@supabase/supabase-js` foi instalado.
- `src/services/supabaseClient.js` foi criado como client defensivo.
- `src/services/supabaseClient.js` le `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Se as variaveis Supabase nao existirem, o client exporta `null` e nao quebra o build.
- `.env.example` foi criado com `VITE_SUPABASE_URL=` e `VITE_SUPABASE_ANON_KEY=`.
- `.env.local` deve guardar as chaves reais e esta protegido no `.gitignore`.
- Supabase ainda nao esta migrando dados; `storage.js/localStorage` continuam sendo o estado real atual do app.
- A senha do banco nao deve ir para o React. A `anon public key` pode ser usada no frontend junto com RLS.

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
- SDK `@supabase/supabase-js` instalado.
- `src/services/supabaseClient.js` criado, mas ainda sem uso em `database.js`.
- `.env.example` criado para documentar as variaveis publicas do Vite.
- `.env.local` protegido no `.gitignore` para guardar chaves reais fora do Git.
- Persistencia via localStorage.
- Dados mockados iniciais.
- Rewrites de SPA para Vercel em `vercel.json`.

Parcial ou simulado:

- Pagamento online por Pix/Cartao e apenas simulado, sem Mercado Pago/Asaas/webhook/gateway real.
- WhatsApp automatico e apenas simulado por mensagens geradas no painel.
- Login e fake/localStorage, sem autenticacao real.
- Upload de imagens nao existe; campos aceitam URL, iniciais ou assets locais.
- Banco Supabase real ja existe e recebeu o schema inicial. O client React/Supabase ja foi preparado, mas ainda nao migra dados; o app continua lendo e salvando em localStorage por baixo de `database.js/storage.js`.

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
- `supabase/schema.sql`: SQL inicial real para criar as tabelas no Supabase, com indices, triggers, RLS e policies temporarias.
- `supabase/README.md`: instrucoes para executar o SQL no painel do Supabase e conferir as tabelas.
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

- Estado atual do Supabase registrado:
  - projeto Supabase `pedicampos` criado;
  - regiao: Oeste dos EUA (Oregon) / `us-west-2`;
  - URL visivel no painel como `https://tkoo...supabase.co`;
  - `supabase/schema.sql` executado no SQL Editor;
  - retorno recebido: `Sucesso. Nenhuma linha retornada.`;
  - esse retorno e correto para um SQL de criacao de tabelas, funcoes, triggers, RLS e policies;
  - proximo passo e conferir no Table Editor se as tabelas esperadas foram criadas.
- Criado SQL inicial real para Supabase:
  - arquivos criados: `supabase/schema.sql` e `supabase/README.md`;
  - o schema cria 15 tabelas: `platform_settings`, `plans`, `stores`, `store_users`, `store_settings`, `categories`, `products`, `additional_groups`, `additional_options`, `additional_group_products`, `customers`, `orders`, `order_items`, `order_item_additionals` e `payment_methods`;
  - RLS e ativado nas 15 tabelas;
  - policies temporarias permitem leitura publica apenas de catalogo ativo e criacao publica de pedidos;
  - dados de clientes e pedidos nao ficam publicamente legiveis por padrao;
  - React ainda nao foi conectado ao Supabase e `localStorage` continua como fallback atual.
- Revisados cards e chips de adicionais no admin mobile:
  - arquivo alterado: `src/styles/global.css`;
  - os cards de grupos ganharam melhor espacamento no mobile;
  - os chips/opcoes passaram a usar grade responsiva, com quebra de linha mais legivel e tamanho mais consistente;
  - comportamento de adicionais, criacao/edicao/exclusao, vinculos, calculo, precos, planos, checkout, pedidos e Supabase nao foram alterados;
  - desktop foi preservado porque o ajuste ficou restrito ao breakpoint mobile;
  - com esta correcao, o ciclo de ajustes visuais/mobile encontrado no teste manual foi concluido no codigo;
  - `npm run build` passou apos a correcao.
- Adicionado scroll automatico ao editar grupos/adicionais no admin:
  - arquivo alterado: `src/pages/AdminAdditionals.jsx`;
  - ao tocar em `Editar`, a tela rola suavemente ate o formulario do grupo com `scrollIntoView`;
  - comportamento de criacao/edicao, vinculos de produtos e opcoes foram preservados;
  - desktop, regras de adicionais, calculo, precos, planos, checkout, pedidos e Supabase nao foram alterados;
  - `npm run build` passou apos a correcao.
- Adicionado scroll automatico ao editar produtos no admin:
  - arquivo alterado: `src/pages/AdminProducts.jsx`;
  - ao tocar em `Editar`, a tela rola suavemente ate o formulario do produto com `scrollIntoView`;
  - comportamento de criacao/edicao de produtos foi preservado;
  - desktop, regras de produto, calculo, precos, planos, checkout, pedidos e Supabase nao foram alterados;
  - `npm run build` passou apos a correcao.
- Ajustado o menu superior do admin no mobile:
  - arquivos alterados: `src/components/admin/AdminLayout.jsx` e `src/styles/global.css`;
  - a navegacao mobile do admin foi mantida como barra horizontal rolavel, agora com trilho visual, espacamento melhor e links em formato de pilula;
  - desktop, rotas, login, permissoes, carrinho, checkout, planos, precos, pagamentos e Supabase foram preservados;
  - o master nao foi alterado; o ajuste foi escopado com a classe `admin-shell`;
  - `npm run build` passou apos a correcao.
- Ajustado o layout mobile dos controles de quantidade no carrinho:
  - arquivo alterado: `src/styles/global.css`;
  - no mobile, os controles ficam mais compactos em linha, no formato `[-] [quantidade] [+]`;
  - calculo do carrinho, checkout, planos, precos, pagamentos e Supabase nao foram alterados;
  - desktop foi preservado porque o ajuste ficou restrito ao breakpoint mobile;
  - `npm run build` passou apos a correcao.
- Corrigido o texto repetido de adicionais no acompanhamento do pedido:
  - arquivo alterado: `src/pages/OrderTrackingPage.jsx`;
  - os adicionais agora aparecem com o prefixo unico `Adicionais:` seguido das opcoes em linha, por exemplo `Adicionais: Bacon extra + R$ 5,00, Cheddar + R$ 4,00`;
  - nenhuma regra comercial, preco, plano, logica de pagamento ou Supabase foi alterado;
  - `npm run build` passou apos a correcao.
- Teste visual/manual local realizado em `http://127.0.0.1:5174` antes da troca de chat:
  - registro historico do teste manual anterior;
  - as pendencias encontradas abaixo foram corrigidas nas etapas seguintes;
  - acompanhamento do pedido em desktop tem texto de adicionais repetido/mal formatado, por exemplo `Adicionais: Bacon extra + R$ 5,00, Adicionais: Cheddar + R$ 4,00`;
  - carrinho mobile tem controles de quantidade muito largos e pouco centralizados;
  - menu superior do admin no mobile fica apertado, com itens cortados/espremidos;
  - em `AdminProducts`, ao tocar em Editar no mobile, a tela nao rola automaticamente ate o formulario;
  - em `AdminAdditionals`, ao tocar em Editar no mobile, a tela nao rola automaticamente ate o formulario;
  - em `AdminAdditionals` mobile, cards e chips/opcoes funcionam, mas ficam visualmente carregados;
  - arquivos provaveis: `src/pages/OrderTrackingPage.jsx`, `src/components/store/CartDrawer.jsx`, `src/components/admin/AdminLayout.jsx`, `src/pages/AdminProducts.jsx`, `src/pages/AdminAdditionals.jsx` e `src/styles/global.css`;
  - ordem que foi seguida nas correcoes: corrigir texto repetido de adicionais no acompanhamento; melhorar carrinho mobile; melhorar menu mobile do admin; adicionar scroll automatico ao editar produtos; adicionar scroll automatico ao editar adicionais; revisar cards/chips de adicionais no mobile; rodar `npm run build`; testar novamente no navegador local.
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
  - proxima etapa apos o teste manual: configurar `.env.local` e testar conexao basica Supabase sem migrar dados.
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

- Pendencias visuais/mobile registradas no teste manual local foram corrigidas no codigo.
- Proxima validacao necessaria: subir o servidor local e testar visualmente de novo no navegador real.
- Observacao do Rafael: o layout do admin mobile ainda nao ficou exatamente como desejado, mas sera redesenhado futuramente; por enquanto a prioridade volta para Supabase.
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
- Build apos ajuste mobile dos controles de quantidade do carrinho passou com `npm run build`.
- Build apos ajuste do menu superior do admin mobile passou com `npm run build`.
- Build apos scroll automatico ao editar produtos no admin passou com `npm run build`.
- Build apos scroll automatico ao editar grupos/adicionais no admin passou com `npm run build`.
- Build apos revisao dos cards/chips de adicionais no admin mobile passou com `npm run build`.
- Build apos criacao de `supabase/schema.sql` e `supabase/README.md` passou com `npm run build`.
- Build apos atualizacao das memorias com o estado real do Supabase passou em 2026-07-11 com `npm run build`.
- Observacao: a primeira tentativa dentro do sandbox falhou por acesso negado ao resolver `vite.config.js`; a repeticao com permissao elevada passou.

## Proximas etapas recomendadas

### Correcao da listagem de pedidos - 2026-07-12

- `getOrdersByStore` deixou de depender de um unico select relacional aninhado: pedidos, clientes, itens e adicionais sao carregados por consultas isoladas, sempre filtradas pelo `store_id` autorizado.
- Erros de RLS, RPC, schema, FK e validacao nao acionam mais fallback local nos fluxos de pedidos. Somente ausencia do client ou falha real de rede usa `storage.js`.
- AdminOrders mostra erro de carregamento sem apresentar simultaneamente o estado vazio.
- As policies da migration 007 continuam inalteradas: leitura administrativa exige `can_access_store(store_id)`; nao foi aberto SELECT anonimo geral.
- A existencia e o `store_id` do pedido historico precisam ser conferidos no Table Editor, pois uma sessao anonima nao pode auditar pedidos por design.

### Correcao da RPC publica de pedidos - 2026-07-12

- Reproducao real da `create_public_order` retornou `42501 permission denied for table customers`, com hint solicitando SELECT para anon.
- A causa era `SECURITY INVOKER`: o `INSERT ... RETURNING id` precisava de privilegio de leitura, que corretamente nao existe para clientes anonimos.
- Migration 008 altera somente a RPC validada para `SECURITY DEFINER`, fixa `search_path`, reafirma grants restritos de EXECUTE e nao concede SELECT anonimo nas tabelas.
- Erros completos da RPC sao registrados somente em desenvolvimento; a mensagem publica continua amigavel e erros de RPC nao usam fallback local.
- O teste real chegou ate a gravacao com loja, produto, opcoes gratis/paga, vinculos, entrega, Pix, taxa e minimo validos; nenhuma linha temporaria foi criada porque a transacao falhou atomicamente.

### Auditoria pos-migration 008 - 2026-07-12

- A chamada anonima direta com a assinatura frontend criou com sucesso o pedido temporario `80EE5827`, provando que a 008 esta efetiva no endpoint testado.
- O acompanhamento retornou uma linha, um item, duas opcoes e total 35 para a loja `129ee8d4-e7ae-4aad-9d64-2e7489efe8b1`.
- A falha ainda vista no navegador nao e reproduzida pelo mesmo projeto/payload de referencia; deve ser diagnosticada pelo novo erro completo e resumo seguro do payload no console de desenvolvimento.
- Criado SQL read-only em `supabase/diagnostics/create_public_order_audit.sql` para contar overloads e conferir assinatura, `prosecdef`, owner, `search_path`, definicao e grants.
- Nao foi criada migration 009 sem evidencia de divergencia da funcao.

### Correcao do store_id no checkout - 2026-07-12

- O UUID antigo nao existia no codigo; vinha de uma loja persistida em `storage.js/localStorage` devolvida pelo fallback de `getStoreBySlug` para o mesmo slug.
- Checkout usa resolucao estrita Supabase pelo slug ao carregar e repete a resolucao imediatamente antes de `createOrder`.
- O `p_store_id` passa a ser exclusivamente o `id` dessa segunda resolucao; divergencia com a tela ou carrinho limpa os itens e bloqueia a RPC.
- Carrinhos agora persistem envelope com `storeId`; arrays legados continuam legiveis e sao normalizados. Produto/opcao continuam revalidados no banco pela RPC.
- Nenhuma RPC, migration, policy ou regra visual foi alterada.

### Persistencia de carrinho remoto - 2026-07-12

- StorePage tambem resolve o slug sem fallback local antes de inicializar `useCart(store.id)`.
- Primeiro item novo grava envelope `{ storeId, items }` sob a chave da loja remota; cada item tambem recebe o mesmo `storeId`.
- `clearCart` redefine o estado vazio com o ID remoto atual. Carrinho divergente e removido e normalizado antes de novo uso.
- Diagnosticos DEV mostram ID ao adicionar, persistir e ler no checkout. Validacao visual ficou pendente porque o navegador integrado nao estava disponivel.

### Fonte unica Supabase para lojas - 2026-07-12

- Foi confirmada duplicidade historica possivel entre `pedicampos.database.v1`/mocks e lojas remotas com o mesmo slug e UUIDs diferentes.
- Quando o client esta configurado, `database.getDatabase()` e `usePediData` nao publicam mais lojas locais; o hook hidrata `stores` por `getStores` remoto.
- `getStores`, `getStoreBySlug` e `getStoreById` so usam fallback local em falha classificada como conectividade. Resposta remota vazia/null permanece vazia/null; RLS/schema nao sao mascarados.
- Admin Auth resolve o `store_users.store_id` com `allowLocalFallback:false`.
- A migracao local versionada `pedicampos.localMigration.supabaseStoresV1` remove apenas lojas locais cujo slug remoto existe com outro ID e somente os carrinhos desses IDs legados.
- Lojas/carrinhos exclusivamente locais sao preservados para fallback quando nao colidem.

### Correcao do ID de store_settings - 2026-07-12

- Causa final do UUID incorreto: `storeSettingsFromSupabase` retornava `id` da tabela filha e o spread posterior sobrescrevia `store.id`.
- O identificador foi renomeado para `settingsId`; `storeId` continua representando a FK.
- StorePage, CheckoutPage e AdminSettings reafirmam explicitamente o ID raiz depois dos merges.
- Teste remoto criou o pedido temporario `BB6F8698` com store ID `129ee8d4-e7ae-4aad-9d64-2e7489efe8b1`; tracking retornou o mesmo tenant.

### Dashboard administrativo remoto - 2026-07-13

- AdminDashboard deixou de calcular metricas com `usePediData().orders`/localStorage.
- Ao abrir, carrega em paralelo `getOrdersByStore(store.id)` e `getProductsByStore(store.id)`.
- Pedidos de hoje, faturamento, em preparo, produtos ativos, ticket medio e ultimos pedidos usam os resultados remotos.
- AdminDashboard e AdminOrders possuem botao Atualizar; AdminOrders tambem recarrega ao montar e depois de alterar status.
- Realtime continua pendente e nao e necessario nesta etapa: navegar, recarregar ou atualizar executa nova consulta.

### Timeline por tipo de pedido - 2026-07-13

- O campo real e `order.fulfillment`, com valores `delivery` e `pickup`.
- Entrega usa “Saiu para entrega”; retirada usa “Pronto para retirada” na timeline, badges, filtros e acoes do admin.
- Funcoes compartilhadas em `orderStatus.js` fornecem timeline, acoes e normalizacao conforme fulfillment.
- Pedidos antigos pickup com `out_for_delivery` ou “Saiu para entrega” sao exibidos como “Pronto para retirada”, sem alterar o banco.

1. Conferir no Table Editor se as 15 tabelas do schema foram criadas.
2. Conferir RLS, policies, indices e triggers de `updated_at`.
3. Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` reais.
4. Nao usar senha do banco no React.
5. Testar conexao basica Supabase com `src/services/supabaseClient.js`.
6. Manter `database.js` com `storage.js/localStorage` como fallback.
7. Depois migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.

### Auditoria de producao - Sprint 1 - 2026-07-13

- Relatorio completo criado em `AUDIT_PEDICAMPOS_SPRINT1.md`.
- Corrigido o fallback amplo: entidades migradas so usam storage quando o client nao existe ou ha falha real de transporte; RLS, FK, schema e validacao agora chegam a UI.
- MasterPlans passou a atualizar `stores.plan_key` pelo adapter Supabase-first, com bloqueio de envio duplicado e feedback.
- Bloqueador critico documentado: policies base ainda permitem INSERT anonimo direto em tabelas de pedidos e podem contornar `create_public_order`.
- Painel master global, configuracao comercial/entitlements, paginacao, antiabuso e testes automatizados permanecem pendentes antes de producao.
- Build, `node --check` e `git diff --check` passaram; o build confirmou chunk JS de 537,52 kB e tres PNGs entre 1,57 MB e 2,38 MB.

### Bloqueio da escrita anonima direta - 2026-07-13

- O schema concedia INSERT a `anon, authenticated` e mantinha quatro policies publicas nas tabelas de pedidos.
- Criada `009_lock_direct_order_writes.sql`: `PUBLIC`/`anon` ficam sem privilegios diretos nas quatro tabelas; as policies publicas sao removidas.
- `authenticated` preserva CRUD, sempre limitado pelas policies `can_access_store(store_id)`; master continua abrangido por essa funcao.
- `create_public_order` e `get_public_order` mantem owner postgres, SECURITY DEFINER, `search_path=public` e EXECUTE somente para anon/authenticated.
- Aplicacao e testes remotos permanecem manuais; o diagnostico read-only 009 deve ser executado depois da migration.
- Validacao estrutural local, build, checks JS e diff check passaram; testes A-I continuam pendentes ate a aplicacao remota.

### Validacao server-side de adicionais - 2026-07-13

- Criada migration 010 que substitui a identidade exata de `create_public_order` sem alterar o payload do frontend.
- Cada item valida opcoes distintas, grupo informado correto, tenant, atividade, vinculo produto/grupo, required/min/max e selecao unica antes de qualquer escrita.
- Grupos inativos ou nao vinculados nao sao exigidos; opcoes deles nao podem ser enviadas. Quantidade do produto escala preco, nao a contagem selecionada.
- Erros adulterados retornam SQLSTATE `23514`; a transacao continua atomica.
- Criado teste A-J com fixtures efemeras e ROLLBACK. Execucao remota da migration/teste permanece manual.
- Build, checks JS, diff check e assercoes estruturais da cobertura A-J passaram.

### Idempotencia e limites de pedidos - 2026-07-13

- Criada migration 011: `orders.idempotency_key uuid`, indice unico por `(store_id, idempotency_key)` e nova assinatura publica com oito parametros.
- A implementacao validada da 010 vira rotina privada sem EXECUTE anon/auth; o wrapper publico aplica limites, lock transacional por loja/chave, consulta retry e delega a escrita atomica.
- Limites: 50 itens, quantidade 1-100, 30 opcoes/item, nota do item 500 chars, nota geral 1000, nome 120, telefone 32, endereco 8192 bytes e payload total 262144 bytes.
- Checkout gera UUID no inicio do submit e guarda somente `{fingerprint, idempotencyKey}` em sessionStorage; retry/reload do mesmo carrinho reutiliza, mudanca relevante gera nova, sucesso remove.
- Rate limit por IP/usuario permanece para Edge/Vercel/gateway. Migration, diagnostico e teste A-K ainda precisam ser executados remotamente.

### Painel Master remoto - 2026-07-14

- `MasterDashboard` e `MasterOrders` deixaram de consumir pedidos do `usePediData`/localStorage.
- `MasterStores` deixou de calcular pedidos, faturamento e planos com snapshots locais.
- `database.js` expoe consultas globais estritas para lojas, pedidos e planos, alem das metricas do dashboard; erros remotos nunca viram dados locais.
- RLS continua sendo a fronteira: `can_access_store` abrange todas as lojas somente quando `is_master()` e verdadeiro.
- Dashboard calcula pedidos/faturamento do dia no fuso do navegador, pedidos em andamento e ultimos pedidos. Realtime e paginacao continuam pendentes.
- Build, sintaxe JS e diff check passaram; conferencia dos valores no projeto remoto permanece manual.

### Entitlements reais por plano - 2026-07-14

- Criada migration 012 com `plans.feature_flags` como fonte persistida unica para recursos Start, Pro e Premium.
- Start permanece ativo e recebe somente `whatsapp_orders`; Pro recebe pedidos salvos, tracking, pagamento online, confirmacao automatica e relatorios simples; Premium recebe todos os recursos preparados.
- `store_has_feature` e `get_store_entitlements` centralizam decisoes SQL e leitura React. A troca de `stores.plan_key` muda os recursos automaticamente.
- Criacao de pedido salvo, tracking publico, leitura/escrita administrativa de snapshots e ativacao de pagamento online agora possuem verificacao server-side.
- Nenhum preco, `plans.active` ou atribuicao existente foi alterado. MasterPlans usa plans/stores remotos para as decisoes de recurso.
- Futuro comercial recomendado: `plans.available_for_new_stores` separado do estado tecnico e tabela `store_commercial_terms` para preco contratado, desconto e taxa de implantacao por loja.

### Sprint 2.1 - upload real de imagens - 2026-07-14

- Criada migration 013 para os buckets publicos `store-assets` e `product-images`; escrita/exclusao permanecem authenticated e isoladas por `store_id` no path.
- Paths: `{storeId}/logo/{uuid}`, `{storeId}/banner/{uuid}` e `{storeId}/{productId}/{uuid}`.
- Limites duplicados no cliente e bucket: 5 MB; apenas JPEG, PNG e WEBP.
- `storageImages.js` centraliza validacao, upload, URL publica, parsing e exclusao segura.
- AdminSettings aceita upload e URL manual para logo/banner; AdminProducts aceita upload e URL manual para produto.
- Produto novo e criado antes do upload para usar o UUID real. URLs externas antigas continuam validas e nunca sao excluidas pelo servico.
- Aplicacao remota da migration, auditoria de policies e matriz Loja A/Loja B permanecem manuais.

### Logo, banner e iniciais - 2026-07-14

- Corrigido o cabeçalho público que renderizava `store.logo` como texto; URLs de logo agora são imagens e falhas exibem iniciais.
- Logo (`stores.logo`), banner (`stores.banner_url`) e iniciais (`store_settings.extra.fallbackInitials`) têm responsabilidades separadas, sem migration nova.
- AdminSettings mantém URL externa/Storage e upload por galeria para logo e banner, com preview, arquivo selecionado, validação e estado de envio.
- Valores legados de logo que eram apenas iniciais são migrados no formulário para o fallback, sem serem tratados como URL.
- Testes reais de upload e renderização em desktop/mobile permanecem manuais.

### Recorte de imagens antes do upload - 2026-07-14

- Adicionado `react-easy-crop` como editor reutilizável para logo, banner e produto, com arrastar, zoom por slider/pinça, cancelamento e confirmação.
- Saídas padronizadas: logo 1:1 em 512x512, banner 16:9 em 1600x900 e produto 1:1 em 800x800.
- O navegador gera um novo File via canvas; JPEG/WEBP usam qualidade 0,88, PNG preserva transparência e todos os formatos continuam limitados a 5 MB.
- O arquivo original nunca é enviado depois da confirmação. Cancelar mantém imagem/formulário anteriores e object URLs são liberadas.
- URL manual e imagens existentes continuam inalteradas. Testes autenticados e por toque permanecem manuais.

### Confirmação de persistência da identidade visual - 2026-07-14

- Auditoria remota confirmou que a coluna real da logo é `stores.logo`; `stores.logo_url` não existe. Banner permanece em `stores.banner_url`.
- `AdminSettings` envia as URLs somente após os uploads e registra em DEV as URLs, payload e retorno sem marcar sucesso antecipadamente.
- `updateStorePublicProfile` valida logo/banner retornados pela RPC e consulta novamente quando necessário; divergência gera `STORE_IMAGES_NOT_PERSISTED`.
- Falha ou ausência de confirmação remove os uploads novos por compensação e não executa a exclusão tardia das imagens anteriores.
- RPC/migration 006 já continha `p_logo` e `p_banner_url`; nenhuma migration nova foi necessária. Teste autenticado de escrita permanece manual.

### Sprint 2.2 - paginação das listagens - 2026-07-15

- AdminOrders, AdminProducts, AdminCategories, AdminAdditionals, MasterOrders, MasterStores e MasterPlans usam paginação remota de 20 registros.
- O contrato comum retorna `data`, `total`, `page`, `pageSize` e `totalPages`; consultas primárias usam `count: "exact"`, ordenação e `.range()`.
- Filtros de pedidos agora são aplicados antes do count/range no Supabase. Alterações, exclusões e Atualizar preservam a página quando possível.
- MasterPlans deixou de usar `usePediData`; planos, lojas e preço de implantação são remotos. As telas Master paginadas não possuem fallback local.
- Listas auxiliares de categorias, produtos e lojas usadas em seletores também navegam por páginas, evitando carregar todos os registros.
- Helpers legados sem paginação permanecem para fluxos fora da Sprint, como catálogo público e dashboards; não são usados pelas sete listagens.
- Métricas de MasterStores são calculadas somente para as lojas da página atual, em lotes remotos com range.
- Nenhuma migration ou alteração de banco foi necessária. Testes manuais com mais de 20 registros permanecem pendentes.
- Smoke test remoto anônimo confirmou range/count exact em stores, plans, products, categories e additional_groups; testes autenticados e páginas acima de 1 dependem de massa manual.

### Loja-demo Brasa House Burger - 2026-07-15

- Criado um seed manual, fora da sequência de migrations, para transformar exclusivamente o slug `lojateste` em uma demonstração comercial da Brasa House Burger.
- O script resolve o `store_id` pelo slug, preserva logo/banner, plano, Auth, `store_users` e todas as demais lojas.
- Massa máxima controlada: 6 categorias, 29 produtos, 5 grupos, 20 opções, 56 vínculos, 22 clientes fictícios, 22 pedidos, 22 itens e 33 snapshots de adicionais.
- UUIDs determinísticos e verificação de nomes evitam duplicação; registros manuais com o mesmo nome e outro ID são preservados e reutilizados.
- Pedidos usam `source = demo_seed` e `metadata.demoSeed = lojateste_demo_v1`; o cleanup combina esses marcadores, UUIDs estáveis e `store_id`.
- Audit e cleanup acompanham o seed. Nenhum script foi executado no Supabase nesta etapa; validação funcional continua manual.

### Imagens específicas da loja-demo - 2026-07-15

- Corrigida a origem das imagens repetidas: o seed de catálogo usava `coalesce(stores.banner_url, stores.logo)` em todos os produtos novos.
- Reexecuções do catálogo agora inserem `image_url = null` quando o produto é novo e nunca alteram a imagem de um produto existente.
- Criado seed opcional com mapa explícito dos 29 produtos para URLs WEBP no bucket `product-images`, sempre no path `{storeId}/{productId}/{arquivo}`.
- URLs pendentes permanecem nulas no mapa; imagens manuais só podem ser substituídas com confirmação explícita no próprio mapa.
- Diagnóstico identifica ausência, repetição, uso de logo/banner e path incorreto. Nada foi executado remotamente.

### Sprint 2.3 - performance e bundle - 2026-07-15

- As 18 páginas públicas/Admin/Master passaram de imports eager para `React.lazy`, com routers Admin/Master também carregados sob demanda e `Suspense` com fallback visível.
- O chunk inicial caiu de 595,15 kB (168,03 kB gzip) para 198,01 kB (62,65 kB gzip); o maior chunk assíncrono ficou em 245,88 kB.
- O aviso de chunk acima de 500 kB desapareceu sem aumentar `chunkSizeWarningLimit` e sem `manualChunks` artificial.
- `react-easy-crop` ficou isolado em 29,69 kB e só entra nas páginas administrativas de edição de imagens.
- Três PNGs próprios, que somavam 5.963,75 kB, foram redimensionados/convertidos para WebP e agora somam 256,98 kB.
- Hero e banner principal permanecem eager para LCP; imagens abaixo da dobra/listagens usam lazy loading e decoding assíncrono.
- `usePediData` preserva o snapshot inicial, mas adia o adapter Supabase/database para depois do primeiro render.
- Nenhuma consulta duplicada foi removida: os fluxos independentes auditados já usam `Promise.all`; alterações especulativas foram evitadas.

## Consolidação das lojas-demo (15/07/2026)

- Migration 014 preparada para separar `active`, `is_demo` e `demo_featured`, com ordem/rótulo opcionais e escrita direta restrita ao master.
- Neguinho do Açaí e Gordinho Burguer ganharam seeds manuais, idempotentes e isolados por slug; Brasa House não é alterada automaticamente.
- Landing agora consulta somente demos ativas/destacadas no Supabase e não mistura mocks quando a resposta é vazia.
- Os banners legados locais usam referências `asset:demo/...` resolvidas no frontend; os produtos não recebem o banner repetido e aguardam imagens específicas no Storage.
- Mocks, pedidos fake e credenciais legadas permanecem somente para fallback até o checklist de validação ser concluído.

## Sprint 2.4 - testes e CI (15/07/2026)

- Stack: Vitest 4, jsdom, React Testing Library, jest-dom, user-event e cobertura V8.
- 71 casos em 11 arquivos cobrem status delivery/pickup, entitlements, moeda, WhatsApp, carrinho, componentes e quatro páginas críticas.
- `database.js` é exercitado com client Supabase mockado: RLS/schema não geram fallback; somente falha real de rede permite fallback técnico.
- GitHub Actions executa `npm ci`, testes e build em PRs e pushes para `main`, sem secrets nem acesso ao Supabase real.
- Integração real de RLS/RPC/Storage continua pendente em Supabase local ou projeto exclusivo de testes.

## Sprint 2.5 - abuso e observabilidade (15/07/2026)

- A porta pública proposta passa a ser a Edge Function `create-order`; migration 015 revoga execução direta anon/authenticated da RPC para evitar bypass.
- Rate limit server-side: 10 tentativas/IP/minuto, 30/IP/10 minutos e 5 falhas loja/chave/5 minutos, preservando idempotência.
- IP é normalizado no Edge e persistido somente como SHA-256 com salt secreto; payload e PII não entram nos registros/logs.
- Logger central substitui `console` no frontend, detalha somente em DEV e usa allowlist de metadados em produção.
- Sentry não foi integrado; `setObservabilityAdapter` deixa um ponto explícito para integração futura sem obrigar conta.

### Ajustes do teste local (16/07/2026)

- Produtos sem imagem deixaram de gerar `<img src="">` no carrinho, card e modal; fallbacks neutros preservam o layout e o catálogo demo sem imagem.
- Eventos `logInfo` agora contêm somente contexto seguro, ambiente e timestamp, sem `UNKNOWN_ERROR` ou mensagem vazia; em produção continuam silenciosos.

### Auditoria técnica pré-UX (17/07/2026)

- A arquitetura Supabase-first, autenticação Master/Admin, checkout idempotente, acompanhamento público e proteção Edge foram revisados antes da próxima etapa de UX.
- Correções seguras impediram herança de banner/logo em produtos, preservaram produtos sem categoria ativa, corrigiram o slug automático de criação de loja e reforçaram validação/normalização na Edge.
- A suíte passou para 120 testes em 20 arquivos; build, `node --check` e `git diff --check` passaram. O projeto ainda não possui script de lint.
- Nenhuma migration, alteração remota, commit ou push foi executado. A liberação para produção segue condicionada à validação real de RLS/Edge e à configuração de lint.
- Relatório completo: `AUDIT_PEDICAMPOS_PRE_UX_2026-07-17.md`.

### Gates técnicos pré-UX (17/07/2026)

- ESLint flat configurado com zero erros; 12 warnings de dependências de efeitos legados permanecem documentados, sem mascaramento.
- Diagnóstico remoto somente leitura preparado em `supabase/diagnostics/pre_ux_remote_validation.sql`.
- Checklist manual preparado em `SUPABASE_PRE_UX_VALIDATION.md`; nenhuma consulta remota, migration ou publicação foi executada.
- Projeto aprovado para a etapa de validação remota, ainda não para implementação da nova UX.

### Gate remoto pre-UX concluido (17/07/2026)

- `supabase/diagnostics/pre_ux_remote_summary.sql` retornou `PRE_UX_REMOTE_GATE = PASS` no projeto Supabase.
- As seis funcoes criticas foram confirmadas por assinatura com `function_inventory.sql`; o resumo passou a resolver funcoes por `to_regprocedure` e OID para evitar falsos negativos textuais.
- Os diagnosticos foram somente leitura e nao alteraram schema, funcoes, policies, dados, Edge ou Storage.
- O checkpoint tecnico libera o planejamento da UX/UI V2 sem mudar regras de negocio. Validacoes funcionais de dominio e isolamento continuam obrigatorias antes de producao.

## UX/UI V2 — Landing Page aprovada (18/07/2026)

- A fundação visual V2 foi consolidada com tokens de tipografia, espaçamento, raios, elevação, controles, movimento e estados semânticos; componentes compartilhados receberam estados de carregamento, erro, foco e composição compatíveis.
- A Loja Pública V2 foi implementada com hero estruturado, busca, categorias, catálogo responsivo, cards de produto, estados vazios, skeletons, carrinho flutuante e rodapé, preservando cor, logo, dados e fluxos de cada loja.
- A Landing Page institucional foi reformulada e aprovada visualmente pelo usuário. O fluxo final reúne hero de produto, prova de valor, benefícios, demonstração do fluxo, quatro etapas, prévia do painel, diferenciais, planos, FAQ acessível, CTA final e rodapé.
- As prévias de loja, pedidos, pagamento e painel são composições HTML/CSS baseadas em recursos existentes; não representam novos dados, integrações ou funcionalidades.
- A implementação preservou Supabase, migrations, Edge Functions, autenticação, regras de negócio, planos, preços, rotas e integrações.
- Validação do marco: `npm run lint` com zero erros e 12 warnings conhecidos de `react-hooks/exhaustive-deps`; 126 testes aprovados em 20 arquivos; build Vite aprovado com 147 módulos; `git diff --check` aprovado.
- A comunicação comercial dos planos foi consolidada sem mudar entitlements: Start mantém pedidos pelo WhatsApp; Pro inclui pagamento online no checkout com Pix integrado; Premium herda os recursos do Pro e acrescenta WhatsApp automático, cupons e automações.
- Pix integrado está disponível nos planos Pro e Premium por herança de recursos; WhatsApp automático permanece exclusivo do Premium.

### Decisão visual oficial

> A Landing Page V2 aprovada passa a ser a referência visual para a Loja Pública, modal de produto, carrinho, checkout, acompanhamento de pedido, painel da loja, painel master e demais telas do PediCampos.

Esse padrão exige hierarquia clara, acabamento premium, espaçamento consistente, composição orientada ao produto, identidade PediCampos, acessibilidade e equivalência de qualidade entre desktop e mobile. A personalização das lojas continua limitada ao conteúdo e ao acento visual próprio.

### Próxima etapa recomendada

- Harmonizar o modal de produto e o carrinho da Loja Pública com a referência aprovada, preservando adicionais, quantidades, cálculos, persistência e navegação; em seguida, aplicar o mesmo padrão ao checkout e ao acompanhamento de pedido.
