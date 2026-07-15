# Inventário de imagens das lojas-demo legadas

Auditoria de `src/data/mockStores.js` em 15/07/2026. Nenhuma URL externa ou objeto do Supabase Storage foi encontrado nesses dois mocks.

| Loja | Uso | Referência atual | Origem | Migração futura |
|---|---|---|---|---|
| Neguinho do Açaí | Banner | `src/assets/neguinho-banner.webp` | asset local, 1440×576, ~123 KB | enviar ao bucket de lojas e trocar `banner_url` |
| Neguinho do Açaí | Logo | iniciais `NA` | texto de fallback | logo real opcional; iniciais ficam em `store_settings.extra.fallbackInitials` |
| Gordinho Burguer | Banner | `src/assets/gordinho-banner.webp` | asset local, 1440×614, ~86 KB | enviar ao bucket de lojas e trocar `banner_url` |
| Gordinho Burguer | Logo | iniciais `GB` | texto de fallback | logo real opcional; iniciais ficam em `store_settings.extra.fallbackInitials` |

Todos os nove produtos de cada mock apontavam para o banner da própria loja. Portanto, não havia imagem específica de produto a copiar. Os seeds registram `image_url = null` somente na criação e nunca substituem uma imagem já existente. Assim, os 18 produtos abaixo ficam pendentes de arquivos próprios em `product-images/{storeId}/{productId}/{arquivo}.webp`:

- Neguinho: Açaí 300ml, Açaí 500ml, Açaí 700ml, Barca de Açaí, Milk-shake de Morango, Milk-shake de Chocolate, Combo Casal, Coca-Cola lata e Água mineral.
- Gordinho: X-Bacon Artesanal, Smash Duplo, Gordinho Especial, Hot Dog Completo, Combo Smash + Batata, Combo Família, Batata Frita, Coca-Cola 1L e Guaraná lata.

Até a migração ao Storage, os banners usam referências estáveis `asset:demo/.../banner`, resolvidas por `src/utils/demoAssets.js`. Isso preserva os assets atuais sem inventar uma URL remota ou gravar um caminho Vite com hash no banco.
