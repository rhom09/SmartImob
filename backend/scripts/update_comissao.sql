-- Atualiza contratos existentes com percentual de comissão
-- Contratos com valor >= 3000 usam 10%, outros usam 8%
UPDATE "CONTRATOS"
SET "percentual_comissao" = CASE
  WHEN ("valor_aluguel"::decimal >= 3000) THEN 10
  ELSE 8
END
WHERE "percentual_comissao" IS NULL OR "percentual_comissao" = 8;