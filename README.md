
# TrabalhoVisita 📍

Aplicativo mobile para registro e gerenciamento de visitas com backend em Spring Boot.

---

## 🛠️ BACKEND (Java/Spring Boot)

### Requisitos
- Java 21+
- MySQL 8.0+

### Setup Rápido

1. **Criar banco de dados:**
```sql
CREATE DATABASE trabalho_visita;
```

2. **Configurar conexão** em `backend/apimoba/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/trabalho_visita
spring.datasource.username=root
spring.datasource.password=sua_senha
```

3. **Executar:**
```bash
cd backend/apimoba
./mvnw spring-boot:run
```

API estará em: **http://localhost:8081**

### Endpoints Principais
- `POST /user/login` - Login
- `POST /user/create` - Registrar usuário
- `GET /visit/returnAll` - Todas as visitas
- `GET /visit/list?email=user@email.com` - Visitas do usuário
- `POST /visit/create` - Criar visita
- `PUT /visit/update/{id}` - Atualizar visita
- `DELETE /visit/delete/{id}` - Deletar visita

---

## 📱 FRONTEND (React Native/Expo)

### Requisitos
- Node.js 18+
- npm 9+
- Expo CLI

### Setup Rápido

1. **Instalar dependências:**
```bash
cd front
npm install
```

2. **Configurar IP do servidor** em `service/api.js`:
```javascript
baseURL: "http://192.168.0.179:8081"  // Altere para seu IP
```

3. **Executar:**
```bash
npm start        # Expo
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

### Dependências Principais
- `axios` - Requisições HTTP
- `expo-camera` - Câmera
- `expo-location` - GPS
- `react-native-maps` - Mapas
- `@react-native-async-storage/async-storage` - Cache local

---

## ⚡ Fluxo de Funcionamento

1. Usuário faz login no app
2. App carrega todas as visitas (`/visit/returnAll`)
3. Usuário pode registrar nova visita (câmera + localização)
4. Dados são enviados para o backend
5. Backend salva no MySQL
6. App exibe a visita com nome do usuário que registrou

---

## 🚨 Troubleshooting

**Backend não conecta:**
- Verifique se MySQL está rodando
- Confirme credenciais em `application.properties`

**Frontend não conecta à API:**
- Verifique o IP em `service/api.js`
- Confirme que ambas as máquinas estão na mesma rede
- Teste: `ping 192.168.0.179`

---

## 📁 Estrutura

```
TrabalhoVisita/
├── backend/apimoba/          # API Spring Boot
│   ├── src/main/java/...     # Controllers, Services, Entities
│   └── pom.xml               # Dependências Maven
├── front/                     # App React Native
│   ├── app/                   # Telas e rotas
│   ├── components/            # Componentes reutilizáveis
│   ├── service/api.js         # Configuração Axios
│   └── package.json           # Dependências npm
└── README.md                  # Este arquivo
```

---

**Desenvolvido para fins educacionais** 
