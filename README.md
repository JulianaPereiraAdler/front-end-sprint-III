# Front End do Portal de Cadastro da Gestora X (MVP - Sprint 3)

### Introdução

O Portal de Cadastro de Investimentos foi projetada especificamente para a Gestora X, visando otimizar o processo cadastral de investidores pessoa física. Através de uma interface amigável e processos seguros, os investidores têm à disposição uma ferramenta que lhes permite não só se cadastrar, mas também renovar e acompanhar seu status cadastral.

Funcionalidades Detalhadas:

(i) Cadastro de Investidores:
- Os novos investidores podem iniciar seu processo de cadastro fornecendo informações básicas.
- A API valida os dados inseridos para assegurar consistência e conformidade.

(ii) Acompanhamento de Status:
- Os investidores podem fazer login no portal a qualquer momento para verificar o progresso de seu cadastro.
- Notificações serão enviadas em cada etapa concluída ou se informações adicionais forem necessárias.

(iii) Renovação de Cadastro:
- Uma ferramenta intuitiva permite que os investidores atualizem suas informações pessoais e financeiras conforme necessário.
- Lembretes automáticos são enviados para informar os investidores sobre a necessidade de renovação.

(iv) Submissão de Ficha Cadastral:
- Os investidores preenchem uma ficha detalhada, garantindo que todas as informações relevantes sejam coletadas.
- Suporte para upload de documentos associados à ficha.

(v) Declaração de Investidor Qualificado:
- Possibilidade de auto-declaração como investidor qualificado, juntamente com um processo de validação.
  
(vi) Definição de Perfil de Risco do Cliente:
- Um questionário interativo ajuda a definir o perfil de risco do investidor, garantindo alinhamento com as oportunidades de investimento adequadas.

Esta API foi rigorosamente desenvolvida em consonância com as normativas da Resolução CVM nº 30/21 e Resolução CVM nº 50/21, assegurando integridade, transparência e segurança em todos os processos, especialmente em relação à prevenção de atividades ilícitas.

---
### Tecnologias Utilizadas
Backend: Flask (Python)
Frontend: HTML, CSS, JS

Esta API desenvolvida em Flask para servir uma aplicação desenvolvida em HTML, CSS e JS.

---
## APIs Externas

Utilizamos 4 APIs externa. 

(i) countrystatecity.in: A API do site countrystatecity.in fornece informações sobre países, estados e cidades. A documentação oficial, localizada no link https://countrystatecity.in/docs/, oferece detalhes sobre como interagir com a API para obter os dados desejados. 

(ii) BrasilAPI: A API de CEP da BrasilAPI fornece um serviço que permite consultar informações relacionadas a Códigos de Endereçamento Postal (CEPs) no Brasil. Esta API converte o CEP em informações detalhadas sobre o local correspondente, como rua, bairro, cidade e estado. Link da documentação: https://brasilapi.com.br/docs

(iii) Disify: A API do Disify oferece várias funcionalidades, incluindo a validação de endereços de e-mail para verificar a sua autenticidade e a obtenção de informações detalhadas sobre domínios específicos. A API também fornece informações de Whois de domínios, permitindo aos usuários acessar detalhes sobre o registrante do domínio, informações de contato, e outros dados publicamente disponíveis. Além disso, permite verificar a disponibilidade de domínios para registro e obter screenshots de websites para visualização rápida. Link da documentação: https://docs.disify.com/

(iv) AML Due Diligence: A API AML Due Diligence, fornecida pela AML Reputacional, parece ser uma ferramenta destinada a prover informações e análises relacionadas ao cumprimento de normas de Anti-Lavagem de Dinheiro (AML, do inglês Anti-Money Laundering) e Due Diligence. Documentação: https://www.amlreputacional.com.br/aml-due-diligence/

Por favor insira as chaves disponibilizadas nos slides da Apresentação no arquivo assets/js/index.js do repositório antes de rodar a aplicação.

---
## Como executar através do Docker

Após clonar o repositório, navegue ao diretório raiz pelo terminal para executar os comandos abaixo.

Certifique-se de ter o [Docker](https://docs.docker.com/engine/install/) instalado e em execução em sua máquina.

Navegue até o diretório que contém o Dockerfile e o requirements.txt no terminal.
Execute **como administrador** o seguinte comando para construir a imagem Docker:

```
$ docker build -t app_front .
```

Uma vez criada a imagem, para executar o container basta executar, **como administrador**, seguinte o comando:

```
$ docker run -p 80:80 app_front
```

Uma vez executando, para acessar a API, basta abrir o [http://localhost:80/#/](http://localhost:80/#/) no navegador.



### Alguns comandos úteis do Docker

>**Para verificar se a imagem foi criada** você pode executar o seguinte comando:
>
>```
>$ docker images
>```
>
> Caso queira **remover uma imagem**, basta executar o comando:
>```
>$ docker rmi <IMAGE ID>
>```
>Subistituindo o `IMAGE ID` pelo código da imagem
>
>**Para verificar se o container está em exceução** você pode executar o seguinte comando:
>
>```
>$ docker container ls --all
>```
>
> Caso queira **parar um conatiner**, basta executar o comando:
>```
>$ docker stop <CONTAINER ID>
>```
>Subistituindo o `CONTAINER ID` pelo ID do conatiner
>
>
> Caso queira **destruir um conatiner**, basta executar o comando:
>```
>$ docker rm <CONTAINER ID>
>```
>Para mais comandos, veja a [documentação do docker](https://docs.docker.com/engine/reference/run/).

