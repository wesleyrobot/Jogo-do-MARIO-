# 🚀 GUIA DE USO - VERSÃO MELHORADA

## 📋 O que foi melhorado?

### ✅ Performance
1. **requestAnimationFrame** ao invés de setInterval
   - Loop de jogo roda a 60 FPS fixos
   - Muito mais eficiente e suave

2. **Gerenciamento de Intervalos**
   - Sistema centralizado de controle
   - Limpeza automática
   - Sem vazamento de memória

3. **Otimização de Colisões**
   - Sistema unificado de detecção
   - Menos verificações redundantes

### ✅ Organização
1. **Código Modular**
   ```
   config.js   → Todas as configurações
   utils.js    → Utilitários e helpers
   audio.js    → Sistema de áudio
   game.js     → Lógica principal
   ```

2. **Classes Organizadas**
   - `MarioGame` - Classe principal
   - `AudioManager` - Gerenciador de áudio
   - `EntityManager` - Gerenciador de entidades
   - `CollisionSystem` - Sistema de colisões
   - `UIManager` - Gerenciador de UI

### ✅ Manutenibilidade
1. **Constantes Centralizadas**
   - Todas em `GAME_CONFIG`
   - Fácil de ajustar velocidades, pontos, etc.

2. **Código Comentado**
   - Documentação inline
   - Explicações de cada função

3. **README Corrigido**
   - Informações corretas sobre o Mario
   - Não mais sobre Luffy!

## 🎮 Como Usar

### Opção 1: Usar os Arquivos Melhorados

1. **Copie os novos arquivos para seu projeto:**
   ```bash
   cd /path/para/seu/projeto
   cp /home/claude/MARIO-game-main/config.js .
   cp /home/claude/MARIO-game-main/utils.js .
   cp /home/claude/MARIO-game-main/audio.js .
   cp /home/claude/MARIO-game-main/game.js .
   cp /home/claude/MARIO-game-main/index.html .
   cp /home/claude/MARIO-game-main/style.css .
   cp /home/claude/MARIO-game-main/README.md .
   ```

2. **Copie suas imagens para o diretório:**
   ```bash
   mkdir -p imagens
   cp /path/para/suas/imagens/*.* imagens/
   ```

3. **Abra o index.html no navegador**

### Opção 2: Testar Localmente

1. **Clone/baixe tudo:**
   ```bash
   # Baixe todos os arquivos do diretório
   /home/claude/MARIO-game-main/
   ```

2. **Adicione as imagens necessárias:**
   - `imagens/mario.gif`
   - `imagens/sonic.gif`
   - `imagens/gameoverfundo.png`

3. **Abra no navegador**

## 🔧 Como Customizar

### Alterar Velocidade do Jogo

No `config.js`, altere:
```javascript
DIFFICULTY: {
    INITIAL_SPEED: 2.5,  // Velocidade inicial (menor = mais rápido)
    MIN_SPEED: 1.2,      // Velocidade mínima
    // ...
}
```

### Alterar Pontuação

No `config.js`, seção `SCORES`:
```javascript
SCORES: {
    GOOMBA: 100,  // Altere aqui
    KOOPA: 150,
    // ...
}
```

### Adicionar Novo Inimigo

1. **Adicione o sprite** em `game.js` → método `getEnemySprite()`:
```javascript
myEnemy: `url('data:image/svg+xml,...')`
```

2. **Configure no `config.js`**:
```javascript
// Em PHASE_DATA
1: {
    name: '🌳 MUNDO VERDE',
    enemies: ['goomba', 'koopa', 'myEnemy'] // Adicione aqui
}

// Em ENEMY_TYPES
STOMPABLE: ['goomba', 'koopa', 'myEnemy'], // Se pode ser pisado
```

### Ajustar Vidas/Power-ups

No `config.js`:
```javascript
LIVES: {
    INITIAL: 3,  // Vidas iniciais
    MAX: 5       // Máximo de vidas
},

POWERUPS: {
    INVINCIBILITY_DURATION: 8000,  // 8 segundos
    SONIC_DURATION: 10000,         // 10 segundos
    // ...
}
```

## 📊 Estrutura dos Arquivos

```
MARIO-game-main/
│
├── index.html          # HTML principal (atualizado)
├── style.css           # Estilos (mesmo do original)
│
├── config.js           # ⭐ NOVO - Configurações
├── utils.js            # ⭐ NOVO - Utilitários
├── audio.js            # ⭐ NOVO - Sistema de áudio
├── game.js             # ⭐ NOVO - Jogo refatorado
│
├── README.md           # ⭐ CORRIGIDO
│
└── imagens/
    ├── mario.gif
    ├── sonic.gif
    └── gameoverfundo.png
```

## 🐛 Resolução de Problemas

### O jogo não inicia
- Verifique se todas as imagens estão no diretório `imagens/`
- Abra o console do navegador (F12) para ver erros
- Certifique-se de que todos os arquivos JS estão carregados

### Jogo está muito rápido/lento
- Ajuste `DIFFICULTY.INITIAL_SPEED` no `config.js`
- Valores menores = mais rápido
- Valores maiores = mais lento

### Sem som
- Verifique se o botão de som está ativado (🔊)
- Alguns navegadores bloqueiam autoplay de áudio
- Interaja com a página antes (clique em JOGAR)

### Colisões estranhas
- Ajuste `MARIO.COLLISION_OFFSET` no `config.js`
- Valores maiores = mais "perdão" nas colisões

## 🎯 Melhorias Futuras Sugeridas

Você pode adicionar:

1. **Sistema de Achievements**
   ```javascript
   class AchievementManager {
       achievements = {
           'first-kill': false,
           'sonic-speed': false,
           'phase-5': false
       }
   }
   ```

2. **Placar Online**
   - Integrar com Firebase
   - Ranking global

3. **Mais Fases**
   - Adicionar fases 6, 7, 8...
   - Novos temas e inimigos

4. **Boss Battles**
   - Chefe no final de cada fase
   - Mecânicas especiais

5. **Multiplayer Local**
   - Dois jogadores
   - Competição de score

6. **Mobile Melhorado**
   - Botões virtuais visuais
   - Feedback tátil

## 📝 Notas Importantes

- ✅ Código 100% JavaScript vanilla (sem frameworks)
- ✅ Performance otimizada (60 FPS)
- ✅ Sem dependências externas
- ✅ Funciona offline
- ✅ High score salvo no localStorage

## 🤝 Contribuindo

Se quiser melhorar ainda mais:

1. Faça suas alterações
2. Teste bem
3. Documente o que mudou
4. Compartilhe!

## 📄 Licença

Projeto educacional - Personagens © Nintendo

---

**Desenvolvido com ❤️ por Wesley**

Versão melhorada: 2.0
Data: Janeiro 2026
