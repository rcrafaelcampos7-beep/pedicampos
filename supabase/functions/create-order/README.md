# create-order Edge Function

Porta HTTP pública para criação de pedidos. Aplica origem, método, Content-Type, 256 KiB de body e rate limit antes de delegar toda validação comercial à RPC `create_public_order`.

## Variáveis server-side

- `SUPABASE_URL`: fornecida pelo ambiente Edge.
- `SUPABASE_SERVICE_ROLE_KEY`: fornecida pelo ambiente Edge; nunca usar prefixo `VITE_` nem expor ao navegador.
- `ORDER_RATE_LIMIT_SALT`: segredo aleatório com pelo menos 32 caracteres.
- `ORDER_ALLOWED_ORIGINS`: lista separada por vírgula. Padrão: `https://pedicampos.com.br,https://www.pedicampos.com.br`.
- `ORDER_ALLOW_LOCALHOST=true`: apenas desenvolvimento local.

## Deploy

```bash
supabase secrets set ORDER_RATE_LIMIT_SALT="<SEGREDO-ALEATORIO>"
supabase secrets set ORDER_ALLOWED_ORIGINS="https://pedicampos.com.br,https://www.pedicampos.com.br"
supabase functions deploy create-order --no-verify-jwt
```

Execute a migration 015 antes do deploy coordenado do frontend. `--no-verify-jwt` é necessário porque checkout é público; segurança vem de origem, limites, hash de IP, RLS/RPC e validação completa no banco.

Para desenvolvimento com `supabase functions serve`, configure um arquivo local não versionado com o salt e `ORDER_ALLOW_LOCALHOST=true`. O frontend possui `VITE_USE_DIRECT_ORDER_RPC=true` somente como escape temporário em DEV; nunca configure isso na Vercel.

## Limites e observação

- 10 tentativas/IP em 1 minuto.
- 30 tentativas/IP em 10 minutos.
- 5 falhas por loja/chave em 5 minutos.
- Body máximo: 262.144 bytes.
- Registros expiram em 15 minutos e até 100 expirados são removidos oportunisticamente a cada chamada permitida ao limitador.

O IP é obtido de headers do gateway e armazenado apenas como SHA-256 com salt secreto. Proxies, VPN, CGNAT e redes compartilhadas podem agrupar clientes; monitore 429 por `requestId` e ajuste limites somente com evidência. Payload, cliente, telefone, endereço e IP puro não são logados.

## Rollback

1. Pare o deploy do frontend novo ou restaure a versão anterior.
2. Execute `diagnostics/015_order_rate_limit_rollback.sql` para restaurar temporariamente o grant direto.
3. Investigue a Edge Function; não remova idempotência nem os limites da RPC.
4. A tabela pode permanecer sem risco público. Só a remova em manutenção explícita após confirmar que não é mais usada.

## Checklist

- Testar origem oficial e rejeição de origem externa.
- Testar localhost somente com a flag local.
- Confirmar 429 e `Retry-After`.
- Repetir a mesma idempotency key e confirmar mesmo pedido.
- Confirmar que anon não executa a RPC diretamente após migration 015.
- Confirmar que logs contêm apenas área, operação, código, storeId e requestId.
