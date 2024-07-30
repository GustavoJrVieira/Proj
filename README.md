## 3a avaliação - 19 de Junho
### Referente aos conteúdos das aulas 1 até 13 + Programação Web I (semestre anterior -> FE)
- [1a aula](https://github.com/Welquer/si-24-7a/tree/1a-aula)
- [2a aula](https://github.com/Welquer/si-24-7a/tree/2a-aula)
- [3a aula](https://github.com/Welquer/si-24-7a/tree/3a-aula)
- [4a aula](https://github.com/Welquer/si-24-7a/tree/4a-aula)
- [5a aula](https://github.com/Welquer/si-24-7a/tree/5a-aula)
- [6a aula](https://github.com/Welquer/si-24-7a/tree/6a-aula)
- [7a aula](https://github.com/Welquer/si-24-7a/tree/7a-aula)
- [8a aula](https://github.com/Welquer/si-24-7a/tree/8a-aula)
- [9a aula](https://github.com/Welquer/si-24-7a/tree/9a-aula)
- [10a aula](https://github.com/Welquer/si-24-7a/tree/10a-aula)
- [11a aula](https://github.com/Welquer/si-24-7a/tree/11a-aula)
- [12a aula](https://github.com/Welquer/si-24-7a/tree/12a-aula)
- [13a aula](https://github.com/Welquer/si-24-7a/tree/13a-aula)

### Referente a implementação do protótipo no Figma
- [Design no Figma](https://www.figma.com/proto/0Pmzh1nYdpymAjBh1MBWr6/3a-avalia%C3%A7%C3%A3o?t=J7zVHwNW5XEwVho6-0&scaling=min-zoom&page-id=0%3A1&node-id=1-20&starting-point-node-id=1%3A20)

## Relação de prova por aluno
- 3a-avaliacao-[aluno-prova-0]-[aluno-prova-1]
    - 3a-avaliacao-joel-gustavo
    - 3a-avaliacao-humberto-mateus
    - 3a-avaliacao-abner-pedro
    - 3a-avaliacao-henri-samuel
    - 3a-avaliacao-caua-andre
    - 3a-avaliacao-darlon-matheus
    - 3a-avaliacao-daniel-leonardo

## Roteiro
- Apresentar implementação do protótipo
    - engenheiro backend apresenta front, engenheiro frontend apresenta back
- Apresentar implementação de autenticação
    - da perspectiva do back e do front, fluxo completo
- Apresentar implementação dos testes
    - quais tipos de testes foram implementados?
- Extras
    - Apresentar implementação de cookies
    - Apresentar configuração de CORS
    - Apresentar configuração de CSP
    - Apresentar modelo de arquitetura: qual a forma da sua aplicação?
        - Algum padrão utilizado?
        - Algum princípio de design?
        - Algum componente?

## Requisitos das provas 0 e 1 para referência:
### Prova 0
- Implemente o `backend` da aplicação prototipada, considerando:
    - Criar tabela EMPRESA e inserir ao menos 2 registros (diretamente na base de dados);
        - defina as colunas de acordo com a necessidade da aplicação e seus próprios critérios;
    - Criar tabela USUARIO e inserir ao menos 3 registros (diretamente na base de dados);
        - defina as colunas de acordo com a necessidade da aplicação e seus próprios critérios;
        - cada usuário deve estar vinculado a uma empresa. Vincule dois usuários a mesma empresa e um usuário à outra;
    - Criar estrutura restante necessária para atender as funcionalidades da aplicação;
    - Criar API com endpoints necessários para fornecer os dados ao frontend;
        - Considere as funcionalidades da aplicação, confira o protótipo, e então crie os endpoints;
- Criar uma pasta chamada `migracao` e dentro dela um arquivo chamado `versao-1.sql` contendo o SQL utilizado para criar a estrutura na base de dados;

### Prova 1
- Implemente o `frontend` da aplicação prototipada, considerando:
    - Utilize bibliotecas externas a vontade;
    - O visual deve ficar o mais próximo/igual possível do protótipo;
    - Ao acessar a página `Início`, redirecionar para a página de login caso o usuário ainda não esteja logado;

### Requisitos gerais
- Ao logar na aplicação o usuário poderá interagir com SOMENTE os dados salvos para a EMPRESA a qual está vinculado;