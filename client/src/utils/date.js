// Conversão entre o formato ISO (YYYY-MM-DD), usado pelo <input type="date">,
// e o formato pt-BR (DD/MM/YYYY), que a API e o banco já persistem hoje.
//
// IMPORTANTE (armadilha de timezone): NÃO usar `new Date(isoString)`. Esse parse
// é feito em UTC e, em fusos negativos (ex.: America/Sao_Paulo), a data volta
// deslocada em 1 dia. Por isso a conversão aqui é feita apenas quebrando a
// string em componentes (ano / mês / dia) e remontando na outra ordem.

// "2026-09-08" -> "08/09/2026". Entrada fora do padrão ISO -> "".
export function isoParaBr(iso) {
  if (typeof iso !== "string") return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, ano, mes, dia] = match;
  return `${dia}/${mes}/${ano}`;
}

// "08/09/2026" -> "2026-09-08". Qualquer coisa fora do padrão DD/MM/YYYY -> "".
// Serve para pré-preencher o <input type="date"> a partir de um valor já salvo.
// Datas legadas em texto livre (ex.: "16 de abril") não casam com o padrão e
// retornam "", fazendo o input renderizar vazio sem quebrar.
export function brParaIso(br) {
  if (typeof br !== "string") return "";
  const match = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, dia, mes, ano] = match;
  return `${ano}-${mes}-${dia}`;
}
