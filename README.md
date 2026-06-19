**client-availability-monitor (CAM)** é a interface web (SPA) do **Availability Monitor**: um painel para editar, validar e exportar os quatro arquivos de configuração consumidos pelo motor de monitoramento em Python (**SAM**, `server-availability-monitor`) — tudo **100% local, em memória, sem backend**.

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

Os dados vivem **inteiramente em memória** (sem API, sem banco, sem `localStorage`), inicializados com valores de exemplo. O fluxo de trabalho é:

1. **Começar** — a página inicial apresenta o CAM e oferece duas portas: **importar** arquivos existentes (`.json` / `.txt`) ou **começar com os dados de exemplo**. A importação também fica disponível a qualquer momento pelo botão **Import** da navbar.
2. **Editar e validar** — cada aba valida os dados (campos obrigatórios, e-mail, IPv4, faixa de portas) e impede o salvamento de dados inválidos.
3. **Exportar** — o botão **Export** de cada aba baixa apenas aquele arquivo; o **Export all** na navbar baixa os quatro de uma vez, prontos para a pasta do SAM.

## 🛠️ Instalação e Execução

O projeto foi desenvolvido com **Angular 18** sobre **Node.js**. Os passos abaixo assumem uma máquina com o ambiente ainda não preparado.

### 1️⃣ Instalar o Node.js

O Angular 18 exige **Node.js ≥ 18.19** — recomenda-se o **Node 22 LTS**. Verifique se já há uma versão compatível:

```bash
node -v
```

Caso não possua (ou esteja abaixo de `18.19`), instale o **Node 22 LTS** seguindo a documentação oficial e **retorne a este README** em seguida:

- Download e instalação: https://nodejs.org/en/download

> O ambiente de desenvolvimento usou Node 24.14.1 (também funcional), mas o Node 22 LTS é a versão recomendada por estar na matriz de suporte oficial do Angular 18.

### 2️⃣ Instalar o Angular CLI 18

Com o Node instalado, instale o Angular CLI na versão 18, globalmente:

```bash
npm install -g @angular/cli@18
```

Confirme a instalação (deve apontar Angular CLI `18.x`):

```bash
ng version
```

- Referência oficial de instalação: https://angular.dev/installation

### 3️⃣ Instalar as dependências do projeto

Na raiz do projeto (`client-availability-monitor/`):

```bash
npm install
```

Isso restaura todas as dependências declaradas no `package.json` (incluindo o Bootstrap).

### 4️⃣ Executar

Servidor de desenvolvimento (recarrega ao salvar os arquivos-fonte):

```bash
ng serve
```

Acesse `http://localhost:4200/`.

Build de produção (artefatos gerados em `dist/`):

```bash
ng build
```

## 📄 Arquivos Gerenciados

O CAM lê e escreve os mesmos quatro artefatos consumidos pelo SAM. As tabelas de campos autoritativas estão no [README do servidor](../server-availability-monitor/README.md); abaixo, um resumo do que é cada um e onde é editado:

- **`monitor_config.json`** — configuração central: bloco `smtp` (`host`, `port`, `username`, `password`, `use_tls`, `from_address`), `timing` (intervalos e _timeout_ em segundos) e `concurrency` (`check_workers`). Editado na aba **Monitor Config**. O bloco `paths` é preservado com os valores canônicos.
- **`servers_pool.json`** — lista de servidores monitoráveis; cada entrada tem `hostname`, `port` e **exatamente um** entre `ip` (IPv4) ou `dns`. Editado na aba **Servers**.
- **`users_info.json`** — destinatários das notificações por e-mail (`username`, `email`). Editado na aba **Users**.
- **`monitor_list.txt`** — um `hostname` por linha; define quais servidores do `servers_pool.json` estão ativamente monitorados. Montado via _checkboxes_ na aba **Monitor List**.

## 🧪 Cobertura de Testes

A suíte cobre a **lógica pura** dos validadores reutilizáveis (`isInteger`, `isPort`, `isEmail`, `isIpv4`, `isExactlyOneOf`), em `src/app/validators/app-validators.spec.ts`, seguindo o padrão _arrange / act / assert_.

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
│   │   │   ├── home/              # Landing: apresentação + Import / dados de exemplo
│   │   │   ├── layout/            # Navbar + <router-outlet> das abas
│   │   │   ├── navbar/            # Navegação + ações globais (Import / Export all)
│   │   │   ├── monitor-config/    # Formulário reativo de monitor_config.json
│   │   │   ├── users-info/        # CRUD de users_info.json
│   │   │   ├── servers-pool/      # CRUD de servers_pool.json
│   │   │   └── monitor-list/      # Seleção (checkboxes) de monitor_list.txt
│   │   ├── services/
│   │   │   ├── storage.service.ts # Estado em memória (BehaviorSubject por artefato)
│   │   │   └── export.service.ts  # Export por artefato + orquestração de import
│   │   ├── models/                # Interfaces em snake_case espelhando o backend
│   │   ├── validators/            # Validadores puros + testes
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
└── package.json
```

### 📁 `components/`

Uma aba por componente (todos declarados em `app.module.ts`, sem _standalone_). O `home` é a landing (importar ou começar com os dados de exemplo); o `layout` envolve a `navbar` e o `<router-outlet>` das abas — a navbar fica **oculta na home**. A `navbar` concentra a navegação e as ações globais **Import** / **Export all**.

### 📁 `services/`

- **`storage.service.ts`** — fonte única de verdade em memória: um `BehaviorSubject` por artefato, exposto como observable (`x$`), _getter_ síncrono e _setter_. Semeado com dados de exemplo.
- **`export.service.ts`** — API por artefato (`exportMonitorConfig`, `exportServersPool`, `exportUsersInfo`, `exportMonitorList`; `exportAll` compõe os quatro), cada método encapsulando seu formato (JSON / texto) e baixando via `Blob`. A importação é orquestrada aqui: `importFiles` despacha cada arquivo por nome (`FILENAMES` → _reader_, sem adivinhar formato) e devolve um `ImportResult`; `summarizeImport` resume o resultado em mensagem por categoria (importados / falhas / ignorados).

### 📁 `models/`

Interfaces TypeScript em `snake_case`, espelhando exatamente a estrutura dos JSONs do SAM (ex.: `Server` com `ip` **xor** `dns`).

### 📁 `validators/`

Validadores reutilizáveis (`isInteger`, `isPort`, `isEmail`, `isIpv4`, `isExactlyOneOf`) usados pelos formulários reativos, com testes unitários focados.

## 📚 Referências

- Download Node.js. Node.js, disponível em: nodejs.org/en/download.
- Installation. Angular, disponível em: angular.dev/installation.
- Get started with Bootstrap. Bootstrap, disponível em: getbootstrap.com/docs/5.3/getting-started/introduction/.
- Angular Project Structure Guide: Small, Medium, and Large Projects. Medium, disponível em: medium.com/@dragos.atanasoae_62577/angular-project-structure-guide-small-medium-and-large-projects-e17c361b2029.
