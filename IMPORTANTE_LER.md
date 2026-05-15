Opa professor, segue um resumão do que precisa pro projeto pra rodar, só seguir esses passos:
- no MySQL cria o banco manualmente pra não ter erro:
Comando: CREATE DATABASE visitastecnicas
No arquivo backend/apimoba/src/main/resources/application.properties, precisa colocar a senha do seu MySQL onde está destacado
- sobre o backend (Java/Spring Boot):
nós fizemos pelo intelliJ, não sei se nessessariamente o senhor precisaria abrir lá também, na dúvida, só abrir a pasta backend no IntelliJ, o Hibernate já vai cuidar de criar as tabelas sozinho assim que o projeto rodar
- sobre o Frontend (React Native/Expo):
Instalar as bibliotecas: Roda um npm install no terminal pra baixar as dependências.
- Ajuste de IP: 
No arquivo front/service/api.js, precisa trocar o [ENDEREÇO DE IP] pelo IP da sua máquina

com isso o app já deve estar 100% funcional e conectado com o banco
