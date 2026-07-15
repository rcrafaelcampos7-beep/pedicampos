# TODO - PediCampos

Atualizado em: 2026-07-11

Legenda:

- [x] concluido claramente no codigo atual.
- [ ] pendente, precisa testar/corrigir/implementar futuramente.

## Urgente

- [x] Registrar nova direcao do projeto: sair de localStorage como solucao final e preparar banco real.
- [x] Definir Supabase como banco alvo.
- [x] Auditar onde dados sao carregados e salvos no codigo atual.
- [x] Auditar quais telas criam/alteram dados.
- [x] Criar `SUPABASE_MIGRATION_PLAN.md`.
- [x] Propor schema SQL inicial para Supabase.
- [x] Registrar localStorage/mocks como fallback temporario.
- [x] Criar memoria permanente do projeto em arquivos Markdown.
- [x] Verificar existencia de `PROJECT_CONTEXT.md`, `TODO_PEDICAMPOS.md`, `CHANGELOG_PEDICAMPOS.md` e `ARCHITECTURE_PEDICAMPOS.md`.
- [x] Rodar `npm run build` no final desta rotina e registrar resultado na resposta final.
- [x] Corrigir import de `formatCurrency` em `src/pages/AdminProducts.jsx`.
- [x] Rodar `npm run build` apos a correcao do import de `formatCurrency`.
- [x] Testar inicializacao com localStorage limpo.
- [x] Confirmar criacao de `pedicampos.database.v1` com localStorage limpo.
- [x] Confirmar mocks iniciais, Neguinho do Acai, Gordinho Burguer e `platform/platformSettings`.
- [x] Confirmar rotas principais respondendo 200: `/`, `/neguinhodoacai`, `/gordinhoburguer`, `/admin`, `/master`.
- [x] Testar painel master manualmente e confirmar funcionamento.
- [x] Auditar termos antigos de pagamento antes da troca de chat.
- [x] Confirmar que nao ha termos antigos de pagamento visiveis ao cliente final.
- [x] Testar fluxo completo de pedido de ponta a ponta por validacao automatizada dos modulos reais.
- [x] Criar camada de dados `src/services/database.js` usando `storage.js` como fallback.
- [x] Adaptar `src/hooks/usePediData.js` para usar `src/services/database.js`.
- [x] Testar rotas principais e fluxo critico novamente apos a troca do hook central.
- [x] Remover/revisar termos publicos de simulacao/copy tecnica (`simulado`, `mock`, `localStorage`) das areas publicas.
- [x] Preparar projeto para teste visual/manual local com servidor Vite ativo.
- [x] Registrar pendencias visuais/mobile encontradas no teste manual local.
- [x] Corrigir ajustes visuais/mobile encontrados no teste manual antes de iniciar a proxima etapa Supabase.
- [x] Corrigir texto repetido de adicionais no acompanhamento do pedido.
- [x] Rodar `npm run build` apos corrigir o texto de adicionais no acompanhamento.
- [x] Melhorar carrinho mobile.
- [x] Rodar `npm run build` apos ajustar o carrinho mobile.
- [x] Melhorar menu mobile do admin.
- [x] Rodar `npm run build` apos ajustar o menu mobile do admin.
- [x] Adicionar scroll automatico ao editar produtos no admin mobile.
- [x] Rodar `npm run build` apos adicionar scroll automatico ao editar produtos.
- [x] Adicionar scroll automatico ao editar adicionais no admin mobile.
- [x] Rodar `npm run build` apos adicionar scroll automatico ao editar adicionais.
- [x] Revisar cards/chips de adicionais no mobile.
- [x] Rodar `npm run build` apos as correcoes visuais/mobile.
- [ ] Testar novamente no navegador local apos as correcoes visuais/mobile.
- [ ] Testar fluxo completo com dados ja migrados no localStorage.
- [x] Validar em navegador real as rotas principais usando `http://127.0.0.1:5174`.
- [x] Criar projeto Supabase `pedicampos` na regiao Oeste dos EUA (Oregon) / `us-west-2`.
- [x] Executar `supabase/schema.sql` no SQL Editor do Supabase.
- [x] Confirmar retorno `Sucesso. Nenhuma linha retornada.` como esperado.
- [x] Rodar `npm run build` apos atualizar as memorias com o estado real do Supabase.
- [x] Conferir tabelas no Table Editor do Supabase.
- [x] Instalar `@supabase/supabase-js`.
- [x] Criar `src/services/supabaseClient.js`.
- [x] Criar `.env.example` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [x] Garantir que `.env.local` esteja protegido no `.gitignore`.
- [x] Nao colocar chaves reais nem senha do banco no codigo.
- [ ] Proxima tarefa real: configurar `.env.local` com as chaves reais e testar conexao basica Supabase.
- [ ] Conferir RLS, policies, indices e triggers no painel do Supabase, se ainda nao tiver sido validado item por item.

## Migracao Supabase

