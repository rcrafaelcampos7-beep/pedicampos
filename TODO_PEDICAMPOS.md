# TODO - PediCampos

Atualizado em: 2026-07-09

Legenda:

- [x] concluido claramente no codigo atual.
- [ ] pendente, precisa testar/corrigir/implementar futuramente.

## Urgente

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
- [ ] Proxima tarefa real: testar fluxo completo de pedido de ponta a ponta.
- [ ] Testar fluxo completo com dados ja migrados no localStorage.
- [ ] Validar em navegador real as rotas principais.

## Bugs visuais

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
- [ ] Criar botao/fluxo de reset de dados se desejado.
- [ ] Documentar rotina manual para limpar localStorage durante testes.
- [ ] Preparar modelo para migrar a Supabase.

## Integracoes futuras

- [ ] Supabase database.
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
