-- Tabela principal de playlists
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  codigo_unico VARCHAR(6) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de mídias
CREATE TABLE IF NOT EXISTS midias (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  anunciante VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Video', 'Image', 'Widget')),
  duracao VARCHAR(10) NOT NULL,
  dias_exibicao INTEGER DEFAULT 7,
  status VARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  url_midia TEXT,
  url_cta TEXT,
  thumbnail TEXT,
  ordem INTEGER DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  midia_id INTEGER NOT NULL REFERENCES midias(id) ON DELETE CASCADE,
  habilitado BOOLEAN DEFAULT false,
  dias_semana INTEGER[] DEFAULT '{}',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de horários de exibição
CREATE TABLE IF NOT EXISTS horarios_exibicao (
  id SERIAL PRIMARY KEY,
  agendamento_id INTEGER NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para links curtos (compartilhamento)
CREATE TABLE IF NOT EXISTS links_compartilhamento (
  id SERIAL PRIMARY KEY,
  codigo_curto VARCHAR(6) UNIQUE NOT NULL,
  dados_playlist JSONB NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  visualizacoes INTEGER DEFAULT 0
);

-- Tabela de estatísticas de reprodução
CREATE TABLE IF NOT EXISTS estatisticas_reproducao (
  id SERIAL PRIMARY KEY,
  midia_id INTEGER NOT NULL REFERENCES midias(id) ON DELETE CASCADE,
  data_reproducao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duracao_segundos INTEGER NOT NULL,
  localidade VARCHAR(255)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_midias_status ON midias(status);
CREATE INDEX IF NOT EXISTS idx_midias_ordem ON midias(ordem);
CREATE INDEX IF NOT EXISTS idx_agendamentos_midia ON agendamentos(midia_id);
CREATE INDEX IF NOT EXISTS idx_horarios_agendamento ON horarios_exibicao(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_links_codigo ON links_compartilhamento(codigo_curto);
CREATE INDEX IF NOT EXISTS idx_links_expiracao ON links_compartilhamento(data_expiracao);
CREATE INDEX IF NOT EXISTS idx_estatisticas_midia ON estatisticas_reproducao(midia_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_data ON estatisticas_reproducao(data_reproducao);

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de data_atualizacao
CREATE TRIGGER trigger_midias_atualizacao
  BEFORE UPDATE ON midias
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_data_modificacao();

CREATE TRIGGER trigger_agendamentos_atualizacao
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_data_modificacao();

CREATE TRIGGER trigger_playlists_atualizacao
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_data_modificacao();

-- Comentários nas tabelas (documentação)
COMMENT ON TABLE midias IS 'Armazena todas as mídias (vídeos, imagens, widgets) do sistema de digital signage';
COMMENT ON TABLE agendamentos IS 'Configurações de agendamento avançado (dayparting) para cada mídia';
COMMENT ON TABLE horarios_exibicao IS 'Horários específicos em que uma mídia deve ser exibida';
COMMENT ON TABLE links_compartilhamento IS 'Links curtos gerados para compartilhamento de playlists com TVs';
COMMENT ON TABLE estatisticas_reproducao IS 'Registro de reproduções para analytics';