- [x] Decidir que Supabase sera o banco real alvo.
- [x] Manter `localStorage` temporariamente como fallback.
- [x] Manter `src/data/mockStores.js` e `src/data/mockOrders.js` temporariamente como seed/fallback.
- [x] Auditar dependencia de `src/services/storage.js`.
- [x] Auditar dependencia de `src/hooks/usePediData.js`.
- [x] Auditar telas que chamam `updateStore`, `mutateDatabase`, `createOrder`, `updateOrder` e `updatePlatform`.
- [x] Auditar linguagem publica/comercial com termos de simulacao.
- [x] Revisar copy publica para remover termos de teste/simulacao das telas publicas.
- [x] Criar proposta de tabelas Supabase em `SUPABASE_MIGRATION_PLAN.md`.
- [x] Criar `supabase/schema.sql` com SQL inicial real para o Supabase.
- [x] Criar `supabase/README.md` com instrucoes para executar o SQL.
- [x] Criar `src/services/database.js` com API preparada para Supabase e implementacao local por baixo.
- [x] Confirmar que `src/services/database.js` ainda usa `storage.js/localStorage` como adapter temporario.
- [x] Confirmar que Supabase ainda nao migra dados e `database.js` continua usando localStorage.
- [x] Confirmar que nenhuma tela foi migrada para `database.js` nesta etapa.
- [x] Migrar `src/hooks/usePediData.js` para importar `getDatabase` e `subscribeDatabase` de `database.js`.
- [x] Testar pos-migracao do hook central sem conectar Supabase real.
- [x] Criar `src/services/supabaseClient.js` defensivo, sem quebrar o app quando as variaveis nao existem.
- [ ] Definir `VITE_DATA_SOURCE=local|supabase`.
- [ ] Definir `VITE_SUPABASE_URL`.
- [ ] Definir `VITE_SUPABASE_ANON_KEY`.
- [ ] Criar adaptadores de dados local aninhado para modelo relacional.
- [x] Migrar `src/hooks/usePediData.js` para a nova camada.
- [ ] Migrar loja publica para buscar loja por slug pela nova camada.
- [ ] Migrar master lojas para criar/editar lojas pela nova camada.
- [ ] Migrar admin produtos.
- [ ] Migrar admin categorias.
- [ ] Migrar admin adicionais.
- [ ] Migrar checkout/pedidos.
- [ ] Migrar admin pedidos.
- [ ] Migrar master configuracoes.
- [x] Criar projeto Supabase.
- [x] Criar tabelas SQL no Supabase pelo SQL Editor.
- [x] Executar `supabase/schema.sql` no SQL Editor do Supabase.
- [x] Confirmar que o retorno `Sucesso. Nenhuma linha retornada.` e esperado para criacao de schema.
- [x] Rodar `npm run build` apos atualizacao das memorias Supabase.
- [ ] Conferir as 15 tabelas no Table Editor com RLS ativo.
- [ ] Conferir policies criadas em `Authentication > Policies`.
- [ ] Conferir indices criados no Supabase.
- [ ] Conferir triggers de `updated_at`.
- [x] Instalar `@supabase/supabase-js`.
- [x] Criar `.env.example`.
- [ ] Popular `plans` e `platform_settings`.
- [ ] Migrar lojas demo como seed inicial.
- [ ] Criar `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [ ] Garantir que senha do banco nao seja colocada no React.
- [x] Criar `src/services/supabaseClient.js`.
- [x] Preparar conexao Supabase sem migrar dados ainda.
- [ ] Testar conexao basica Supabase com `.env.local` configurado.
- [ ] Manter `database.js` com `storage.js/localStorage` como fallback.
- [ ] Migrar primeiro `getStores()`, `getStoreBySlug()`, `createStore()` e `updateStore()`.
- [ ] Implementar Supabase Auth para master/admin.
- [ ] Implementar RLS por loja.
- [ ] Testar que admin de uma loja nao acessa dados de outra.
- [ ] Testar que master acessa todas as lojas.
- [ ] Testar fluxo completo online em `pedicampos.com.br`.
- [ ] Remover localStorage como dependencia obrigatoria somente apos validacao.

## Bugs visuais

- [x] Teste visual/manual realizado no navegador real com servidor local ativo em `http://127.0.0.1:5174`; pendencias abaixo registradas para correcao futura.
- [x] Acompanhamento do pedido desktop: corrigir repeticao de `Adicionais:` em cada adicional do item.
- [x] Acompanhamento do pedido desktop: melhorar formatacao dos adicionais em linha unica ou lista separada.
- [x] Carrinho mobile: compactar e centralizar controles de quantidade `-`, quantidade e `+`.
- [x] Admin mobile: melhorar menu superior/Sidebar responsiva para evitar itens cortados ou espremidos.
- [x] Admin produtos mobile: ao tocar em `Editar`, rolar automaticamente ate o formulario.
- [x] Admin adicionais mobile: ao tocar em `Editar`, rolar automaticamente ate o formulario.
- [x] Admin adicionais mobile: revisar espacamento, quebra de linha, tamanho dos chips e organizacao dos cards.
- [ ] Redesenhar futuramente o layout do admin mobile, pois ainda nao ficou exatamente como Rafael deseja; nao bloquear a etapa Supabase por isso.
- [x] Reestruturar hero/landing para evitar sobreposicao de cards no desktop.
- [x] Fazer hero desktop em grid de duas colunas.
- [x] Fazer hero mobile em uma coluna.
- [x] Revisar responsividade e visual por CSS em `src/styles/global.css`.
- [x] Ajustar menus mobile com rolagem horizontal.
- [x] Adaptar sidebar admin/master para mobile com rolagem horizontal.
- [x] Garantir scroll horizontal controlado em tabelas do admin/master.
- [x] Ajustar modais com limite de altura e scroll interno.
- [x] Ajustar botoes, textos, cards, carrinho e metricas para telas pequenas.
- [ ] Revisar visual da landing em desktop largo.
- [ ] Revisar visual da landing em mobile pequeno.
- [ ] Revisar se o titulo da landing nunca fica cortado no topo.
- [ ] Revisar se imagem/mockup nunca cobre textos/cards.
- [ ] Revisar modal de produto em mobile.
- [ ] Revisar carrinho/drawer em mobile.
- [ ] Revisar tabelas do admin/master em telas menores.
- [ ] Revisar cores para evitar paleta monotona ou baixa legibilidade.

