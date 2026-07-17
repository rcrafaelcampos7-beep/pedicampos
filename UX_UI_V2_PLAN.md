# PediCampos — Plano UX/UI V2

## 0. Objetivo, escopo e premissas

Este documento registra a auditoria da interface atual e propõe uma evolução visual incremental para o PediCampos. A etapa é exclusivamente de planejamento: nenhum componente, estilo, fluxo, regra de negócio ou objeto do Supabase foi alterado.

Premissas obrigatórias:

- preservar a identidade institucional atual do PediCampos: verde, grafite, branco, tipografia limpa e comunicação direta;
- preservar a personalização de cada loja por nome, logo, banner e cor principal;
- não criar uma nova marca nem substituir a paleta atual sem apresentação e aprovação prévias;
- não mudar contratos de dados, permissões, planos, entitlements, rotas ou comportamento comercial;
- implementar em etapas pequenas, com regressão funcional e responsiva a cada etapa;
- tratar este levantamento como auditoria baseada no código, CSS e testes atuais. Antes da implementação, registrar uma linha de base visual em navegadores e viewports reais.

## 1. Inventário das telas atuais

### Área institucional e pública

| Tela | Rota | Conteúdo e ações principais |
| --- | --- | --- |
| Landing page | `/` | Navegação, hero, benefícios, funcionamento, lojas demonstrativas, planos, FAQ, CTA e rodapé |
| Loja pública | `/:slug` | Cabeçalho personalizável, categorias, busca/listagem de produtos, abertura do produto e acesso ao carrinho |
| Produto e adicionais | modal na loja | Imagem, descrição, preço, grupos de adicionais, quantidade, observação e inclusão no carrinho |
| Carrinho | modal na loja | Itens, quantidades, adicionais, subtotal, limpeza e avanço ao checkout |
| Checkout | `/:slug/checkout` | Dados do cliente, entrega/retirada, pagamento, resumo e confirmação do pedido |
| Acompanhamento | `/:slug/pedido/:token` | Status, linha do tempo, itens, totais, entrega e contato da loja |

### Área da loja

| Tela | Rota lógica | Conteúdo e ações principais |
| --- | --- | --- |
| Login da loja | `/admin/login` | Autenticação da equipe da loja |
| Dashboard | `/admin` | Indicadores e atalhos operacionais |
| Pedidos | `/admin/orders` | Lista, filtros, paginação e atualização de status |
| Produtos | `/admin/products` | Cadastro, edição, imagem, disponibilidade e listagem |
| Categorias | `/admin/categories` | Cadastro, edição, ordenação e listagem |
| Adicionais | `/admin/additionals` | Grupos, opções, vínculos e edição |
| Configurações | `/admin/settings` | Dados, identidade e preferências da loja disponíveis ao plano |

### Área master

| Tela | Rota lógica | Conteúdo e ações principais |
| --- | --- | --- |
| Login master | `/master/login` | Autenticação administrativa da plataforma |
| Dashboard master | `/master` | Visão consolidada da operação |
| Lojas | `/master/stores` | Busca, filtros, paginação, estado e ações das lojas |
| Criar loja | `/master/stores/new` | Cadastro de loja, responsável e configuração inicial |
| Pedidos | `/master/orders` | Visão transversal dos pedidos |
| Planos | `/master/plans` | Consulta e manutenção das definições existentes |
| Configurações | `/master/settings` | Identidade institucional e parâmetros atuais da plataforma |

### Estados e rotas auxiliares

- carregamento de rota lazy por `RouteLoading`;
- rota não encontrada por `NotFound`;
- bloqueio por plano por `PlanGuard`;
- estados locais de carregamento, erro e vazio nas páginas operacionais.

## 2. Problemas visuais e de usabilidade encontrados

### Consistência e hierarquia

