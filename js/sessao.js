/* Tempo máximo por acesso (1 hora) e a tela "Sua sessão expirou", em página inteira como no portal. */

const SESSAO_MAX_MS = 60 * 60 * 1000;
const SESSAO_AVISO_MS = 5 * 60 * 1000;   // aviso 5 minutos antes do fim
let sessaoDestino = null;                // página em que a pessoa estava quando a sessão acabou
let sessaoAvisada = false;

function fimSessao() {
  return state.session && state.session.inicio ? state.session.inicio + SESSAO_MAX_MS : null;
}
function horaFimSessao() {
  const f = fimSessao();
  return f ? new Date(f).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
}

/* Encerra o acesso por tempo. As compras da demo ficam guardadas para quando a pessoa entrar de novo. */
function expirarSessao() {
  if (!state.session) return;
  const atual = parseHash();
  if (atual.path !== '/sessao-expirada' && atual.path !== '/acesso') sessaoDestino = atual.full;
  limparSessao();
  sessaoAvisada = false;
}

function checarSessao() {
  if (!state.session) return;
  if (!state.session.inicio) { state.session.inicio = Date.now(); save(); return; }
  const resta = fimSessao() - Date.now();
  if (resta <= 0) {
    expirarSessao();
    go('/sessao-expirada');
  } else if (resta <= SESSAO_AVISO_MS && !sessaoAvisada) {
    sessaoAvisada = true;
    toast(`Por segurança, seu acesso termina às ${horaFimSessao()}. Depois disso, é só entrar novamente.`);
  }
}
setInterval(checarSessao, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checarSessao(); });

/* Ilustração própria: porta trancada com cadeado e relógio de 1 hora. */
function arteSessao() {
  return `<svg class="sx-arte" viewBox="0 0 520 560" aria-hidden="true" focusable="false">
    <circle cx="330" cy="330" r="230" fill="#13128F" opacity=".55"/>
    <circle cx="330" cy="330" r="150" fill="#1818B7" opacity=".45"/>
    <line x1="150" y1="0" x2="150" y2="120" stroke="#5B7BD6" stroke-width="2"/>
    <line x1="250" y1="0" x2="250" y2="120" stroke="#5B7BD6" stroke-width="2"/>
    <rect x="110" y="120" width="190" height="440" fill="#1C9BD7"/>
    <rect x="132" y="146" width="146" height="110" fill="#1488C4"/>
    <rect x="132" y="276" width="146" height="110" fill="#1488C4"/>
    <rect x="132" y="406" width="146" height="132" fill="#1488C4"/>
    <rect x="268" y="320" width="14" height="44" rx="7" fill="#EEF0F4"/>
    <path d="M258 372a28 28 0 0 1 56 0v18h-14v-18a14 14 0 0 0-28 0v18h-14z" fill="#FFE05A"/>
    <rect x="246" y="386" width="80" height="66" rx="16" fill="#FFCD00"/>
    <circle cx="286" cy="412" r="8" fill="#E6B900"/><rect x="282" y="414" width="8" height="20" rx="4" fill="#E6B900"/>
    <g transform="translate(410 190)">
      <circle r="62" fill="#FFFFFF"/><circle r="62" fill="none" stroke="#FFCD00" stroke-width="8"/>
      <path d="M0 0V-38" stroke="#0A0349" stroke-width="7" stroke-linecap="round"/>
      <path d="M0 0L26 14" stroke="#0A0349" stroke-width="7" stroke-linecap="round"/>
      <circle r="7" fill="#0A0349"/>
      ${[0, 90, 180, 270].map((a) => `<rect x="-3" y="-54" width="6" height="12" rx="3" fill="#565F72" transform="rotate(${a})"/>`).join('')}
    </g>
    <rect x="330" y="540" width="190" height="20" rx="4" fill="#0E0C6E" opacity=".6"/>
  </svg>`;
}

function viewSessaoExpirada() {
  if (state.session) expirarSessao();   // abrir a tela direto também encerra o acesso
  const destino = safeDest(sessaoDestino) || '/carteira';
  return {
    title: 'Sua sessão expirou', crumbs: [], nav: '', telaCheia: true,
    html: `<div class="sx">
      <header class="sx-top">${logo('negativo', 52)}</header>
      <div class="sx-corpo">
        <div class="sx-texto">
          <h1 class="sx-h1">Sua sessão expirou</h1>
          <p class="sx-p">Por segurança, o tempo máximo por acesso é de 1 hora. Se desejar, entre novamente.</p>
          <div class="sx-acoes">
            <a class="btn btn-yellow sx-btn" href="#/acesso?destino=${encodeURIComponent(destino)}">Entrar novamente</a>
            <a class="sx-ajuda" href="#/info/faq">${icon('help', 22)}<span>Solicitar ajuda</span></a>
          </div>
        </div>
        ${arteSessao()}
      </div>
      <footer class="sx-rodape"><ul>
        <li><a href="#/info/faq">Central de Ajuda</a></li>
        <li><a href="#/info/condicoes">Política e Termos</a></li>
        <li><a href="https://borainvestir.b3.com.br/" target="_blank" rel="noopener">Hub de Educação<span class="sr-only"> (abre site da B3 em nova aba)</span></a></li>
      </ul></footer>
    </div>`,
  };
}
ROTAS_EXTRA.push({ re: /^\/sessao-expirada$/, view: viewSessaoExpirada });