## Loja publica

- [x] Loja publica por slug em `/:slug`.
- [x] Lojas demo acessiveis por `/neguinhodoacai` e `/gordinhoburguer`.
- [ ] Testar manualmente `http://127.0.0.1:5174/neguinhodoacai` e `http://127.0.0.1:5174/gordinhoburguer`.
- [x] Loja criada no master funciona pelo slug.
- [x] Loja inativa mostra "Esta loja esta temporariamente indisponivel.".
- [x] Cor principal da loja altera detalhes/botoes via CSS variable `--store-color`.
- [x] Produtos desativados aparecem como indisponiveis.
- [ ] Decidir se produto desativado deve sumir totalmente ou continuar como indisponivel.
- [ ] Testar mudanca de slug: link antigo deve parar e novo deve funcionar.
- [ ] Melhorar estado vazio de loja nova sem produtos.
- [ ] Testar categorias inativas na loja publica.
- [ ] Revisar filtros de categoria e comportamento com categoria vazia.

## Carrinho e checkout

- [x] Carrinho por loja via `pedicampos.cart.${storeId}`.
- [x] Corrigir layout dos controles de quantidade no carrinho mobile.
- [x] Produto adicionado com quantidade, observacao e adicionais.
- [x] Quantidade recalcula total do item.
- [x] Checkout valida nome, telefone e endereco para entrega.
- [x] Checkout permite entrega ou retirada.
- [x] Taxa de entrega soma no total.
- [x] Plano Start finaliza por WhatsApp manual.
- [x] Plano Pro salva pedido no painel.
- [x] Plano Pro libera pagamento automatico simulado por Pix e Cartao.
- [x] Plano Premium mantem pagamento automatico simulado e adiciona WhatsApp automatico/automacoes.
- [x] Loja fechada bloqueia finalizacao.
- [x] Loja inativa bloqueia checkout.
- [x] Remover card publico "Formas ativas" do resumo lateral do checkout.
- [x] Usar labels publicos simples no checkout: `Pix`, `Dinheiro` e `Cartao`.
- [x] Remover `Pix online`, `Pix na entrega`, `Cartao na entrega` e avisos de plano/upgrade da loja publica/checkout.
- [x] Ajustar mensagem manual de WhatsApp para informar `Forma de pagamento: Pix` quando Pix for escolhido.
- [x] Normalizar metodos/labels antigos de pagamento para nomes publicos simples.
- [x] Remover `Pagamento na entrega` da area publica e normalizar status antigo para status amigavel.
- [x] Separar pagamento e status do pagamento na pagina de acompanhamento.
- [x] Adicionar experiencia simulada de pagamento por Cartao para planos com pagamento automatico.
- [x] Auditar que `Pix na entrega`, `Pagamento na entrega`, `Pix online`, `Cartao na entrega` e variantes tecnicas nao aparecem para o cliente final.
- [x] Remover/revisar ocorrencias publicas restantes de `simulado`, `mock` e `localStorage` em `CheckoutPage.jsx` e `LandingPage.jsx`.
- [ ] Testar fluxo completo de pedido com produto, adicionais gratis/pagos, carrinho, checkout, pagamento por plano, acompanhamento e admin.
- [ ] Testar carrinho apos alteracao de preco do produto no admin.
- [ ] Testar carrinho com produto desativado depois de ja estar no carrinho.
- [ ] Testar formas de pagamento desativadas.
- [ ] Melhorar validacoes de telefone.
- [x] Revisar mensagem WhatsApp manual do plano Start para comunicacao publica de pagamento.
- [ ] Criar confirmacao visual antes de limpar carrinho no Start, se necessario.

## Adicionais