- O arquivo `global.css` concentra estilos de todas as áreas. A escala atual funciona, mas aumenta o risco de efeitos colaterais e torna difícil localizar responsabilidades.
- Há muitos padrões próximos, porém não totalmente uniformes, para cabeçalhos, formulários, ações, mensagens, cards e estados de carregamento.
- Algumas páginas operacionais exibem apenas texto como `Carregando...`; a transição visual varia entre páginas.
- A landing page possui várias seções de cards com peso parecido. A hierarquia entre proposta de valor, demonstração e conversão pode ficar mais clara sem mudar o conteúdo comercial.
- Admin e master reutilizam linguagem visual semelhante. Isso ajuda na consistência, mas precisa de diferenciação contextual explícita para reduzir o risco de o usuário agir na área errada.

### Navegação e responsividade

- No mobile, as barras laterais viram navegação horizontal. O padrão economiza espaço, mas pode ocultar destinos fora da área visível e não comunica claramente que existe rolagem.
- As tabelas mantêm largura mínima aproximada de 760 px e dependem de rolagem horizontal. Funciona tecnicamente, mas dificulta comparação e ações em telas estreitas.
- A partir dos breakpoints atuais, diversos grids passam diretamente para uma coluna. Cards de produto e painéis podem ficar excessivamente altos em celulares e pouco densos em tablets.
- Em telas muito estreitas, grupos de ações empilham botões em largura total, gerando sequências longas e reduzindo a leitura do conteúdo principal.
- A barra flutuante do carrinho não declara espaçamento para `env(safe-area-inset-bottom)`, relevante em dispositivos com área segura inferior.
- Breakpoints de 1080, 900, 760 e 520 px atendem os casos principais, mas precisam de validação visual em larguras intermediárias, zoom de 200% e orientação paisagem.

### Loja, produto e compra

- Os cards de produto em uma única coluna podem ocupar altura excessiva, atrasando a descoberta do catálogo.
- As categorias são apresentadas como controles visuais, mas sem semântica clara de item atual (`aria-current`) ou padrão equivalente.
- O `ProductModal` e o modal do carrinho fecham por Escape e pelo fundo, mas não há evidência de ciclo de foco, foco inicial ou devolução de foco ao elemento acionador.
- O botão de fechar usa um `x` textual; o alvo, a descrição e o estado de foco devem ser padronizados.
- O checkout reúne identificação, entrega, pagamento e revisão em uma página longa. A prioridade e o progresso precisam ficar mais claros sem alterar a sequência ou as validações existentes.
- A apresentação dos meios de pagamento simulados pode competir com a ação principal e deve aparecer apenas no momento adequado do fluxo.
- O acompanhamento do pedido combina linha do tempo, resumo e contato; no mobile, a ordem deve priorizar status atual e próxima ação.

### Login, formulários e feedback

- As telas de login são objetivas, mas não expõem controles auxiliares como mostrar senha, retorno seguro ou orientação contextual quando a autenticação falha.
- Inputs já têm rótulos e estado de foco, porém mensagens de ajuda, erro e sucesso não seguem um contrato visual único.
- Não foi identificado um padrão global de `:focus-visible` para links, botões e controles personalizados.
- O suporte a `prefers-reduced-motion` está limitado ao carregamento de rota; transições futuras devem respeitar essa preferência em toda a aplicação.
- Estados vazios existem, mas a presença e o texto da ação seguinte não são uniformes.

### Qualidade do sistema de estilos

- `--color-border` é utilizado em pontos de `global.css`, mas o token declarado é `--color-line`. A implementação V2 deve consolidar o nome sem mudar a aparência.
- Tipografia, espaçamento e tamanhos aparecem majoritariamente como valores locais. A formalização em tokens reduzirá pequenas divergências.
- `global.css` deve ser dividido por fundações, componentes e áreas apenas durante a implementação, com comparação visual para evitar regressões de cascata.

## 3. Componentes que podem ser reutilizados

Os seguintes componentes já formam uma boa base e devem evoluir sem mudança de contrato sempre que possível:

- `Button`: variantes, tamanhos, estado desabilitado e tipo seguro por padrão;
- `Input`, `Textarea`, `Select` e `Checkbox`: associação de rótulo e composição de formulários;
- `Card`, `Badge`, `StatusBadge` e `MetricCard`: estrutura de conteúdo e sinalização de estado;
- `EmptyState`, `RouteLoading` e `NotFound`: estados transversais;
- `PaginationControls`: navegação paginada já compartilhada;
- `PlanCard`: apresentação consistente dos planos existentes;
- `Modal` e `ImageCropModal`: base funcional para camadas e edição de imagem;
- `Sidebar`, `AdminLayout` e `MasterLayout`: estrutura das áreas autenticadas;
- `StoreHeader`, `CategoryTabs`, `ProductCard`, `ProductModal`, `CartDrawer` e `OrderTimeline`: composição do fluxo público;
- `PlanGuard`: proteção visual ligada aos entitlements existentes, sem alterar sua lógica.

## 4. Componentes que precisam ser reformulados

Reformular significa preservar regras, propriedades e eventos existentes, alterando primeiro apresentação e acessibilidade:

1. `Modal`: adicionar gestão completa de foco, título associado, foco inicial, retorno ao acionador, bloqueio de fundo e versão de painel inferior no mobile.
2. `CartDrawer`: alinhar nome e comportamento visual; desktop pode usar painel lateral e mobile pode usar painel inferior, mantendo os mesmos dados e ações.
3. `CategoryTabs`: indicar item ativo semanticamente, melhorar rolagem horizontal e tornar o próximo item parcialmente visível no mobile.
4. `ProductCard`: criar composição compacta mobile, preservar imagem, preço, disponibilidade e clique atual.
5. `ProductModal`: separar leitura do produto, escolha de adicionais e ação final; manter todas as validações e cálculos.
6. `Sidebar`: substituir a simples faixa horizontal mobile por navegação com destino ativo visível e descoberta previsível.
7. Tabelas administrativas: adicionar prioridade de colunas e representação em cards no mobile, mantendo tabela no desktop.
8. Form fields: unificar ajuda, erro, obrigatório, desabilitado, sucesso e foco visível.
9. Feedback: criar padrões de alerta inline, banner e notificação, sem mudar quando cada evento ocorre.
10. Loading/empty: adotar skeletons compatíveis com a estrutura da página e ações claras nos vazios.

## 5. Proposta de design system

### Princípio

A V2 deve organizar a identidade já escolhida, não substituí-la. Os valores abaixo são os tokens atuais ou escalas derivadas deles. Qualquer nova cor de marca exige apresentação separada e aprovação.

### Cores

| Papel | Token atual | Valor atual | Uso |
| --- | --- | --- | --- |
| Institucional principal | `--color-primary` | `#16a34a` | CTA, destaque e foco institucional |
| Institucional escuro | `--color-primary-dark` | `#0f7a38` | hover e contraste |
| Grafite | `--color-graphite` | `#111827` | títulos e superfícies escuras |
| Texto | `--color-ink` | `#1f2937` | corpo principal |
| Texto secundário | `--color-muted` | `#64748b` | apoio e metadados |
| Linha | `--color-line` | `#e2e8f0` | bordas e divisores |
| Fundo | `--color-bg` | `#f7f8fb` | fundo da aplicação |
| Card | `--color-card` | `#ffffff` | superfícies |
| Fundo suave | `--color-soft` | `#eef7f1` | destaque institucional discreto |
| Semânticas atuais | azul, roxo, vermelho e laranja | tokens existentes | informação, estados e alertas conforme contexto |

Regras:

- conferir contraste WCAG AA para texto e controles;
- nunca usar somente cor para comunicar status;
- usar `--store-color` apenas no escopo público da loja e gerar estados de contraste com fallback institucional;
- consolidar `--color-border` em `--color-line` durante a implementação.

### Tipografia

- manter `Inter` com a pilha de sistema atual;
- formalizar níveis: legenda, corpo pequeno, corpo, subtítulo, título de seção, título de página e display da landing;
- usar peso e espaço antes de aumentar tamanho;
- limitar largura de parágrafos longos e preservar `clamp()` nos títulos de destaque;
- manter corpo mínimo legível e evitar texto operacional abaixo de 14 px.

### Espaçamentos

