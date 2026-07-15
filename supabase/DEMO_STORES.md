# Lojas-demo

## Ordem de instalação

1. Execute `migrations/014_demo_stores.sql`.
2. Execute, separadamente, `seeds/neguinhodoacai_demo.sql` e `seeds/gordinhoburguer_demo.sql`.
3. Execute os três arquivos `diagnostics/*demo*_audit.sql`.
4. No Master, escolha `Loja de demonstração`, `Destacar na landing`, ordem e rótulo. A migration e os seeds não modificam a Brasa House e os novos seeds não destacam lojas automaticamente.
5. Crie usuários Admin manualmente conforme `diagnostics/demo_store_admin_user_template.sql`.

Os seeds não criam Auth nem `store_users`, não executam upload e não armazenam senha. Os banners locais continuam compatíveis pelo adaptador de assets; imagens específicas de produtos permanecem pendentes conforme o inventário.

## Checklist para remoção dos mocks após validação

Não remover nada antes de confirmar:

- `/neguinhodoacai` e `/gordinhoburguer` abrem exclusivamente pelo Supabase;
- Master controla `active`, demo, destaque, ordem e rótulo;
- Landing usa apenas demos remotas e resposta remota vazia não recebe mocks;
- cada Admin acessa somente sua loja;
- catálogo, adicionais, checkout, pedidos e acompanhamento funcionam;
- banners e futuros arquivos de produto continuam aparecendo;
- nenhuma tela depende de snapshots locais dessas lojas.

Depois disso, podem ser removidos, em uma tarefa própria: os dois registros e credenciais fake de `mockStores.js`; os pedidos `1001` e `1002` de `mockOrders.js`; os fallbacks locais dessas lojas em `storage.js`; referências antigas da Landing; e os assets locais somente depois que `banner_url` apontar para Storage e a busca de imports confirmar que ficaram sem uso. As rotas por slug permanecem, pois são as mesmas rotas públicas reais.