- [x] Adicionais deixam de ser fixos no codigo.
- [x] Cada loja tem seus proprios grupos em `additionalGroups`.
- [x] Grupos tem `storeId`.
- [x] Grupos vinculam produtos por `productIds`.
- [x] Opcoes podem ser gratis ou pagas.
- [x] Preco 0 aparece como gratis.
- [x] Preco maior que 0 soma no total.
- [x] Grupos podem ser obrigatorios/opcionais.
- [x] Grupos podem ter minimo e maximo.
- [x] Selecao unica e multipla implementadas.
- [x] Grupos e opcoes podem ser ativados/desativados.
- [x] Modal valida minimo/maximo/obrigatorio.
- [x] Carrinho exibe adicionais selecionados.
- [x] Checkout exibe adicionais selecionados.
- [x] Pedido salvo carrega `selectedAdditionals`.
- [x] Painel de pedidos exibe adicionais.
- [ ] Testar criacao de adicional novo do zero.
- [ ] Testar edicao de adicional ja vinculado a produto no carrinho.
- [ ] Testar grupo obrigatorio de bebida no Gordinho Burguer.
- [ ] Testar maximo de 3 acompanhamentos no Neguinho do Acai.
- [ ] Testar adicional gratis em carrinho/pedido.
- [ ] Testar adicional pago em subtotal/pedido.
- [ ] Revisar UX de radio/checkbox no modal.
- [ ] Revisar chips/opcoes de adicionais no admin mobile.

## Painel Admin

- [x] Login fake do admin.
- [x] Selecao de loja no login.
- [x] Dashboard da loja.
- [x] Pedidos da loja.
- [x] Produtos CRUD.
- [x] Categorias CRUD.
- [x] Adicionais CRUD.
- [x] Configuracoes da loja.
- [x] Editar nome, slug, segmento, WhatsApp, cor, logo, banner, tempo medio, taxa, horario e endereco.
- [x] Editar formas de pagamento.
- [x] Abrir/fechar loja.
- [x] Ativar/desativar loja.
- [x] Alterar status de pedido.
- [x] Confirmar pagamento manualmente.
- [x] Previa de WhatsApp automatico simulado.
- [x] Bloqueio por plano para pedidos e adicionais.
- [x] Corrigir/importar `formatCurrency` em `AdminProducts.jsx`.
- [ ] Testar isolamento de dados ao trocar loja selecionada.
- [ ] Impedir conflito de slug no admin ou aplicar `uniqueSlug` tambem no admin.
- [ ] Melhorar feedback "salvo com sucesso".
- [ ] Melhorar confirmacao antes de excluir produto/categoria/adicional.
- [x] Melhorar menu mobile do admin.
- [x] Fazer `Editar` em produtos rolar ate o formulario no mobile.
- [x] Fazer `Editar` em adicionais rolar ate o formulario no mobile.

## Painel Master

- [x] Login fake master.
- [x] Dashboard geral.
- [x] Listar lojas.
- [x] Criar loja.
- [x] Editar loja.
- [x] Ativar/desativar loja.
- [x] Alterar plano da loja.
- [x] Acessar loja publica.
- [x] Pedidos gerais.
- [x] Planos.
- [x] Configuracoes da plataforma.
- [x] Alterar landing page pelo master.
- [x] Alterar precos dos planos.
- [x] Alterar valor de implantacao.
- [x] Alterar slogan/textos principais.
- [x] Alterar WhatsApp comercial e Instagram.
- [x] Alterar secoes visiveis.
- [x] Persistir no localStorage.
- [ ] Testar criacao de loja nova sem produtos.
- [ ] Testar edicao de slug com conflito.
- [ ] Testar desativar loja e acessar publicamente.
- [ ] Testar mudar cor da loja e conferir loja publica.
- [ ] Testar mudar plano e conferir bloqueios no admin/checkout.
- [ ] Testar `/master/configuracoes` e confirmar reflexo na landing.
- [ ] Melhorar tela de edicao de loja com mais campos se necessario.

## Planos

- [x] Plano Start configurado.
- [x] Plano Pro configurado.
- [x] Plano Premium configurado.
- [x] `planHasFeature` implementado.
- [x] `PlanGuard` implementado.
- [x] `/admin/pedidos` bloqueado para Start.
- [x] `/admin/adicionais` bloqueado para Start.
- [x] Checkout no site liberado a partir do Pro.
- [x] Pagamento automatico simulado por Pix e Cartao liberado a partir do Pro.
- [x] Premium diferenciado por WhatsApp automatico, mensagens por status e automacoes.
- [x] Premium destacado na landing.
- [x] Confirmar precos comerciais finais com gatilho em `,99`.
- [x] Valores finais: implantacao R$ 599,99; Start R$ 99,99/mes; Pro R$ 179,99/mes; Premium R$ 199,99/mes.
- [x] Ajustar normalizacao/migracao para corrigir valores antigos `179`/`199` para `179.99`/`199.99`.
- [ ] Testar downgrade de Premium para Start com pedidos/adicionais ja existentes.
- [ ] Testar recursos ativos/desativados se `featuresByPlan` mudar no master futuramente.

## Dados/localStorage

