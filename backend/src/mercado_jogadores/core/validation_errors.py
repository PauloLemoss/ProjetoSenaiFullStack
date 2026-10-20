"""Traducao de erros de validacao do Pydantic (`exc.errors()`) para a lista
`errors` do corpo de resposta `400` (capability `api-conventions`).

Regras (ver `design.md`, decisao 2):

- `value_error` (validators customizados de campo ou cruzados): reusa o texto
  original em portugues, removendo o prefixo "Value error, " que o Pydantic v2
  coloca na frente do `msg`.
- `greater_than_equal` / `less_than_equal` (faixas de `Field(ge=.., le=..)`):
  mensagem completa a partir de uma tabela estatica campo -> (rotulo, min, max),
  com os mesmos rotulos e faixas dos labels do frontend.
- `string_too_short` / `string_too_long` e `missing`: mensagem construida a
  partir do `ctx` do Pydantic e do rotulo do campo.
- Demais tipos: mensagem generica a partir do `ctx`, ainda assim especifica ao
  campo (nunca o texto fixo antigo).
- `field`: ultimo segmento de `loc` quando corresponde a um nome de campo do
  schema (ex.: `("age",)` e `("body", "age")` -> `"age"`); `None` quando `loc`
  esta vazio ou aponta para algo que nao e campo do formulario (ex.: corpo que
  nao e um objeto JSON).
"""

_CAMPOS_DO_FORMULARIO = frozenset(
    {
        "name",
        "position",
        "agility",
        "age",
        "pace",
        "shooting",
        "passing",
        "dribbling",
        "defending",
        "physical",
        "potential",
        "acronym",
        "club_id",
        "loyalty_until",
        "player_ids",
    }
)

# Mensagens para combinações (campo, type) que nao se encaixam bem nos
# templates existentes (faixa numerica, tamanho de texto), consultadas antes
# dos outros ramos de `traduzir_erros_de_validacao`.
_MENSAGENS_PERSONALIZADAS: dict[tuple[str, str], str] = {
    ("club_id", "missing"): "Selecione um clube.",
    ("club_id", "greater_than"): "Selecione um clube válido.",
    ("player_ids", "too_short"): "A escalação precisa ter exatamente 5 titulares.",
    ("player_ids", "too_long"): "A escalação precisa ter exatamente 5 titulares.",
}

# (rotulo em portugues, valor minimo, valor maximo) para as faixas numericas
# de Field(ge=.., le=..) — mesmos rotulos e faixas dos labels do frontend.
_FAIXA_NUMERICA_POR_CAMPO = {
    "age": ("Idade", 16, 45),
    "agility": ("Agilidade", 1, 100),
    "pace": ("Velocidade", 1, 99),
    "shooting": ("Finalização", 1, 99),
    "passing": ("Passe", 1, 99),
    "dribbling": ("Drible", 1, 99),
    "defending": ("Defesa", 1, 99),
    "physical": ("Físico", 1, 99),
    "potential": ("Potencial", 1, 99),
}

_ROTULO_POR_CAMPO = {
    **{campo: rotulo for campo, (rotulo, _, _) in _FAIXA_NUMERICA_POR_CAMPO.items()},
    "name": "Nome",
    "position": "Posição",
    "acronym": "Sigla",
    "club_id": "Clube",
    "loyalty_until": "Fim da fidelidade",
    "player_ids": "Jogadores escalados",
}

_PREFIXO_PYDANTIC = "Value error, "


def _campo_de_loc(loc: tuple) -> str | None:
    """Ultimo segmento de `loc` se for um nome de campo do schema, senao None."""
    if not loc:
        return None
    segmento = loc[-1]
    return segmento if isinstance(segmento, str) and segmento in _CAMPOS_DO_FORMULARIO else None


def _rotulo(campo: str | None) -> str:
    if campo is None:
        return "campo"
    return _ROTULO_POR_CAMPO.get(campo, campo)


def _mensagem_por_faixa(campo: str | None) -> str | None:
    faixa = _FAIXA_NUMERICA_POR_CAMPO.get(campo) if campo else None
    if faixa is None:
        return None
    rotulo, minimo, maximo = faixa
    return f"{rotulo} deve ser um número inteiro de {minimo} a {maximo}."


def _mensagem_generica(tipo: str, campo: str | None, ctx: dict) -> str:
    rotulo = _rotulo(campo)
    detalhes = "; ".join(f"{chave}={valor}" for chave, valor in ctx.items() if chave != "error")
    if detalhes:
        return f"Campo {rotulo} inválido ({tipo}: {detalhes})."
    return f"Campo {rotulo} inválido ({tipo})."


def traduzir_erros_de_validacao(erros_pydantic: list[dict]) -> list[dict]:
    """Converte `exc.errors()` do Pydantic na lista `errors` do corpo 400.

    Cada item e `{"field": str | None, "message": str}` com mensagem em
    portugues e nunca vazia.
    """
    traduzidos: list[dict] = []
    for erro in erros_pydantic:
        tipo = erro["type"]
        campo = _campo_de_loc(erro.get("loc") or ())
        ctx = erro.get("ctx") or {}
        msg_pydantic = erro.get("msg") or ""

        chave_personalizada = (campo, tipo) if campo is not None else None
        if chave_personalizada is not None and chave_personalizada in _MENSAGENS_PERSONALIZADAS:
            traduzidos.append(
                {"field": campo, "message": _MENSAGENS_PERSONALIZADAS[chave_personalizada]}
            )
            continue

        if tipo == "value_error":
            mensagem = msg_pydantic
            mensagem = mensagem.removeprefix(_PREFIXO_PYDANTIC)
            mensagem = mensagem.strip() or "Valor inválido."
        elif tipo in ("greater_than_equal", "less_than_equal"):
            mensagem = _mensagem_por_faixa(campo)
            if mensagem is None:
                mensagem = _mensagem_generica(tipo, campo, ctx)
        elif tipo == "string_too_short":
            minimo = ctx.get("min_length")
            rotulo = _rotulo(campo)
            if minimo is not None:
                mensagem = f"{rotulo} deve ter pelo menos {minimo} caracteres."
            else:
                mensagem = _mensagem_generica(tipo, campo, ctx)
        elif tipo == "string_too_long":
            maximo = ctx.get("max_length")
            rotulo = _rotulo(campo)
            if maximo is not None:
                mensagem = f"{rotulo} não pode exceder {maximo} caracteres."
            else:
                mensagem = _mensagem_generica(tipo, campo, ctx)
        elif tipo == "missing":
            mensagem = f"O campo {_rotulo(campo)} é obrigatório."
        else:
            mensagem = _mensagem_generica(tipo, campo, ctx)

        traduzidos.append({"field": campo, "message": mensagem})
    return traduzidos
