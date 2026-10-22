# Contexto para o roteiro do vídeo da LP — WhatsApp + CRM + Agentes de IA

Documento para quem vai escrever o roteiro (pessoa ou IA). Traz o que o vídeo precisa resolver, onde ele aparece, o que pode e o que não pode ser dito, e a estrutura sugerida.

## 1. Onde o vídeo aparece

- **Topo da LP (hero)**, em cima da ilustração do produto, com o botão **"Assista: WhatsApp + CRM + Agentes de IA"**.
- Abre em uma janela sobre a página (modal), com som, quando o visitante clica. Não toca sozinho.
- A LP existe em **português, espanhol e inglês** (`/`, `/es/`, `/en/`). O vídeo precisa de legendas nos três idiomas, ou de uma versão por idioma.

## 2. Objetivo

Em até 90 segundos, quem chegou na LP precisa entender:

1. **O problema**: o comercial está espalhado no celular de cada vendedor. O gestor não sabe quem respondeu, o que ficou parado nem onde cada venda parou.
2. **A solução, em três peças que trabalham juntas**:
   - **WhatsApp**: um número para o time inteiro, conexão oficial com a Meta, cada conversa com um responsável.
   - **CRM**: cada conversa vira um negócio no funil, com etapa, valor, responsável e próximo passo.
   - **Agentes de IA**: atendem 24h, qualificam o lead, fazem follow-up e passam para o vendedor com o contexto pronto.
3. **O próximo passo**: testar grátis por 7 dias.

## 3. Público

- **Donos e gestores comerciais** de pequenas e médias empresas que vendem pelo WhatsApp: educação, clínicas, serviços, indústria e distribuição, varejo, agências.
- **A dor deles**: cobram retorno do time, pedem print, perdem venda por conversa esquecida e perdem o histórico quando um vendedor sai.
- **O nível técnico** é baixo. Evitar jargão (API, webhook, prompt, BSUID).

## 4. Tom e linguagem

- **Tom**: direto, confiante e humano. Frases curtas. Falar com "você".
- **Termos que a LP já usa** e que o vídeo deve repetir: "Saiba quem atendeu, o que foi dito e onde cada venda parou", "O atendimento é do time. O controle é da sua empresa.", "Você pede. A Aura monta a automação."
- **Nomes do produto**:
  - **Clint** é a plataforma.
  - **Aura** é a copiloto de IA dentro da Clint (cria automações, responde perguntas).
  - Os **agentes de IA** são os que conversam com o cliente final no WhatsApp.

## 5. Estrutura sugerida (passo a passo, ~75–90 s)

| # | Tempo | Cena | O que mostrar (telas reais do app) | Fala / mensagem-chave |
|---|---|---|---|---|
| 1 | 0–8 s | Gancho | Celulares de vendedores com conversas soltas, notificações acumulando | "Seu comercial está no celular de cada vendedor. E o controle?" |
| 2 | 8–20 s | **WhatsApp** | Tela **Conversas** da Clint: lista de conversas, avatar com selo do WhatsApp, responsável em cada uma | Um número para o time inteiro. Cada conversa com um responsável. |
| 3 | 20–35 s | **CRM** | Tela **Negócios** (kanban): card do lead mudando de etapa; painel com valor, responsável e próximo passo | Do chat para o CRM sem sair do atendimento. Você vê onde cada venda está. |
| 4 | 35–55 s | **Agentes de IA** | Agente respondendo no WhatsApp fora do horário, qualificando o lead e passando para o vendedor com o histórico | Quando seu time não está, a conversa continua. |
| 5 | 55–70 s | **Aura monta a automação** | Editor de automações: a Aura cria gatilho, condição, follow-up e publica (mesma história da demonstração interativa da LP) | Você pede. A Aura monta. |
| 6 | 70–80 s | Prova | Números dos cases (abaixo) | Resultado de quem colocou em prática. |
| 7 | 80–90 s | CTA | Logo Clint + botão "Testar grátis · 7 dias" | "Teste grátis por 7 dias." |

> **Dica:** a cena 5 pode reaproveitar a seção **Demonstração interativa** da própria LP (`dist/demo`), que mostra o mesmo cenário de follow-up de leads sem resposta.

## 6. Provas que podem ser citadas

Os números abaixo são os cases publicados em useclint.com/cases. Use exatamente estes, sem arredondar nem inventar outros:

- **Academia de jiu-jitsu** (Serviços): **5x** mais faturamento com agentes de IA no atendimento.
- **Curso de Cromagem e Galvanização** (Educação): **R$ 200 mil** vendidos por um agente de IA, num lançamento de mais de R$ 500 mil.
- **Tendas Araguaia** (Indústria): **R$ 461 mil** em vendas, em 57 dias.
- **Mentoria em espanhol** (Mentoria e consultoria): **103x** mais leads convertidos.

Ao usar números, mostrar a fonte na tela ("Resultados divulgados pela Clint. Cada operação tem seu próprio contexto.").

## 7. O que não dizer

- Não prometer resultado garantido, prazo ou porcentagem que não esteja nos cases.
- Não dizer que a IA substitui o time. A mensagem é **IA e time trabalhando juntos**.
- Não citar preço. A LP diz que os valores dependem do plano e manda falar com a equipe.
- Não mostrar dados reais de clientes nas telas. Usar uma conta de demonstração com nomes fictícios.

## 8. Identidade visual

- **Cores e fontes**: fundo escuro (`#08060d` / `#101012`), roxo da marca (`#7566FF` a `#8b5cf6`), degradê lilás nos destaques e Poppins.
- **Telas**: gravadas no app real (app.useclint.com) em modo escuro, em 1440 px ou mais.
- **Botão de CTA**: igual ao do site, a pílula roxa "Testar grátis" com o selo branco "7 DIAS".

## 9. Entrega técnica

- **Formato**: 16:9, 1920×1080, MP4 (H.264), até ~90 s. Se possível, um corte 9:16 para redes.
- **Legendas** queimadas ou em arquivo `.srt` para PT, ES e EN. Ou três versões do vídeo.
- **Hospedagem**: YouTube (não listado) ou arquivo `.mp4`.
- **Como ligar na LP**: preencher `data-video` no botão do hero, em `dist/index.html` (`<button class="hero-video" data-video="">`), com o **ID do YouTube** ou o **caminho do .mp4**. Depois, rodar `python3 tools/build_i18n.py` para gerar as páginas ES e EN. O botão só aparece quando `data-video` está preenchido.
