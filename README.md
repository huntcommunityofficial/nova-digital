# Nova Digital — Full Stack Agency Platform

A complete digital agency website with admin panel, order management, live chat, and blog system.

## Stack
- **Frontend:** Next.js 14, Tailwind CSS
- **Backend:** Laravel 11, Sanctum

## Installation

### Backend
1. cd backend
2. composer install
3. cp .env.example .env
4. php artisan key:generate
5. Configure database in .env
6. php artisan migrate
7. php artisan storage:link
8. php artisan serve

### Frontend
1. cd frontend
2. npm install
3. cp .env.example .env.local
4. Set NEXT_PUBLIC_BACKEND_URL to your backend URL
5. npm run dev

## Demo Accounts
Run the seeder first:
php artisan db:seed --class=DemoSeeder

Then login with:
- User: demo@demo.com / demo1234  
- Admin: admin@demo.com / admin1234