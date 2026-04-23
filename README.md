# 💰 Expense Tracker

Aplicación full stack para la gestión de ingresos y gastos personales, con autenticación, dashboard analítico y operaciones CRUD completas.

🔗 Demo: https://expense-tracker-six-orpin-34.vercel.app  
🔗 API: https://expensetracker-m864.onrender.com  

---

## 🚀 Funcionalidades

- Registro e inicio de sesión (JWT)
- Gestión de categorías (ingresos / gastos)
- Gestión de transacciones (crear, editar, eliminar)
- Filtros por tipo, categoría y fecha
- Dashboard con:
  - Resumen general (ingresos, gastos, balance)
  - Resumen mensual
  - Historial por mes
  - Gráfico de ingresos vs gastos
  - Distribución de gastos por categoría
- Validaciones backend + manejo de errores
- UI responsive

---

## 🛠️ Tecnologías

### Frontend
- React (Vite)
- Bootstrap
- Axios
- Recharts
- React Hot Toast

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication
- Clean architecture (básica)

### Base de datos
- PostgreSQL (Neon)

### Deploy
- Frontend: Vercel
- Backend: Render

---

## ⚙️ Variables de entorno

### Backend (`appsettings.json` / Render)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=...;Username=...;Password=...;SSL Mode=Require"
  },
  "Jwt": {
    "Key": "your_secret_key",
    "Issuer": "ExpenseTracker",
    "Audience": "ExpenseTrackerUsers"
  }
}
```
### Frontend (.env)
- VITE_API_URL=https://expensetracker-m864.onrender.com/api

## 📦 Instalación local

### Backend
- cd ExpenseTracker.Api
- dotnet restore
- dotnet ef database update
- dotnet run

### Frontend
- cd expense-tracker-frontend
- npm install
- npm run dev

## 📊 Estructura del proyecto

ExpenseTracker/
│
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── Middleware/
│   ├── Models/
│   └── Services/
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── context/


## ⚠️ Problemas técnicos resueltos

- CORS entre Vercel y Render
- Migración de SQL Server → PostgreSQL
- Manejo de DateTime en UTC (error típico de Npgsql)
- Deploy con Docker en Render
- Configuración de variables de entorno
- Validaciones y manejo de errores en frontend y backend

## 📈 Mejoras futuras
- Exportar reportes (PDF / Excel)
- Modo oscuro
- Dashboard con más métricas
- Paginación avanzada y ordenamiento
- Tests unitarios

## 👨‍💻 Autor

Lucas Tagua
Desarrollador Web Junior

🔗 GitHub: https://github.com/lucastagua

🔗 LinkedIn: https://www.linkedin.com/in/lucastagua

🔗 Portfolio: https://lucastagua.github.io/PortFolio