- [x] Banco mock principal em `pedicampos.database.v1`.
- [x] `stores` dentro do banco mock.
- [x] `orders` dentro do banco mock.
- [x] `platform` dentro do banco mock.
- [x] `platformSettings` como alias de compatibilidade.
- [x] `additionalGroups` dentro de cada loja.
- [x] Carrinho por loja em `pedicampos.cart.${storeId}`.
- [x] Sessao fake admin em `pedicampos.admin.auth`.
- [x] Loja admin selecionada em `pedicampos.admin.storeId`.
- [x] Sessao fake master em `pedicampos.master.auth`.
- [x] Normalizacao/migracao de dados antigos em `storage.js`.
- [x] LocalStorage limpo inicializa banco mock principal e carrega lojas/plataforma.
- [x] Normalizacao converte `pixDelivery`/`cardDelivery` e labels antigos de pedidos para `Pix`/`Cartao`.
- [x] Normalizacao converte status antigo `Pagamento na entrega` para status publico amigavel.
- [x] Auditoria confirmou que ocorrencias restantes de termos antigos em codigo sao apenas normalizacao/migracao ou fallback interno de compatibilidade.
- [x] Nova decisao: localStorage deixa de ser solucao final e passa a ser fallback temporario na migracao para Supabase.
- [ ] Criar botao/fluxo de reset de dados se desejado.
- [ ] Documentar rotina manual para limpar localStorage durante testes.
- [x] Preparar modelo inicial para migrar a Supabase em `SUPABASE_MIGRATION_PLAN.md`.
- [x] Criar camada de dados inicial como fachada sobre `storage.js`.
- [x] Migrar `src/hooks/usePediData.js` para substituir acesso direto ao `storage.js` pela fachada `database.js`.
- [ ] Migrar telas restantes para substituir acesso direto ao `storage.js` pela fachada `database.js`.

## Integracoes futuras

- [x] Supabase database definido como alvo.
- [x] SQL inicial real criado em `supabase/schema.sql`.
- [ ] Supabase database implementado.
- [ ] Autenticacao real.
- [ ] Regras de seguranca por loja/tenant.
- [ ] Storage real de imagens/logos/banners.
- [ ] Pix real via Mercado Pago ou Asaas.
- [ ] Webhook de Pix.
- [ ] WhatsApp Cloud API.
- [ ] Templates aprovados de WhatsApp.
- [ ] Deploy Vercel.
- [ ] Configurar dominio `pedicampos.com.br`.
- [ ] Variaveis de ambiente.
- [ ] Logs e auditoria.

## Comercial

- [x] Landing page comercial criada.
- [x] Planos exibidos na landing.
- [x] Implantacao exibida na landing.
- [x] Premium destacado como melhor escolha.
- [x] Loja demo real exibida na landing.
- [ ] Revisar copy final da landing.
- [x] Definir precos finais com centavos.
- [ ] Criar roteiro de demonstracao para cliente.
- [ ] Criar apresentacao comercial.
- [ ] Preparar prints/videos da demo.
- [ ] Definir politica de implantacao, suporte e mensalidade.
## Supabase lojas - estado em 2026-07-12

- [x] Criar conversores `storeFromSupabase` e `storeToSupabase`.
- [x] Migrar Supabase-first `getStores`, buscas por slug/id, criacao, edicao e desativacao com fallback local.
- [x] Confirmar que resultado remoto vazio nao injeta mocks.
- [x] Testar leitura remota: passou, com zero lojas.
- [ ] Resolver Auth/RLS para permitir criar e atualizar lojas; teste atual retorna PostgreSQL `42501`.
- [ ] Ligar `usePediData` e telas master ao fluxo assincromo sem remover a assinatura local.
- [ ] Repetir CRUD completo com loja temporaria e conferir no Table Editor.
- [ ] Depois de lojas, planejar produtos; categorias, adicionais e pedidos permanecem fora desta etapa.

## Auth master - 2026-07-12

- [x] Criar camada Supabase Auth para master.
- [x] Remover credencial fixa do login master e proteger rotas por sessao + `store_users`.
- [x] Criar migration incremental de autorizacao e policies administrativas de `stores`.
- [ ] Criar manualmente o usuario em Authentication > Users.
- [ ] Substituir UUID/e-mail em `002_master_auth.sql` e executar no SQL Editor.
- [ ] Testar login, logout e bloqueio de usuario autenticado sem role master.
- [ ] Integrar telas master de lojas ao adapter assincrono; elas ainda gravam localmente.
- [ ] Migrar admins de loja em etapa posterior.

## Telas master de lojas - 2026-07-12

- [x] Integrar `MasterCreateStore` com `getStores` e `createStore` assincronos.
- [x] Integrar `MasterStores` com listagem, edicao, ativacao e desativacao assincronas.
- [x] Adicionar loading, bloqueio de clique duplicado, erro amigavel e lista vazia.
- [x] Recarregar lojas apos cada operacao.
- [ ] Executar CRUD temporario no navegador com a sessao master e conferir a linha no Table Editor.
- [ ] Migrar categorias como proxima entidade.

## Seed de planos Supabase - 2026-07-12

- [x] Confirmar que `plans` estava vazia e era exigida pela FK de lojas.
- [x] Criar `003_seed_plans.sql` com os tres planos oficiais e precos atuais.
- [x] Garantir idempotencia sem sobrescrever registros existentes.
- [ ] Executar a migration 003 no SQL Editor.
- [ ] Conferir Start, Pro e Premium no Table Editor.
- [ ] Repetir CRUD real de loja com master autenticado.

## Loja publica Supabase - 2026-07-12

- [x] Buscar `/:slug` assincronamente com `getStoreBySlug`.
- [x] Tratar carregamento, erro, slug invalido, ausencia e cardapio vazio.
- [x] Preservar fallback local sem misturar mocks em consulta remota vazia.
- [ ] Validar no dominio uma loja Supabase ativa por slug.
- [ ] Decidir futuramente se lojas inativas devem ter uma resposta publica dedicada sem ampliar dados expostos pelo RLS.
- [ ] Migrar categorias como proxima entidade.