- adotar escala de 4, 8, 12, 16, 24, 32, 48 e 64 px;
- usar 16 px como base de composição, 24 px entre grupos e 32–64 px entre seções;
- manter área clicável mínima de 44 × 44 px;
- aplicar áreas seguras em barras fixas e painéis mobile.

### Bordas, raios e sombras

- manter raio base atual de 8 px;
- reservar variações maiores apenas para modais e grandes superfícies, sem misturar muitos raios;
- usar borda `--color-line` para estrutura e não como decoração repetitiva;
- manter `--shadow-soft` para cards elevados e `--shadow` para modais/painéis;
- evitar cards aninhados com sombra em todos os níveis.

### Botões

- institucional primário: verde atual; secundário: superfície clara com borda; perigo: vermelho semântico;
- na loja pública, o primário pode herdar `--store-color` somente quando o contraste for válido;
- padronizar alturas, ícone, carregamento, foco visível, desabilitado e largura mobile;
- limitar cada seção a uma ação primária claramente dominante.

### Inputs

- manter rótulo sempre visível e associá-lo ao controle;
- reservar espaço consistente para ajuda e erro, evitando saltos de layout;
- definir estados padrão, hover, foco visível, preenchido, erro, sucesso e desabilitado;
- usar controles nativos sempre que possível e preservar autocomplete apropriado em login/checkout.

### Cards

- definir variantes: conteúdo, métrica, produto, ação e estado vazio;
- padronizar cabeçalho, corpo, rodapé, espaçamento e ação principal;
- no mobile, reduzir decoração e priorizar densidade e leitura.

### Modais e painéis

- desktop: modal central para tarefas curtas e painel lateral para carrinho/contexto persistente;
- mobile: painel inferior ou tela quase completa, conforme o comprimento do formulário;
- título associado, foco contido, Escape, retorno de foco, ação fixa quando necessário e rolagem interna previsível;
- confirmar apenas ações destrutivas ou irreversíveis.

### Tabelas

- desktop: cabeçalho estável, alinhamento por tipo, ações previsíveis e estados de linha;
- tablet/mobile: manter apenas colunas prioritárias e mover detalhes para card/expansão;
- preservar paginação, filtros e ações atuais;
- fornecer rótulos acessíveis para ações que usam apenas ícones.

### Alertas

- variantes: informação, sucesso, atenção e erro;
- estrutura: título opcional, mensagem objetiva, ação e fechamento quando aplicável;
- combinar ícone, texto e cor; erros de formulário devem ficar próximos do campo e também ter resumo quando necessário.

### Carregamento e vazio

- carregamento de rota: manter indicador simples e respeitar movimento reduzido;
- carregamento de conteúdo: skeleton com dimensões próximas do resultado final;
- ações assíncronas: spinner no botão sem alterar sua largura;
- vazio: explicar o estado, indicar a próxima ação possível e não confundir ausência de dados com erro;
- erro: manter dados já carregados quando seguro e oferecer repetição da consulta.

## 6. Estratégia mobile-first

1. Projetar primeiro para 320–430 px, com conteúdo principal em uma coluna e ações essenciais próximas ao polegar.
2. Validar áreas seguras, teclado virtual, zoom, orientação paisagem e textos maiores antes de expandir o layout.
3. Usar melhoria progressiva: duas colunas quando o conteúdo comportar, sidebar apenas quando houver largura real e tabelas completas no desktop.
4. Tornar navegação horizontal explicitamente rolável ou substituí-la por menu/painel com contexto e item ativo.
5. Compactar cards de catálogo, manter CTA e preço visíveis e evitar imagens que dominem a altura da tela.
6. No checkout, manter resumo acessível sem encobrir campos e deixar claro o passo atual, sem mudar regras ou ordem de validação.
7. No admin/master, priorizar busca, status e ação principal; detalhes secundários entram em expansão ou página de detalhe.
8. Testar 320, 360, 390, 430, 768, 1024 e 1440 px, além de zoom de 200%.

## 7. Ordem recomendada de implementação

### Etapa 0 — Linha de base

