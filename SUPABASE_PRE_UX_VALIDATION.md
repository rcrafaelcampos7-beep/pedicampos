# Checklist manual Supabase pré-UX

Este checklist valida o ambiente remoto antes da nova experiência pública. Nenhuma etapa deve usar dados pessoais ou uma loja importante. Use uma loja e pedidos temporários identificáveis.

Status do diagnóstico estrutural em 17/07/2026: `PRE_UX_REMOTE_GATE = PASS`. Esse resultado confirma o gate consolidado de catálogos, grants, funções, RLS, Storage e índices; as validações funcionais das seções seguintes continuam necessárias antes de produção.

## 1. Diagnóstico somente leitura

1. Abra o projeto correto no Supabase Dashboard.
2. Entre em **SQL Editor** e crie uma nova consulta.
3. Copie integralmente `supabase/diagnostics/pre_ux_remote_validation.sql`.
4. Execute a consulta. Ela lê apenas catálogos, grants, policies, buckets, triggers e índices; não lê clientes ou pedidos.
5. Salve ou copie todas as grades de resultado e envie-as para análise, sem incluir chaves ou variáveis de ambiente.
6. Não execute migrations para tentar corrigir resultados antes da análise.

Resultados essenciais esperados:

- As tabelas listadas existem e possuem RLS habilitado.
- `order_rate_limit_attempts` existe, possui RLS e não possui policy pública.
- `create_public_order(uuid,uuid,jsonb,text,jsonb,text,text,jsonb)` usa `SECURITY DEFINER`, owner controlado e `search_path` fixo.
- `anon` e `authenticated` não executam diretamente a assinatura atual de `create_public_order`; `service_role` executa.
- `get_public_order(uuid,text)` continua disponível aos papéis necessários para tracking.
- `anon` não possui INSERT/UPDATE/DELETE direto nas tabelas privadas de pedidos.
- Os buckets `store-assets` e `product-images` existem com limites e MIME types esperados.

## 2. Edge Function `create-order`

1. Em **Edge Functions → create-order → Logs**, confirme que a função publicada recebe pedidos do domínio oficial.
2. Confirme que os secrets server-side `ORDER_RATE_LIMIT_SALT` e `ORDER_ALLOWED_ORIGINS` estão configurados. Não copie seus valores para o frontend ou para este relatório.
3. Confirme a política desejada para `ORDER_ALLOW_LOCALHOST`; o remoto normalmente deve permanecer `false`.
4. Verifique que logs não exibem body, telefone, endereço, token público, chave Pix ou dados do cliente.

O comando abaixo será necessário somente quando o código local da Edge ainda não corresponder à versão publicada ou quando a função ainda não existir. **Não o execute antes de revisar o diagnóstico e coordenar o frontend/migration 015:**

```powershell
npx supabase functions deploy create-order --no-verify-jwt
```

`--no-verify-jwt` é necessário porque clientes anônimos criam pedidos, enquanto origem, rate limit, payload e RPC continuam sendo validados pela própria Edge.

## 3. Pedido e idempotência no domínio

1. Abra uma loja temporária ativa pelo domínio oficial.
2. Monte um pedido delivery com um produto, um adicional grátis e um pago.
3. Finalize uma vez e confirme sucesso, token de acompanhamento e presença no Admin da mesma loja.
4. Para testar idempotência de forma controlada, repita exatamente a mesma chamada com a mesma chave usando uma ferramenta autorizada de desenvolvimento; confirme mesmo ID, número e token e apenas uma linha em `orders`.
5. Não exponha a chave de idempotência em capturas públicas; ela não contém PII, mas pertence ao fluxo do teste.

## 4. Rate limit

1. Use somente loja/cliente temporários e uma janela coordenada.
2. Repita tentativas até obter `429` e confirme `Retry-After`.
3. Verifique nos logs apenas `requestId`, código seguro e contexto permitido.
4. Aguarde a janela expirar e confirme que um novo pedido válido volta a funcionar.
5. Monitore possíveis efeitos de CGNAT/VPN; não reduza limites sem evidência.

## 5. Isolamento Loja A × Loja B

1. Crie ou use duas lojas de teste e dois usuários Auth vinculados separadamente em `store_users`.
2. Como usuário A, liste e altere somente categorias, produtos, adicionais, configurações e pedidos da Loja A.
3. Tente consultar ou alterar IDs da Loja B; a operação deve falhar ou retornar vazio.
4. Repita no sentido inverso.
5. Como Master, confirme acesso global previsto sem conceder esse acesso aos usuários das lojas.

## 6. Status e acompanhamento

1. No Admin da loja correta, altere o status de um pedido de teste.
2. Abra o tracking em outra sessão e confirme o novo status.
3. Valide separadamente delivery e pickup, inclusive “Saiu para entrega” e “Pronto para retirada”.
4. Confirme que token de outra loja combinado com slug incorreto não retorna pedido.

## 7. Storage e imagens

1. Envie, recorte e salve uma logo, um banner e uma imagem de produto temporários.
2. Confirme paths no formato de tenant esperado nos buckets corretos.
3. Substitua cada imagem e confirme que a URL do banco só muda após upload confirmado.
4. Simule uma falha de banco em ambiente de teste e confirme preservação da imagem antiga e limpeza da nova quando possível.
5. Confirme que usuário da Loja A não grava no diretório da Loja B.

## 8. START, PRO e PREMIUM

1. Use três lojas temporárias, uma por plano.
2. Compare as features retornadas por `get_store_entitlements` com `plans.feature_flags`.
3. Confirme os bloqueios já existentes no Admin e checkout.
4. Não altere preços, chaves de plano ou regras durante esta validação.

## 9. Rotas Vercel

Faça refresh direto, em janela anônima quando aplicável, nas rotas:

- Landing e `/:slug`.
- `/:slug/checkout`.
- `/:slug/pedido/:token`.
- `/admin` e páginas internas.
- `/master` e páginas internas.

Todas devem restaurar a SPA sem 404, preservar a sessão autorizada e impedir acesso quando não autenticado.

## 10. Evidências a devolver

- Todas as grades do SQL de diagnóstico.
- Resultado de pedido, idempotência, 429 e tracking, sem PII.
- Resultado do isolamento Loja A × Loja B.
- Resultado dos três planos.
- Confirmação das rotas e uploads.
- Versão/data do deploy da Edge, sem secrets.