## Categorias Supabase - 2026-07-12

- [x] Criar conversores entre categoria relacional e formato atual.
- [x] Migrar as quatro funcoes de categorias para Supabase-first com fallback.
- [x] Preservar filtro e isolamento por `store_id`.
- [x] Confirmar que anon nao consegue inserir categorias (`42501`).
- [ ] Criar Supabase Auth para admins das lojas e vincular em `store_users`.
- [ ] Integrar `AdminCategories` somente depois da autenticacao real.
- [ ] Executar CRUD temporario autenticado e conferir no Table Editor.
- [x] Manter produtos pendentes ate categorias estarem validadas.

## Auth real dos usuarios de loja - 2026-07-12

- [x] Criar `signInStoreUser`, `getStoreMemberships` e `getAuthorizedStoreForUser`.
- [x] Migrar AdminLogin para Supabase Auth sem senha fixa ou escolha arbitraria de loja.
- [x] Proteger rotas admin por sessao e vinculo ativo em `store_users`.
- [x] Fazer logout real e remover troca manual de loja do layout.
- [ ] Criar manualmente o primeiro usuario Auth de loja e seu vinculo.
- [ ] Testar usuario valido, sem vinculo, inativo, isolamento, refresh e logout.
- [ ] Criar selecao explicita quando houver necessidade real de multiplos vinculos.
- [x] Integrar AdminCategories ao adapter assincrono.

## AdminCategories assincrono - 2026-07-12

- [x] Carregar categorias pela loja autorizada.
- [x] Integrar criacao, edicao, exclusao e reordenacao ao adapter Supabase-first.
- [x] Adicionar loading, vazio, erro e bloqueio de operacoes duplicadas.
- [x] Remover escrita direta em `storage.js` da tela.
- [ ] Executar CRUD real com categoria temporaria e conferir no Table Editor.
- [ ] Confirmar com dois usuarios/lojas que RLS bloqueia acesso cruzado.
- [x] Migrar produtos depois de categorias.

## Produtos Supabase - 2026-07-12

- [x] Criar conversores de produtos e migrar quatro funcoes para Supabase-first.
- [x] Integrar AdminProducts com produtos e categorias remotas.
- [x] Preservar scroll automatico ao editar.
- [x] Criar migration 004 para validar categoria e produto na mesma loja.
- [ ] Executar migration 004 no SQL Editor.
- [ ] Testar CRUD, status, categoria e exclusao no Table Editor.
- [ ] Testar bloqueio de categoria de outra loja e isolamento Loja A x Loja B.
- [ ] Planejar upload real de imagens futuramente.
- [x] Migrar adicionais depois de produtos; pedidos permanecem pendentes.

## Adicionais Supabase - 2026-07-12

- [x] Migrar grupos, opcoes e vinculos para adapter Supabase-first.
- [x] Integrar AdminAdditionals e preservar scroll de edicao.
- [x] Criar migration 005 com integridade por loja e save atomico.
- [x] Preservar valores gratis e pagos e impedir links duplicados.
- [ ] Executar migration 005 no SQL Editor.
- [ ] Testar CRUD completo e conferir as tres tabelas.
- [ ] Testar produto de outra loja e isolamento Loja A x Loja B.
- [ ] Migrar configuracoes da loja/formas de pagamento antes dos pedidos.
- [x] Manter pedidos pendentes ate concluir as dependencias de configuracao.

## Configuracoes e formas de pagamento - 2026-07-12

- [x] Criar adapters e conversores de `store_settings` e `payment_methods`.
- [x] Integrar AdminSettings com perfil, operacao e metodos remotos.
- [x] Integrar leitura minima na loja publica e checkout.
- [x] Criar migration 006 para update seguro do perfil sem expor plano/active.
- [x] Confirmar bloqueio anonimo de escrita (`42501`).
- [ ] Executar migration 006 no SQL Editor.
- [ ] Testar campos, metodos, isolamento e reflexo publico/checkout.
- [x] Migrar pedidos depois das configuracoes da loja.

## Pedidos Supabase - 2026-07-12

- [x] Criar migration 007 com token publico e RPCs seguras.
- [x] Migrar adapter de pedidos, clientes, itens e adicionais escolhidos.
- [x] Integrar Checkout, OrderTracking e AdminOrders.
- [x] Recalcular valores no banco e salvar snapshots.
- [ ] Executar migration 007 no SQL Editor.
- [ ] Testar entrega, retirada, tres pagamentos, adicionais gratis/pagos e duplicidade.
- [ ] Conferir quatro tabelas e isolamento Loja A x Loja B.
- [ ] Integrar gateway/WhatsApp reais somente em etapa futura separada.

## Correcao catalogo publico - 2026-07-12

- [x] Identificar arrays vazios vindos de `storeFromSupabase` como causa.
- [x] Hidratar categorias, produtos e adicionais em paralelo na StorePage.
- [x] Filtrar ativos e vinculos validos sem misturar mocks.
- [x] Confirmar leitura publica real sem erro de RLS.
- [ ] Validar visualmente produtos e adicionais no dominio.
- [ ] Retomar testes de pedidos somente depois dessa validacao.