- capturar telas atuais nos viewports de referência;
- registrar fluxos e contratos cobertos pelos testes existentes;
- definir métricas de aceitação de acessibilidade, regressão e responsividade.

### Etapa 1 — Fundações e componentes UI

- organizar tokens atuais;
- corrigir inconsistências de token sem alterar aparência;
- evoluir Button, campos, Card, Modal, Alert, EmptyState e Loading;
- criar exemplos isolados e testes de acessibilidade/comportamento.

### Etapa 2 — Shells, navegação e autenticação

- revisar AdminLayout, MasterLayout, Sidebar e topbars;
- tornar o contexto admin/master inequívoco;
- aplicar os componentes de formulário aos logins.

### Etapa 3 — Loja pública, produto e carrinho

- otimizar cabeçalho, categorias e catálogo;
- reformular ProductCard, ProductModal e CartDrawer;
- preservar seleção de adicionais, quantidades, cálculos e persistência atual.

### Etapa 4 — Checkout e acompanhamento

- reforçar progresso, hierarquia, validações e resumo;
- priorizar status e próxima ação no acompanhamento;
- validar integralmente criação, idempotência e consulta do pedido sem alterar backend.

### Etapa 5 — Painel da loja

- migrar dashboard, pedidos, produtos, categorias, adicionais e configurações;
- aplicar tabela responsiva, formulários e feedback padronizados por página.

### Etapa 6 — Painel master

- aplicar a mesma fundação com identificação contextual própria;
- preservar filtros, paginação, planos, lojas e permissões existentes.

### Etapa 7 — Landing page

- refinar hierarquia e ritmo das seções com o conteúdo e a marca atuais;
- manter demonstrações, planos e CTAs existentes;
- validar performance das imagens e conversão sem inventar nova identidade.

### Etapa 8 — Consolidação

- regressão completa, acessibilidade, performance e navegadores;
- remover estilos obsoletos somente após prova de não uso;
- atualizar documentação e capturas aprovadas.

## 8. Riscos de quebrar funcionalidades existentes

| Risco | Proteção exigida |
| --- | --- |
| Alterar propriedades/eventos de componentes compartilhados | manter API compatível e migrar com testes de componente |
| Quebrar cálculo de adicionais, quantidade ou subtotal | testes unitários e fluxo completo produto → carrinho → checkout |
| Perder estado do carrinho durante mudanças de layout | preservar contexto, chaves e ciclo de persistência atuais |
| Alterar validação ou payload do checkout | congelar contratos e comparar payloads antes/depois |
| Comprometer idempotência/criação do pedido | manter serviços intactos e executar testes de integração existentes |
| Expor ação sem entitlement | manter `PlanGuard` e condições atuais, com testes por plano |
| Misturar dados entre lojas | preservar `storeId`, slug e escopo em toda renderização |
| Personalização gerar contraste insuficiente | validação de contraste e fallback para o verde institucional |
| Quebrar upload/corte de imagens | teste específico de arquivo, preview, crop, erro e cancelamento |
| Ocultar ações em tabela mobile | matriz de prioridade e teste de todas as ações por viewport |
| Gerar regressão por cascata CSS | CSS por camada, captura comparativa e mudança incremental |
| Quebrar foco/teclado em modais | testes de Tab, Shift+Tab, Escape e retorno ao acionador |
| Confundir admin e master | identificação persistente da área e testes de rotas/autorização |
| Aumentar bundle e tempo de entrada | preservar lazy loading e acompanhar tamanho do build |

## 9. Checklist de testes por etapa

### Linha de base e fundações

- [ ] Capturas em todos os viewports de referência e nos temas personalizados de lojas de exemplo.
- [ ] `npm run lint`, `npm test` e `npm run build` sem novos erros.
- [ ] Estados de foco, teclado, contraste e movimento reduzido verificados.
- [ ] Componentes testados em normal, hover, foco, desabilitado, carregamento, erro e vazio.

### Shells e login

- [ ] Todas as rotas admin/master continuam acessíveis apenas ao perfil correto.
- [ ] Item atual da navegação é visual e semanticamente identificado.
- [ ] Navegação funciona por teclado e em 320 px sem corte.
- [ ] Login preserva autocomplete, envio, carregamento e mensagem de erro.

