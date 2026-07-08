import React, { useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

const INSCRICOES_ENCERRADAS = process.env.REACT_APP_INSCRICOES_ENCERRADAS === "true";

function maskCPF(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskTelefone(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const CAMPO_TEXTO_CURTO = "texto_curto";
const CAMPO_TEXTO_LONGO = "texto_longo";
const CAMPO_UNICA = "unica";
const CAMPO_MULTIPLA = "multipla";
const CAMPO_CPF = "cpf";
const CAMPO_TELEFONE = "telefone";
const CAMPO_EMAIL = "email";
const CAMPO_NUMERO = "numero";

const PERGUNTAS = [
  { id: "nome", titulo: "Qual é o seu nome completo?", tipo: CAMPO_TEXTO_CURTO },
  { id: "cpf", titulo: "Qual é o seu CPF?", tipo: CAMPO_CPF },
  { id: "idade", titulo: "Qual é a sua idade?", tipo: CAMPO_NUMERO },
  {
    id: "estadoCivil",
    titulo: "Qual é o seu estado civil?",
    tipo: CAMPO_UNICA,
    opcoes: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"],
  },
  {
    id: "temFilhos",
    titulo: "Você tem filhos?",
    tipo: CAMPO_UNICA,
    opcoes: ["Sim", "Não"],
  },
  { id: "cidadeBairro", titulo: "Em qual cidade e bairro você mora?", tipo: CAMPO_TEXTO_CURTO },
  { id: "telefone", titulo: "Qual é o seu telefone com WhatsApp?", tipo: CAMPO_TELEFONE },
  { id: "email", titulo: "Qual é o seu email?", tipo: CAMPO_EMAIL },
  {
    id: "tempoExperienciaRedes",
    titulo: "Há quanto tempo você tem experiência gerindo redes sociais de uma empresa ou marca?",
    tipo: CAMPO_UNICA,
    opcoes: [
      "Não tenho experiência profissional",
      "Menos de 1 ano",
      "Entre 1 e 2 anos",
      "Entre 2 e 5 anos",
      "Mais de 5 anos",
    ],
  },
  {
    id: "redesGerenciadas",
    titulo: "Quais redes sociais você já geriu profissionalmente?",
    subtitulo: "Selecione todas as que se aplicam",
    tipo: CAMPO_MULTIPLA,
    opcoes: ["Instagram", "Facebook", "TikTok", "WhatsApp Business", "YouTube", "Nenhuma"],
  },
  {
    id: "ferramentasConteudo",
    titulo: "Quais ferramentas de criação de conteúdo você domina?",
    subtitulo: "Selecione todas as que se aplicam",
    tipo: CAMPO_MULTIPLA,
    opcoes: ["Canva", "CapCut", "InShot", "Adobe (Photoshop, Premiere ou similar)", "Nenhuma", "Outra"],
  },
  {
    id: "portfolio",
    titulo: "Compartilhe um link de portfólio, perfil no Instagram ou exemplos de conteúdo que você já criou",
    subtitulo: "Se não tiver, escreva Não possuo",
    tipo: CAMPO_TEXTO_LONGO,
  },
  {
    id: "experienciaVendasWhatsapp",
    titulo: "Você já teve experiência respondendo clientes ou realizando vendas pelo WhatsApp?",
    tipo: CAMPO_UNICA,
    opcoes: ["Sim, com bastante experiência", "Sim, um pouco de experiência", "Não tenho experiência"],
  },
  {
    id: "descricaoVendasWhatsapp",
    titulo: "Descreva brevemente como foi essa experiência",
    subtitulo: "Se não tiver experiência, escreva Não se aplica",
    tipo: CAMPO_TEXTO_LONGO,
  },
  {
    id: "experienciaAgenciaFornecedor",
    titulo: "Você já teve experiência fazendo contato direto com agências de marketing ou fornecedores?",
    tipo: CAMPO_UNICA,
    opcoes: ["Sim", "Não"],
  },
  {
    id: "nivelExcel",
    titulo: "Qual é o seu nível de conhecimento no Pacote Office, especialmente Excel?",
    tipo: CAMPO_UNICA,
    opcoes: ["Básico", "Intermediário", "Avançado", "Não tenho conhecimento"],
  },
  {
    id: "disponibilidadeHorario",
    titulo:
      "A vaga tem horário de segunda a sexta das 09h às 18h e sábado das 09h às 13h. Você tem disponibilidade total para esse horário?",
    tipo: CAMPO_UNICA,
    opcoes: ["Sim, tenho disponibilidade total", "Não tenho disponibilidade total"],
  },
  {
    id: "pretensaoSalarial",
    titulo:
      "O salário da vaga é de R$ 2.200,00 fixo, com premiação de até R$ 1.000,00 atrelada a metas. Essa condição está de acordo com sua expectativa?",
    tipo: CAMPO_UNICA,
    opcoes: ["Sim, está de acordo", "Está parcialmente de acordo", "Não está de acordo"],
  },
];

const TextoCurto = React.memo(function TextoCurto({ valor, onChange, tipo }) {
  const inputType = tipo === CAMPO_EMAIL ? "email" : "text";
  return (
    <input
      type={inputType}
      value={valor || ""}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      placeholder="Digite sua resposta"
    />
  );
});

const TextoLongo = React.memo(function TextoLongo({ valor, onChange }) {
  return (
    <textarea
      value={valor || ""}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      placeholder="Digite sua resposta"
    />
  );
});

const CampoCPF = React.memo(function CampoCPF({ valor, onChange }) {
  return (
    <input
      type="text"
      value={valor || ""}
      onChange={(e) => onChange(maskCPF(e.target.value))}
      autoFocus
      placeholder="000.000.000-00"
    />
  );
});

const CampoTelefone = React.memo(function CampoTelefone({ valor, onChange }) {
  return (
    <input
      type="tel"
      value={valor || ""}
      onChange={(e) => onChange(maskTelefone(e.target.value))}
      autoFocus
      placeholder="(67) 90000-0000"
    />
  );
});

const CampoNumero = React.memo(function CampoNumero({ valor, onChange }) {
  return (
    <input
      type="number"
      value={valor || ""}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      placeholder="Digite sua resposta"
    />
  );
});

const EscolhaUnica = React.memo(function EscolhaUnica({ opcoes, valor, onChange }) {
  return (
    <div className="opcoes">
      {opcoes.map((opcao) => (
        <label key={opcao} className={`opcao ${valor === opcao ? "selecionada" : ""}`}>
          <input
            type="radio"
            checked={valor === opcao}
            onChange={() => onChange(opcao)}
          />
          {opcao}
        </label>
      ))}
    </div>
  );
});

const EscolhaMultipla = React.memo(function EscolhaMultipla({ opcoes, valor, onChange }) {
  const selecionadas = Array.isArray(valor) ? valor : [];

  const alternar = (opcao) => {
    if (selecionadas.includes(opcao)) {
      onChange(selecionadas.filter((item) => item !== opcao));
    } else {
      onChange([...selecionadas, opcao]);
    }
  };

  return (
    <div className="opcoes">
      {opcoes.map((opcao) => (
        <label key={opcao} className={`opcao ${selecionadas.includes(opcao) ? "selecionada" : ""}`}>
          <input
            type="checkbox"
            checked={selecionadas.includes(opcao)}
            onChange={() => alternar(opcao)}
          />
          {opcao}
        </label>
      ))}
    </div>
  );
});

function respostaValida(pergunta, valor) {
  if (pergunta.tipo === CAMPO_MULTIPLA) {
    return Array.isArray(valor) && valor.length > 0;
  }
  if (pergunta.tipo === CAMPO_NUMERO) {
    return valor !== undefined && valor !== null && String(valor).trim() !== "";
  }
  if (pergunta.tipo === CAMPO_CPF) {
    return typeof valor === "string" && valor.replace(/\D/g, "").length === 11;
  }
  if (pergunta.tipo === CAMPO_TELEFONE) {
    return typeof valor === "string" && valor.replace(/\D/g, "").length >= 10;
  }
  return typeof valor === "string" && valor.trim() !== "";
}

function QuestionarioMarketing() {
  const [etapa, setEtapa] = useState("intro");
  const [passoAtual, setPassoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [aceiteLGPD, setAceiteLGPD] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const atualizarResposta = useCallback((id, valor) => {
    setRespostas((anterior) => ({ ...anterior, [id]: valor }));
    setErro("");
  }, []);

  const iniciarQuestionario = () => {
    if (!aceiteLGPD) {
      setErro("É necessário aceitar os termos para continuar.");
      return;
    }
    setEtapa("perguntas");
  };

  const avancar = () => {
    const pergunta = PERGUNTAS[passoAtual];
    const valor = respostas[pergunta.id];

    if (!respostaValida(pergunta, valor)) {
      setErro("Esta pergunta é obrigatória.");
      return;
    }

    setErro("");
    if (passoAtual === PERGUNTAS.length - 1) {
      enviarRespostas();
    } else {
      setPassoAtual((p) => p + 1);
    }
  };

  const voltar = () => {
    setErro("");
    if (passoAtual === 0) {
      setEtapa("intro");
    } else {
      setPassoAtual((p) => p - 1);
    }
  };

  const enviarRespostas = async () => {
    setEnviando(true);
    setErro("");

    const registro = {
      nome: respostas.nome,
      cpf: respostas.cpf,
      idade: respostas.idade,
      estado_civil: respostas.estadoCivil,
      tem_filhos: respostas.temFilhos,
      cidade_bairro: respostas.cidadeBairro,
      telefone: respostas.telefone,
      email: respostas.email,
      tempo_experiencia_redes: respostas.tempoExperienciaRedes,
      redes_gerenciadas: respostas.redesGerenciadas,
      ferramentas_conteudo: respostas.ferramentasConteudo,
      portfolio: respostas.portfolio,
      experiencia_vendas_whatsapp: respostas.experienciaVendasWhatsapp,
      descricao_vendas_whatsapp: respostas.descricaoVendasWhatsapp,
      experiencia_agencia_fornecedor: respostas.experienciaAgenciaFornecedor,
      nivel_excel: respostas.nivelExcel,
      disponibilidade_horario: respostas.disponibilidadeHorario,
      pretensao_salarial: respostas.pretensaoSalarial,
      status: "Novo",
    };

    const { error } = await supabase.from("candidatos_marketing").insert([registro]);

    setEnviando(false);

    if (error) {
      setErro("Não foi possível enviar suas respostas. Tente novamente em instantes.");
      return;
    }

    setEtapa("concluido");
  };

  if (INSCRICOES_ENCERRADAS) {
    return (
      <div className="container">
        <div className="card tela-final">
          <div className="icone">🔒</div>
          <h2>Inscrições encerradas</h2>
          <p>O período de inscrições para esta vaga foi encerrado. Agradecemos o seu interesse.</p>
        </div>
      </div>
    );
  }

  if (etapa === "intro") {
    return (
      <div>
        <div className="topbar">
          <strong>genthe</strong>
          <span>que entende de gente</span>
        </div>
        <div className="container">
          <div className="card">
            <h2>Vaga: Assistente de Marketing</h2>
            <p>📍 <strong>Cidade:</strong> Campo Grande/MS</p>
            <p>📄 <strong>Contratação:</strong> CLT</p>
            <p>💰 <strong>Salário:</strong> R$ 2.200,00 fixo + até R$ 1.000,00 de premiação atrelada a metas</p>
            <p>🎁 <strong>Benefícios:</strong> Vale Transporte e Vale Alimentação (valores informados na entrevista)</p>
            <p>🕗 <strong>Horário:</strong> segunda a sexta das 09h às 18h e sábado das 09h às 13h</p>

            <h3 style={{ marginTop: 22 }}>📚 Saber</h3>
            <p>✔️ Cursando Marketing, Publicidade ou áreas correlatas</p>
            <p>✔️ Experiência com gestão de redes sociais (Instagram, Facebook, WhatsApp Business)</p>
            <p>✔️ Conhecimento em ferramentas de criação de conteúdo para stories e posts</p>
            <p>✔️ Boa comunicação escrita para atendimento ao cliente via WhatsApp</p>
            <p>✔️ Domínio básico do Pacote Office</p>

            <h3 style={{ marginTop: 22 }}>🧠 Habilidades</h3>
            <p>✨ Criatividade e senso estético para conteúdo digital</p>
            <p>✨ Organização e constância na publicação diária</p>
            <p>✨ Boa comunicação verbal e escrita</p>
            <p>✨ Proatividade no relacionamento com agência e fornecedores</p>
            <p>✨ Agilidade no atendimento ao cliente pelo WhatsApp</p>

            <h3 style={{ marginTop: 22 }}>🛠️ Principais Atividades</h3>
            <p>📌 Cuidar e manter as redes sociais da empresa atualizadas</p>
            <p>📌 Realizar a manutenção diária dos stories</p>
            <p>📌 Fazer contato direto com a agência de marketing</p>
            <p>📌 Fazer contato com fornecedores da empresa</p>
            <p>📌 Responder WhatsApp sobre vendas online</p>

            <p style={{ marginTop: 22 }}>
              Este questionário faz parte do processo seletivo conduzido pela Genthe Consultoria.
              Todas as perguntas são obrigatórias e levam poucos minutos para serem respondidas.
            </p>
            <div className="campo" style={{ marginTop: 24 }}>
              <label className="checkbox-linha">
                <input
                  type="checkbox"
                  checked={aceiteLGPD}
                  onChange={(e) => setAceiteLGPD(e.target.checked)}
                />
                Autorizo a Genthe Consultoria a coletar e utilizar meus dados pessoais exclusivamente
                para fins deste processo seletivo, conforme a Lei Geral de Proteção de Dados (LGPD).
                Estou ciente de que meus dados não serão compartilhados com terceiros sem minha
                autorização e que posso solicitar correção ou exclusão a qualquer momento pelo
                contato@genthe.com.br.
              </label>
            </div>
            {erro && <div className="erro-texto">{erro}</div>}
            <div className="botoes">
              <div />
              <button className="btn-primario" onClick={iniciarQuestionario}>
                Iniciar questionário
              </button>
            </div>
          </div>
        </div>
        <div className="footer-genthe">@gentheconsultoria · contato@genthe.com.br</div>
      </div>
    );
  }

  if (etapa === "concluido") {
    return (
      <div>
        <div className="topbar">
          <strong>genthe</strong>
          <span>que entende de gente</span>
        </div>
        <div className="container">
          <div className="card tela-final">
            <div className="icone">✅</div>
            <h2>Respostas enviadas com sucesso</h2>
            <p>
              Obrigado por participar do nosso processo seletivo. Se você for selecionado para a
              próxima etapa, a Genthe entrará em contato em até 5 dias úteis. Caso não haja contato
              nesse período, entenda que seguimos com outros candidatos nesta etapa.
            </p>
          </div>
        </div>
        <div className="footer-genthe">@gentheconsultoria · contato@genthe.com.br</div>
      </div>
    );
  }

  const pergunta = PERGUNTAS[passoAtual];
  const valorAtual = respostas[pergunta.id];
  const progresso = Math.round(((passoAtual + 1) / PERGUNTAS.length) * 100);

  return (
    <div>
      <div className="topbar">
        <strong>genthe</strong>
        <span>que entende de gente</span>
      </div>
      <div className="container">
        <div className="progresso">
          <div className="progresso-fill" style={{ width: `${progresso}%` }} />
        </div>
        <div className="card">
          <label>
            {pergunta.titulo}
            <span className="obrigatorio">*</span>
          </label>
          {pergunta.subtitulo && (
            <p style={{ marginTop: -6, marginBottom: 16, fontSize: 13, color: "#5b6470" }}>
              {pergunta.subtitulo}
            </p>
          )}

          {pergunta.tipo === CAMPO_TEXTO_CURTO && (
            <TextoCurto valor={valorAtual} onChange={(v) => atualizarResposta(pergunta.id, v)} />
          )}
          {pergunta.tipo === CAMPO_TEXTO_LONGO && (
            <TextoLongo valor={valorAtual} onChange={(v) => atualizarResposta(pergunta.id, v)} />
          )}
          {pergunta.tipo === CAMPO_EMAIL && (
            <TextoCurto
              valor={valorAtual}
              tipo={CAMPO_EMAIL}
              onChange={(v) => atualizarResposta(pergunta.id, v)}
            />
          )}
          {pergunta.tipo === CAMPO_CPF && (
            <CampoCPF valor={valorAtual} onChange={(v) => atualizarResposta(pergunta.id, v)} />
          )}
          {pergunta.tipo === CAMPO_TELEFONE && (
            <CampoTelefone valor={valorAtual} onChange={(v) => atualizarResposta(pergunta.id, v)} />
          )}
          {pergunta.tipo === CAMPO_NUMERO && (
            <CampoNumero valor={valorAtual} onChange={(v) => atualizarResposta(pergunta.id, v)} />
          )}
          {pergunta.tipo === CAMPO_UNICA && (
            <EscolhaUnica
              opcoes={pergunta.opcoes}
              valor={valorAtual}
              onChange={(v) => atualizarResposta(pergunta.id, v)}
            />
          )}
          {pergunta.tipo === CAMPO_MULTIPLA && (
            <EscolhaMultipla
              opcoes={pergunta.opcoes}
              valor={valorAtual}
              onChange={(v) => atualizarResposta(pergunta.id, v)}
            />
          )}

          {erro && <div className="erro-texto">{erro}</div>}

          <div className="botoes">
            <button className="btn-secundario" onClick={voltar} disabled={enviando}>
              Voltar
            </button>
            <button className="btn-primario" onClick={avancar} disabled={enviando}>
              {enviando
                ? "Enviando..."
                : passoAtual === PERGUNTAS.length - 1
                ? "Enviar respostas"
                : "Próxima"}
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "#5b6470", marginTop: 12 }}>
          Pergunta {passoAtual + 1} de {PERGUNTAS.length}
        </p>
      </div>
      <div className="footer-genthe">@gentheconsultoria · contato@genthe.com.br</div>
    </div>
  );
}

export default QuestionarioMarketing;
