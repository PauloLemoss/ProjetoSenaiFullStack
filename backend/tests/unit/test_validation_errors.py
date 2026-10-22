from mercado_jogadores.core.validation_errors import traduzir_erros_de_validacao


def _erro(tipo: str, loc: tuple, msg: str = "x", ctx: dict | None = None) -> dict:
    return {"type": tipo, "loc": loc, "msg": msg, "ctx": ctx or {}}


def test_value_error_remove_prefixo_pydantic_e_mantem_texto_em_portugues() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "value_error",
                ("body", "name"),
                "Value error, O nome precisa ter pelo menos duas palavras.",
            )
        ]
    )
    assert erros == [{"field": "name", "message": "O nome precisa ter pelo menos duas palavras."}]


def test_greater_than_equal_usa_faixa_da_tabela() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "greater_than_equal",
                ("body", "age"),
                "Input should be greater than or equal to 16",
                {"ge": 16},
            )
        ]
    )
    assert erros == [{"field": "age", "message": "Idade deve ser um número inteiro de 16 a 45."}]


def test_less_than_equal_usa_faixa_da_tabela() -> None:
    erros = traduzir_erros_de_validacao(
        [_erro("less_than_equal", ("age",), "Input should be less than or equal to 45", {"le": 45})]
    )
    assert erros == [{"field": "age", "message": "Idade deve ser um número inteiro de 16 a 45."}]


def test_missing_campo_obrigatorio() -> None:
    erros = traduzir_erros_de_validacao([_erro("missing", ("body", "potential"))])
    assert erros == [{"field": "potential", "message": "O campo Potencial é obrigatório."}]


def test_string_too_short_usa_ctx() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "string_too_short",
                ("body", "name"),
                "String should have at least 3 characters",
                {"min_length": 3},
            )
        ]
    )
    assert erros == [{"field": "name", "message": "Nome deve ter pelo menos 3 caracteres."}]


def test_string_too_long_usa_ctx() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "string_too_long",
                ("body", "name"),
                "String should have at most 100 characters",
                {"max_length": 100},
            )
        ]
    )
    assert erros == [{"field": "name", "message": "Nome não pode exceder 100 caracteres."}]


def test_tipo_desconhecido_usa_ctx_do_pydantic() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "enum",
                ("body", "position"),
                "Input should be 'GOL', 'ZAG', 'LAT', 'MEI' or 'ATA'",
                {"expected": "'GOL', 'ZAG', 'LAT', 'MEI' or 'ATA'"},
            )
        ]
    )
    assert erros == [
        {
            "field": "position",
            "message": "Campo Posição inválido (enum: expected='GOL', 'ZAG', 'LAT', 'MEI' or 'ATA').",
        }
    ]


def test_loc_vazio_retorna_field_nulo() -> None:
    erros = traduzir_erros_de_validacao(
        [_erro("value_error", (), "Value error, A soma dos seis atributos nao pode passar de 480.")]
    )
    assert erros == [
        {"field": None, "message": "A soma dos seis atributos nao pode passar de 480."}
    ]


def test_loc_body_sem_nome_de_campo_retorna_field_nulo() -> None:
    erros = traduzir_erros_de_validacao(
        [_erro("value_error", ("body",), "Value error, corpo invalido.")]
    )
    assert erros == [{"field": None, "message": "corpo invalido."}]


def test_lista_vazia_retorna_lista_vazia() -> None:
    assert traduzir_erros_de_validacao([]) == []


def test_club_id_reconhecido_como_campo_do_formulario() -> None:
    erros = traduzir_erros_de_validacao([_erro("missing", ("club_id",))])
    assert erros == [{"field": "club_id", "message": "Selecione um clube."}]


def test_loyalty_until_reconhecido_como_campo_do_formulario() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "value_error",
                ("loyalty_until",),
                "Value error, O fim da fidelidade precisa ser uma data futura.",
            )
        ]
    )
    assert erros == [
        {"field": "loyalty_until", "message": "O fim da fidelidade precisa ser uma data futura."}
    ]


def test_player_ids_reconhecido_como_campo_do_formulario() -> None:
    erros = traduzir_erros_de_validacao(
        [_erro("value_error", ("player_ids",), "Value error, xpto.")]
    )
    assert erros == [{"field": "player_ids", "message": "xpto."}]


def test_club_id_missing_usa_mensagem_personalizada() -> None:
    erros = traduzir_erros_de_validacao([_erro("missing", ("club_id",))])
    assert erros == [{"field": "club_id", "message": "Selecione um clube."}]


def test_club_id_greater_than_usa_mensagem_personalizada() -> None:
    erros = traduzir_erros_de_validacao(
        [_erro("greater_than", ("club_id",), "Input should be greater than 0", {"gt": 0})]
    )
    assert erros == [{"field": "club_id", "message": "Selecione um clube válido."}]


def test_player_ids_too_short_usa_mensagem_personalizada() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "too_short",
                ("player_ids",),
                "List should have at least 5 items",
                {"min_length": 5, "actual_length": 4},
            )
        ]
    )
    assert erros == [
        {"field": "player_ids", "message": "A escalação precisa ter exatamente 5 titulares."}
    ]


def test_player_ids_too_long_usa_mensagem_personalizada() -> None:
    erros = traduzir_erros_de_validacao(
        [
            _erro(
                "too_long",
                ("player_ids",),
                "List should have at most 5 items",
                {"max_length": 5, "actual_length": 6},
            )
        ]
    )
    assert erros == [
        {"field": "player_ids", "message": "A escalação precisa ter exatamente 5 titulares."}
    ]