## Correcao da listagem de pedidos - 2026-07-12

- [x] Remover fallback silencioso para erros de RLS/RPC/schema/validacao em pedidos.
- [x] Carregar pedidos e relacionamentos por consultas filtradas por `store_id`.
- [x] Fazer AdminOrders diferenciar erro de lista realmente vazia.
- [x] Manter SELECT anonimo geral bloqueado e dispensar nova migration.
- [ ] Conferir o pedido historico e seu `store_id` no Table Editor.
- [ ] Criar novo pedido e validar listagem, status, tracking e isolamento entre lojas.

## Correcao da RPC publica - 2026-07-12

- [x] Reproduzir e registrar o erro real `42501` em `customers`.
- [x] Confirmar assinatura e payload do checkout ate a fase de INSERT.
- [x] Criar migration 008 sem liberar SELECT anonimo ou alterar RLS.
- [x] Exibir diagnostico completo somente em desenvolvimento.
- [ ] Executar migration 008 no SQL Editor.
- [ ] Repetir pedido com entrega, opcao gratis e opcao paga; conferir as quatro tabelas.
- [ ] Endurecer em etapa propria a validacao server-side de minimo/maximo por grupo; a UI ja aplica essas regras.

## Auditoria remota create_public_order - 2026-07-12

- [x] Repetir a chamada anonima apos a migration 008.
- [x] Confirmar criacao e tracking remoto com produto e duas opcoes.
- [x] Criar consulta pg_proc/pg_namespace para auditoria no SQL Editor.
- [x] Adicionar resumo nao sensivel do payload ao erro de desenvolvimento.
- [ ] Executar o SQL de diagnostico e registrar quantidade de overloads/owner/config remotos.
- [ ] Remover o pedido temporario `80EE5827` apos a verificacao no Table Editor.
- [ ] Capturar o novo erro e payload do checkout no console se a UI ainda falhar.

## Store ID correto no checkout - 2026-07-12

- [x] Rastrear UUID antigo ao fallback local de loja por slug.
- [x] Resolver loja sem fallback local no checkout.
- [x] Resolver novamente antes da RPC e enviar somente o ID remoto atual.
- [x] Persistir propriedade do carrinho e bloquear divergencias.
- [ ] Testar carrinho legado/invalido e carrinho novo no navegador.
- [ ] Confirmar pedido no banco/admin, atualizar status e validar tracking.

## Persistencia do carrinho novo - 2026-07-12

- [x] Tornar StorePage estrita para a loja remota.
- [x] Persistir envelope e item com o ID recebido de StorePage.
- [x] Impedir sobrescrita vazia durante a troca inicial de storeId no hook.
- [x] Limpar automaticamente estado divergente e manter o ID remoto atual.
- [ ] Confirmar logs/localStorage no navegador e finalizar pedido pelo fluxo visual.

## Fonte unica de lojas - 2026-07-12

- [x] Auditar snapshot local, facade, auth, paginas e imports.
- [x] Impedir lojas locais no snapshot quando Supabase esta configurado.
- [x] Restringir fallback a falha real de conectividade.
- [x] Criar limpeza local versionada e seletiva por colisao de slug remoto.
- [x] Invalidar somente carrinhos ligados aos IDs locais removidos.
- [x] Testar colisao, local-only, null remoto e resolucao estrita de lojateste.
- [ ] Validar pedido/admin/status/tracking pelo navegador com bundle atual.

## Conflito stores x store_settings - 2026-07-12

- [x] Renomear `store_settings.id` para `settingsId` no adapter.
- [x] Proteger merges publicos e administrativos com o ID raiz explicito.
- [x] Confirmar `store.id`, `settingsId` e `storeId` remotos.
- [x] Criar pedido remoto e validar tracking com tenant correto.
- [ ] Confirmar `BB6F8698` no admin, alterar status e remover pedido/cliente temporarios.

## Dashboard admin Supabase - 2026-07-13

- [x] Remover pedidos/produtos locais dos calculos do dashboard.
- [x] Carregar pedidos e produtos remotos por `store.id` autorizado.
- [x] Tratar loading, erro e lista vazia.
- [x] Adicionar Atualizar no dashboard e pedidos.
- [x] Confirmar que AdminOrders recarrega ao montar e apos mutation.
- [ ] Validar metricas, status e retorno ao dashboard com sessao admin real.
- [ ] Avaliar Realtime somente em etapa futura.

## Timeline delivery x pickup - 2026-07-13

- [x] Centralizar sequencias e acoes por fulfillment.
- [x] Usar Pronto para retirada em pedidos pickup.
- [x] Remover Saiu para entrega das acoes de retirada.
- [x] Normalizar status legado sem migration.
- [x] Atualizar tracking, badges, filtro admin e mensagem WhatsApp.
- [ ] Validar visualmente pedido real de entrega, retirada e legado.

## Auditoria de producao - Sprint 1 - 2026-07-13