### Loja, produto e carrinho

- [ ] Slug válido, inválido, loja indisponível, loading e erro mantêm o comportamento.
- [ ] Busca/categorias e disponibilidade dos produtos continuam corretas.
- [ ] Adicionais mínimos/máximos, observação e quantidade são preservados.
- [ ] Totais do card, modal e carrinho são idênticos.
- [ ] Modal contém foco, fecha por Escape e devolve foco ao acionador.
- [ ] Cor, logo e banner de diferentes lojas não vazam para a identidade institucional.

### Checkout e acompanhamento

- [ ] Entrega e retirada apresentam somente campos válidos para a opção.
- [ ] Métodos de pagamento respeitam a configuração existente.
- [ ] Validação, envio único, erro e repetição segura continuam funcionando.
- [ ] Resumo e total conferem com o carrinho.
- [ ] Token/slug de acompanhamento válido e inválido são testados.
- [ ] Linha do tempo e contato funcionam em mobile, teclado e leitor de tela.

### Painel da loja

- [ ] Dashboard e métricas preservam valores e estados vazios.
- [ ] Pedidos mantêm filtros, paginação, detalhes e transições permitidas.
- [ ] Produtos, categorias e adicionais mantêm criar, editar, cancelar e disponibilidade.
- [ ] Upload, preview e crop de imagem funcionam nos formatos aceitos.
- [ ] Configurações continuam limitadas pelos entitlements atuais.
- [ ] Todas as ações de tabela estão disponíveis em mobile.

### Painel master

- [ ] Lojas mantêm busca, filtros, paginação, criação e atualização.
- [ ] Pedidos consolidados preservam escopo e dados.
- [ ] Planos e configurações mantêm regras e valores atuais.
- [ ] Área master é distinguível da área da loja em todas as larguras.
- [ ] Nenhuma ação master fica acessível por usuário de loja.

### Landing e consolidação

- [ ] Conteúdo, links, demos, planos, FAQ, WhatsApp e CTAs continuam corretos.
- [ ] Logo e cores institucionais atuais são preservados.
- [ ] Imagens não causam deslocamento excessivo e carregam de forma eficiente.
- [ ] Teste em Chrome, Edge, Firefox e Safari/iOS representativo.
- [ ] Teste com zoom de 200%, teclado, leitor de tela e movimento reduzido.
- [ ] Suite completa, build de produção e comparação visual aprovados antes de cada entrega.

## 10. Identidade institucional versus identidade da loja

### Identidade institucional do PediCampos

Aplica-se à landing page, autenticação, admin, master, mensagens da plataforma e componentes neutros.

- nome e marca PediCampos;
- verde institucional atual (`#16a34a`), verde escuro, grafite, branco e neutros existentes;
- tipografia `Inter`/sistema e linguagem visual limpa;
- cores semânticas, padrões de acessibilidade e componentes-base;
- configurações institucionais já disponíveis no painel master, sem ampliar suas regras nesta etapa.

### Identidade personalizável de cada loja

Aplica-se somente à experiência pública daquela loja e às prévias explicitamente vinculadas a ela.

- nome, logo/iniciais, banner e cor principal da loja;
- `--store-color` como token local, com fallback institucional e validação de contraste;
- informações, catálogo, categorias, produtos e contato pertencentes à loja;
- a personalização não deve modificar admin, master, landing institucional nem outra loja.

### Fronteira obrigatória

Os componentes estruturais, espaçamentos, acessibilidade, tipografia, estados e semântica pertencem ao design system do PediCampos. A loja personaliza conteúdo e acento visual dentro desses limites. Assim, a experiência continua reconhecível como PediCampos sem apagar a identidade comercial de cada estabelecimento.

## Critério de conclusão da V2

A V2 estará pronta quando todas as etapas tiverem comparação visual aprovada, checklists funcionais concluídos, acessibilidade essencial validada, testes/lint/build aprovados e nenhuma mudança não autorizada em regras de negócio, planos, entitlements ou Supabase.
