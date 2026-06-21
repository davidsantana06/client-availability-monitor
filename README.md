**client-availability-monitor (CAM)** é a interface web (SPA) do **Availability Monitor**: um painel para editar, validar e exportar os quatro arquivos de configuração consumidos pelo motor de monitoramento em Python (**SAM**, `server-availability-monitor`) — **100% local, em memória, sem backend**.

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

## 🧭 Visão Geral

O CAM substitui a edição manual dos arquivos do SAM por uma interface dividida em quatro abas:

| Aba                | Arquivo               | Função                                           |
| ------------------ | --------------------- | ------------------------------------------------ |
| **Monitor Config** | `monitor_config.json` | Formulário de SMTP, _timings_ e concorrência     |
| **Users**          | `users_info.json`     | CRUD dos destinatários das notificações          |
| **Servers**        | `servers_pool.json`   | CRUD dos servidores monitoráveis (IP **ou** DNS) |
| **Monitor List**   | `monitor_list.txt`    | Seleção, por _checkbox_, dos servidores ativos   |

Os dados vivem **inteiramente em memória** (sem API, banco ou `localStorage`), semeados com valores de exemplo. O fluxo é:

1. **Começar** — a home apresenta o CAM e um botão **Get started** que abre as abas, já preenchidas com exemplos. Para partir de arquivos existentes, cada aba tem seu próprio **Import**.
2. **Editar e validar** — cada aba valida os dados (campos obrigatórios, e-mail, IPv4, faixa de portas e **unicidade** de `hostname`/`email`, comparada _case-insensitive_ + `trim`) e bloqueia o salvamento inválido. A importação valida o **conteúdo** do arquivo, não apenas o nome. Renomear ou remover um servidor em **Servers** **propaga em cascata** para o `monitor_list`, preservando a integridade referencial.
3. **Exportar** — o **Export** de cada aba baixa aquele arquivo, pronto para a pasta do SAM.

## 🛠️ Instalação e Execução

Projeto em **Angular 18** sobre **Node.js**. Os passos abaixo assumem um ambiente ainda não preparado.

### 1️⃣ Instalar o Node.js

O Angular 18 exige **Node.js ≥ 18.19** — recomenda-se o **Node 22 LTS**. Verifique a versão instalada:

```bash
node -v
```

Caso não possua (ou esteja abaixo de `18.19`), instale o **Node 22 LTS** pela documentação oficial:

- [Download e instalação do Node.js](https://nodejs.org/en/download)

> O desenvolvimento usou Node 24.14.1 (também funcional), mas o Node 22 LTS é o recomendado por estar na matriz de suporte oficial do Angular 18.

### 2️⃣ Instalar o Angular CLI 18

Com o Node instalado, instale o Angular CLI 18 globalmente:

```bash
npm install -g @angular/cli@18
```

Confirme a instalação (deve apontar Angular CLI `18.x`):

```bash
ng version
```

- [Instalação do Angular CLI](https://angular.dev/installation)

### 3️⃣ Instalar as dependências do projeto

Na raiz do projeto (`client-availability-monitor/`):

```bash
npm install
```

Restaura as dependências do `package.json` (incluindo Bootstrap e Bootstrap Icons).

### 4️⃣ Executar

Servidor de desenvolvimento (recarrega ao salvar):

```bash
ng serve
```

Acesse `http://localhost:4200/`.

Build de produção (artefatos em `dist/`):

```bash
ng build
```

## 📄 Arquivos Gerenciados

O CAM lê e escreve os mesmos quatro artefatos consumidos pelo SAM. As tabelas de campos autoritativas estão no [README do servidor](../server-availability-monitor/README.md); abaixo, o resumo de cada um:

- **`monitor_config.json`** — configuração central: `smtp` (`host`, `port`, `username`, `password`, `use_tls`, `from_address`), `timing` (intervalos e _timeout_ em segundos) e `concurrency` (`check_workers`). Editado na aba **Monitor Config**; o bloco `paths` é preservado com os valores canônicos.
- **`servers_pool.json`** — servidores monitoráveis; cada entrada tem `hostname`, `port` e **exatamente um** entre `ip` (IPv4) ou `dns`. Editado na aba **Servers**. O `hostname` é **único** (_case-insensitive_ + `trim`); renomeá-lo ou remover o servidor **cascateia** para o `monitor_list`.
- **`users_info.json`** — destinatários das notificações por e-mail (`username`, `email`). Editado na aba **Users**. O `email` é **único** (_case-insensitive_ + `trim`); o `username` pode repetir.
- **`monitor_list.txt`** — um `hostname` por linha; define quais servidores do `servers_pool.json` são monitorados ativamente. Montado via _checkboxes_ na aba **Monitor List** (com **Select all** / **Clear all**). A aba sinaliza **órfãos** (entradas sem servidor correspondente), que só a importação de um `monitor_list.txt` avulso pode introduzir — o CRUD, pela cascata, nunca os cria.

## 🧪 Cobertura de Testes

A suíte cobre a **lógica pura** dos validadores de formulário (`isInteger`, `isPort`, `isEmail`, `isIpv4`, `isExactlyOneOf`, `isUniqueIn`) e o auxiliar `hasError`, em `src/app/validators/app-validators.spec.ts`, seguindo o padrão _arrange / act / assert_.

```bash
ng test
```

> Os testes rodam via **Karma + Jasmine** e exigem um navegador **Chrome/Chromium** instalado.

## 🗂️ Estruturação

```
client-availability-monitor/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/              # Landing: apresentação + botão Get started
│   │   │   ├── layout/            # Navbar + <router-outlet> das abas
│   │   │   ├── navbar/            # Navegação entre as abas
│   │   │   ├── monitor-config/    # Formulário reativo de monitor_config.json
│   │   │   ├── users-info/        # CRUD de users_info.json
│   │   │   ├── servers-pool/      # CRUD de servers_pool.json
│   │   │   ├── monitor-list/      # Seleção (checkboxes) de monitor_list.txt
│   │   │   ├── page-header/       # Cabeçalho de aba: título + Import / Export por artefato
│   │   │   ├── confirm-dialog/    # Modal de confirmação reutilizável (ConfirmRequest)
│   │   │   └── alert/             # Banner dismissível reutilizável (AlertMessage)
│   │   ├── services/
│   │   │   ├── base/              # ArtifactStore<T>: estado em memória + import genérico
│   │   │   ├── contract/          # ArtifactIo: contrato de import/export por artefato
│   │   │   ├── monitor-config.service.ts
│   │   │   ├── users-info.service.ts
│   │   │   ├── servers-pool.service.ts
│   │   │   ├── monitor-list.service.ts
│   │   │   └── export.service.ts  # Primitivas de download (JSON / texto)
│   │   ├── directives/            # appTooltip (tooltips do Bootstrap)
│   │   ├── models/                # Interfaces em snake_case espelhando o backend
│   │   ├── validators/            # Validadores de formulário + guards de conteúdo + hasError + testes
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
└── package.json
```

### 📁 `components/`

Um componente de aba por artefato (declarados em `app.module.ts`, sem _standalone_). O `home` é a landing (apresentação + **Get started**); o `layout` envolve a `navbar` e o `<router-outlet>` — a navbar fica **oculta na home**. Três componentes apresentacionais são compartilhados pelas abas: `page-header` (título + **Import** / **Export** por artefato), `confirm-dialog` (modal de confirmação reutilizável) e `alert` (banner dismissível).

### 📁 `services/`

Cada artefato tem um serviço próprio que estende **`ArtifactStore<T>`** (`base/`): a classe abstrata mantém o estado em memória — um `BehaviorSubject` exposto como `value$`, com _getter_ síncrono `value` e _setter_ `set`, semeado com exemplos — e implementa um `import(file)` genérico que delega ao `parse` do serviço. A base implementa o contrato **`ArtifactIo`** (`contract/`), que o `page-header` consome de forma **polimórfica**, sem conhecer o artefato.

- **`monitor-config` / `users-info` / `servers-pool` / `monitor-list`** — definem o `parse` e o `export` do seu artefato. `ServersPoolService` e `UsersInfoService` expõem `addOne` / `updateOne` / `removeOne`; `MonitorListService` expõe `select` / `deselect` / `selectAll` / `clear` / `rename`. As mutações de **Servers** **cascateiam** para o `monitor_list` (renomeiam/removem a entrada), preservando a integridade referencial.
- **`export.service.ts`** — primitivas de download: `downloadJson` / `downloadText` encapsulam a criação do `Blob` e o disparo do _anchor_.

### 📁 `models/`

Interfaces TypeScript em `snake_case`, espelhando a estrutura dos JSONs do SAM (ex.: `Server` com `ip` **xor** `dns`).

### 📁 `validators/`

Duas camadas:

- **Formulário** — `isInteger`, `isPort`, `isEmail`, `isIpv4`, `isExactlyOneOf` e `isUniqueIn`, usados pelos formulários reativos; `isUniqueIn(getExisting)` é uma _factory_ que rejeita valores já presentes (_case-insensitive_ + `trim`), reavaliando a lista a cada validação. Junto deles, `hasError(form, path)` decide quando exibir o erro de um campo (inválido **e** _touched_).
- **Conteúdo (importação)** — `app-validators` reúne os predicados transversais (`isValidPort`, `isValidEmail`, `isValidIpv4`, …) e cada artefato tem o seu guard (`isMonitorConfig`, `isServersPool`, `isUsersInfo`), usado pelo `parse` do serviço para rejeitar arquivos fora do padrão.

## 📚 Referências

- [Download Node.js](https://nodejs.org/en/download)
- [Angular — Installation](https://angular.dev/installation)
- [Bootstrap — Get started](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Angular Project Structure Guide (Medium)](https://medium.com/@dragos.atanasoae_62577/angular-project-structure-guide-small-medium-and-large-projects-e17c361b2029)