- [x] Auditar arquitetura, auth, adapters, Supabase-first, banco, performance, UX e legado.
- [x] Restringir fallback das entidades migradas a falha real de conectividade.
- [x] Conectar a associacao de plano do MasterPlans ao adapter remoto.
- [x] Criar migration 009 para remover INSERT anonimo direto e manter a RPC como unica escrita publica.
- [ ] Executar migration 009 e diagnostico 009 no Supabase remoto.
- [ ] Repetir matriz anon/RPC/tracking/Admin Loja A x Loja B depois da aplicacao.
- [x] Criar migration 010 para validar required/min/max e integridade de adicionais dentro de `create_public_order`.
- [ ] Executar migration 010 e o teste rollback-only A-J no Supabase.
- [x] Criar migration 011 com idempotencia por loja e limites server-side.
- [x] Enviar/reutilizar idempotency key no Checkout/database adapter.
- [ ] Executar migration, diagnostico e teste rollback-only A-K da 011.
- [ ] Planejar rate limit real por IP/usuario em Edge Function, Vercel ou gateway.
- [x] Aplicar entitlements tecnicos relevantes no servidor usando `plans.feature_flags`.
- [x] Centralizar entitlements tecnicos em `plans.feature_flags` e aplicar guards server/frontend.
- [ ] Executar migration 012, diagnostico e teste rollback-only no Supabase.
- [ ] Validar Start, Pro e Premium com lojas reais e tentativa direta de recurso bloqueado.
- [ ] Projetar `available_for_new_stores` e `store_commercial_terms` antes de promocao/cobranca real.

## Sprint 2.1 - Supabase Storage - 2026-07-14

- [x] Criar migration 013 com buckets, limite, MIME e policies por tenant.
- [x] Criar servico reutilizavel de validacao/upload/exclusao segura.
- [x] Integrar logo e banner em AdminSettings mantendo URL manual.
- [x] Integrar imagem em AdminProducts usando UUID real do produto.
- [x] Preservar URLs externas e implementar compensacao em falha.
- [ ] Executar migration e diagnosticos 013 no Supabase.
- [ ] Testar JPG/PNG/WEBP, 5 MB, MIME invalido e URL publica anonima.
- [ ] Validar upload/delete Loja A x Loja B com duas sessoes reais.
- [ ] Avaliar limpeza programada de arquivos orfaos e transformacao/otimizacao de imagens futuramente.
- [x] Separar URL da logo, banner e iniciais de fallback no AdminSettings e na loja pública.
- [ ] Validar manualmente logo externa/Storage, fallback por erro, banner e upload JPG/PNG/WEBP em desktop e celular.
- [x] Adicionar recorte obrigatório, arraste, zoom e preview final antes de uploads de logo, banner e produto.
- [ ] Validar recorte real com foto de celular/EXIF, zoom, cancelamento e igualdade entre preview e URL publicada.
- [x] Exigir confirmação do banco para novas URLs de logo/banner antes de exibir sucesso.
- [ ] Repetir em sessão autenticada: logo isolada, banner isolado, ambos e falha simulada, conferindo `stores.logo` e `stores.banner_url`.
- [x] Migrar dashboard/pedidos globais e metricas de lojas do master sem consulta por loja.
- [ ] Validar dashboard/pedidos globais com master e pedidos de pelo menos duas lojas.
- [x] Paginar consultas globais do master antes de grande volume.
- [ ] Adicionar rate limit, limites de payload, paginacao e testes automatizados de RLS/RPC/E2E.
- [ ] Remover identidade especifica da migration de bootstrap em uma estrategia segura e portavel.
- [x] Criar contrato único de paginação remota com 20 registros, count exact e range.
- [x] Paginar pedidos, produtos, categorias e adicionais no Admin.
- [x] Paginar pedidos, lojas e planos no Master sem fallback local.
- [x] Remover `usePediData` e snapshots locais do MasterPlans.
- [ ] Validar manualmente página intermediária/última, filtros, CRUD e página vazia com massas acima de 20 registros.
- [ ] Avaliar RPC agregada futura para métricas de lojas; agregações REST estão desabilitadas no projeto e hoje os totais da página são lidos em lotes.

## Loja-demo Brasa House Burger - 2026-07-15

- [x] Criar seed idempotente separado das migrations para o slug `lojateste`.
- [x] Preparar 6 categorias, 29 produtos, 5 grupos, 20 opções e 56 vínculos coerentes.
- [x] Preparar 22 pedidos fictícios distribuídos por status, entrega/retirada e últimos dias.
- [x] Criar audit visível e cleanup seletivo por marcador/UUID/store_id.
- [ ] Executar `lojateste_demo_catalog.sql` manualmente no Supabase e revisar o resultado do audit.
- [ ] Validar no navegador catálogo, adicionais grátis/pagos, checkout, Admin, dashboard, filtros e paginação.
- [ ] Executar o cleanup somente se a massa de demonstração precisar ser removida.
- [x] Remover logo/banner como fallback de imagem no seed de catálogo.
- [x] Criar mapa seguro e audit para imagens específicas dos 29 produtos-demo.
- [ ] Produzir/fornecer 29 arquivos WEBP coerentes e enviá-los aos paths individuais do bucket `product-images`.
- [ ] Preencher as URLs públicas no mapa e executar o seed de imagens após conferência.
- [ ] Executar o audit e confirmar 29 URLs únicas, sem logo/banner repetido e sem produto pendente.
