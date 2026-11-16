// Scientific/export snapshot excludes Google grounded output, links and suggestions.
export function scientificSnapshot(result) {
  if (!result.discovery) return result;
  const {
    text,
    citations,
    queries,
    supports,
    search_entry_html,
    usage,
    ...independent
  } = result.discovery;
  return {
    ...result,
    discovery: {
      ...independent,
      status:
        result.discovery.status === "available"
          ? "not_stored"
          : result.discovery.status,
      message:
        result.discovery.status === "available"
          ? "Pesquisa Google exibida somente na sessão; conteúdo grounded não integra o arquivo científico."
          : result.discovery.message,
    },
  };
}
