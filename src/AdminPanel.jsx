import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const SENHA_ADMIN = process.env.REACT_APP_ADMIN_PASSWORD;

const STATUS_OPCOES = ["Novo", "Em análise", "Aprovado", "Entrevista", "Reprovado", "Desistiu"];

const STATUS_CLASSE = {
  Novo: "badge-novo",
  "Em análise": "badge-analise",
  Aprovado: "badge-aprovado",
  Entrevista: "badge-entrevista",
  Reprovado: "badge-reprovado",
  Desistiu: "badge-desistiu",
};

function formatarData(dataIso) {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function linkWhatsApp(telefone, nome) {
  const numero = (telefone || "").replace(/\D/g, "");
  const numeroCompleto = numero.length <= 11 ? `55${numero}` : numero;
  const mensagem = encodeURIComponent(
    `Olá ${nome}, tudo bem? Aqui é da Genthe Consultoria, referente ao processo seletivo para a vaga de Assistente de Marketing.`
  );
  return `https://wa.me/${numeroCompleto}?text=${mensagem}`;
}

function CartaoCandidato({ candidato, expandido, onExpandir, onAtualizarStatus }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => onExpandir(candidato.id)}
      >
        <div>
          <strong>{candidato.nome}</strong>
          <div style={{ fontSize: 13, color: "#5b6470" }}>
            {candidato.cidade_bairro} · {formatarData(candidato.created_at)}
          </div>
        </div>
        <span className={`badge ${STATUS_CLASSE[candidato.status] || "badge-novo"}`}>
          {candidato.status || "Novo"}
        </span>
      </div>

      {expandido && (
        <div style={{ marginTop: 18, borderTop: "1px solid #e0e5ea", paddingTop: 16 }}>
          <p><strong>CPF:</strong> {candidato.cpf}</p>
          <p><strong>Idade:</strong> {candidato.idade}</p>
          <p><strong>Estado civil:</strong> {candidato.estado_civil}</p>
          <p><strong>Tem filhos:</strong> {candidato.tem_filhos}</p>
          <p><strong>Telefone:</strong> {candidato.telefone}</p>
          <p><strong>Email:</strong> {candidato.email}</p>
          <hr style={{ border: "none", borderTop: "1px solid #e0e5ea", margin: "14px 0" }} />
          <p><strong>Tempo de experiência com redes sociais:</strong> {candidato.tempo_experiencia_redes}</p>
          <p><strong>Redes já gerenciadas:</strong> {(candidato.redes_gerenciadas || []).join(", ")}</p>
          <p><strong>Ferramentas de conteúdo:</strong> {(candidato.ferramentas_conteudo || []).join(", ")}</p>
          <p><strong>Portfólio / exemplos:</strong> {candidato.portfolio}</p>
          <p><strong>Experiência com vendas via WhatsApp:</strong> {candidato.experiencia_vendas_whatsapp}</p>
          <p><strong>Descrição da experiência com vendas:</strong> {candidato.descricao_vendas_whatsapp}</p>
          <p><strong>Experiência com agências/fornecedores:</strong> {candidato.experiencia_agencia_fornecedor}</p>
          <p><strong>Nível de Excel:</strong> {candidato.nivel_excel}</p>
          <p><strong>Disponibilidade de horário:</strong> {candidato.disponibilidade_horario}</p>
          <p><strong>Pretensão salarial compatível:</strong> {candidato.pretensao_salarial}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={candidato.status || "Novo"}
              onChange={(e) => onAtualizarStatus(candidato.id, e.target.value)}
              style={{ maxWidth: 200 }}
            >
              {STATUS_OPCOES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <a
              href={linkWhatsApp(candidato.telefone, candidato.nome)}
              target="_blank"
              rel="noreferrer"
            >
              <button className="btn-primario" type="button">📲 Chamar no WhatsApp</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [expandidoId, setExpandidoId] = useState(null);

  const buscarCandidatos = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("candidatos_marketing")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setCandidatos(data || []);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (autenticado) {
      buscarCandidatos();
    }
  }, [autenticado, buscarCandidatos]);

  const entrar = () => {
    if (senhaDigitada === SENHA_ADMIN) {
      setAutenticado(true);
      setErroSenha("");
    } else {
      setErroSenha("Senha incorreta.");
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    setCandidatos((anterior) =>
      anterior.map((c) => (c.id === id ? { ...c, status: novoStatus } : c))
    );
    await supabase.from("candidatos_marketing").update({ status: novoStatus }).eq("id", id);
  };

  const alternarExpandido = (id) => {
    setExpandidoId((atual) => (atual === id ? null : id));
  };

  const candidatosFiltrados = candidatos.filter((c) => {
    const combinaBusca =
      !busca ||
      (c.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(busca.toLowerCase()) ||
      (c.cpf || "").includes(busca);
    const combinaStatus = filtroStatus === "Todos" || c.status === filtroStatus;
    return combinaBusca && combinaStatus;
  });

  if (!autenticado) {
    return (
      <div className="container" style={{ maxWidth: 400, paddingTop: 80 }}>
        <div className="card">
          <h2>Painel Genthe</h2>
          <p style={{ fontSize: 14, color: "#5b6470" }}>Assistente de Marketing</p>
          <div className="campo">
            <label>Senha de acesso</label>
            <input
              type="password"
              value={senhaDigitada}
              onChange={(e) => setSenhaDigitada(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && entrar()}
            />
          </div>
          {erroSenha && <div className="erro-texto">{erroSenha}</div>}
          <button className="btn-primario" onClick={entrar} style={{ width: "100%" }}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h2>Painel · Assistente de Marketing</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por nome, email ou CPF"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="Todos">Todos os status</option>
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-secundario" onClick={buscarCandidatos}>
          Atualizar
        </button>
      </div>

      <p style={{ fontSize: 13, color: "#5b6470", marginBottom: 16 }}>
        {candidatosFiltrados.length} candidato(s) encontrado(s)
      </p>

      {carregando && <p>Carregando...</p>}

      {!carregando &&
        candidatosFiltrados.map((candidato) => (
          <CartaoCandidato
            key={candidato.id}
            candidato={candidato}
            expandido={expandidoId === candidato.id}
            onExpandir={alternarExpandido}
            onAtualizarStatus={atualizarStatus}
          />
        ))}

      {!carregando && candidatosFiltrados.length === 0 && <p>Nenhum candidato encontrado.</p>}
    </div>
  );
}

export default AdminPanel;
