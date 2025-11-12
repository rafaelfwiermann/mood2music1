# Mood2Music - TODO

## Infraestrutura e Configuração
- [x] Configurar schema do banco de dados (users, playlists, subscriptions, mood_templates, feedback)
- [x] Configurar variáveis de ambiente do Spotify (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
- [x] Implementar helpers para API do Spotify

## Autenticação e OAuth
- [x] Implementar OAuth flow com Spotify
- [x] Criar endpoints de autenticação (login, callback, logout)
- [x] Armazenar tokens do Spotify (access_token, refresh_token)
- [x] Implementar refresh automático de tokens

## Onboarding e Fluxo Principal
- [x] Criar tela de boas-vindas (Welcome to Mood2Music)
- [x] Implementar botão "Connect with Spotify"
- [x] Criar tela de escolha: "Analyze history" vs "Describe vibe"
- [x] Implementar análise de histórico do Spotify (top tracks/artists)

## Entrada de Vibe
- [x] Criar campo de texto para descrição de vibe
- [x] Implementar mood chips pré-definidos (Relaxed, Energetic, Romantic, etc.)
- [x] Validar entrada do usuário

## Mapeamento IA e Preview
- [x] Implementar módulo de IA para mapear texto → parâmetros musicais
- [x] Criar tela de preview com gauges visuais (energy, valence, BPM, genres)
- [x] Implementar opção de editar parâmetros (modo avançado)

## Geração de Playlist
- [x] Implementar chamada à API do Spotify /v1/recommendations
- [x] Criar playlist na conta do usuário via API
- [x] Adicionar tracks à playlist
- [x] Gerar capa de playlist com IA
- [x] Gerar título e descrição automáticos
- [x] Upload de capa para playlist do Spotify

## Tela de Resultado
- [x] Exibir playlist criada com capa, título e descrição
- [x] Implementar botão "Open in Spotify"
- [x] Criar funcionalidades de compartilhamento (WhatsApp, Telegram, Instagram, Copy Link)
- [x] Adicionar botões "Try another vibe" e "Edit parameters"

## Dashboard do Usuário
- [x] Criar lista de playlists criadas pelo usuário
- [x] Exibir thumbnail, título e data de cada playlist
- [x] Implementar botões por playlist: "Open in Spotify", "Redo vibe", "Edit"
- [x] Adicionar botão global "Create new vibe"
- [x] Mostrar informações de assinatura atual
- [x] Implementar banner "Upgrade to Pro" para usuários free

## Sistema de Assinatura
- [x] Criar modelo de dados para planos (Free vs Pro)
- [x] Implementar limites do plano Free (5 playlists/mês)
- [ ] Criar tela de gerenciamento de assinatura
- [ ] Implementar upgrade para Pro
- [ ] Adicionar histórico de pagamentos
- [ ] Configurar integração com gateway de pagamento (Stripe)

## Painel Administrativo
- [x] Criar dashboard com métricas (usuários ativos, playlists criadas, MRR/ARR)
- [x] Implementar gerenciamento de usuários (listar, buscar, suspender/ativar)
- [ ] Criar gerenciamento de planos (criar, editar, listar)
- [ ] Implementar gerenciamento de mood templates
- [ ] Adicionar moderação de conteúdo (playlists públicas)
- [ ] Criar sistema de relatórios e exportação (CSV/PDF)
- [ ] Implementar sistema de notificações para segmentos de usuários

## Funcionalidades Sociais
- [ ] Implementar feedback pós-playlist ("Did you enjoy this vibe?")
- [ ] Criar feed comunitário de vibes públicas
- [ ] Adicionar opção "Publish my vibe"
- [ ] Implementar contadores de plays/visualizações

## UI/UX e Design
- [ ] Definir paleta de cores dinâmica baseada em mood
- [ ] Implementar design mobile-first
- [ ] Adicionar animações de loading/transição
- [ ] Criar modo escuro/claro
- [ ] Otimizar para < 3 cliques até reprodução

## Testes e QA
- [ ] Testar limites do plano Free
- [ ] Testar funcionalidades do plano Pro
- [ ] Testar casos de falha do OAuth
- [ ] Testar fluxos de compartilhamento
- [ ] Testar UX mobile
- [ ] Validar integração completa com Spotify API

## Deploy e Monitoramento
- [ ] Configurar domínio customizado
- [ ] Habilitar SSL
- [ ] Configurar analytics (conversão, retenção, churn)
- [ ] Implementar monitoramento de erros
- [ ] Criar estratégia de lançamento

## Novas Funcionalidades (Fase 2)
- [x] Implementar análise completa de histórico do Spotify
- [x] Criar página de análise com insights do usuário
- [x] Gerar playlist baseada em histórico
- [x] Criar feed comunitário de playlists públicas
- [x] Implementar opção de tornar playlist pública
- [x] Adicionar página de exploração de vibes públicas
- [x] Implementar contador de visualizações/plays
- [x] Adicionar funcionalidade "Use this vibe"

## Bugs Reportados
- [x] Corrigir erro ERR_BLOCKED_BY_RESPONSE no OAuth do Spotify
- [x] Atualizar Redirect URI para URL pública do projeto
- [x] Corrigir subscription.get retornando undefined (criar subscription padrão)
- [x] Corrigir setLocation sendo chamado durante render no CreatePlaylist
- [x] Corrigir erro na API de recomendações do Spotify

## Melhorias de UX
- [x] Adicionar botões de criação rápida no dashboard (Analyze History / Describe Vibe)
- [x] Corrigir erro "Failed to get recommendations" ao analisar histórico do Spotify

## Melhorias de UI/UX e Pagamentos
- [x] Remover botões duplicados no estado "No playlists yet"
- [x] Melhorar cores dos ícones nos botões (roxo e rosa mais vibrantes)
- [x] Adicionar responsividade completa (mobile/tablet)
- [ ] Integrar Stripe para pagamentos do plano Pro
