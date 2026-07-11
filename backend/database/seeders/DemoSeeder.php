<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Demo user
        $user = User::create([
            'name'     => 'Demo User',
            'email'    => 'demo@demo.com',
            'password' => Hash::make('demo1234'),
            'role'     => 'user',
        ]);

        // Admin
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@demo.com',
            'password' => Hash::make('admin1234'),
            'role'     => 'admin',
        ]);

        // Sample orders
        $orders = [
            ['service' => 'web_design',     'status' => 'awaiting_payment', 'price' => 3500, 'kind' => 'fixed', 'package' => 'pro'],
            ['service' => 'ai_automation',  'status' => 'in_progress',      'price' => 2500, 'kind' => 'fixed', 'package' => 'growth'],
            ['service' => 'brand_identity', 'status' => 'completed',        'price' => 2800, 'kind' => 'fixed', 'package' => 'standard'],
            ['service' => 'seo',            'status' => 'quote_requested',  'price' => null, 'kind' => 'custom', 'package' => null],
        ];

        foreach ($orders as $i => $o) {
            Order::create([
                'order_number' => 'ORD-DEMO-' . ($i + 1),
                'user_id'      => $user->id,
                'service'      => $o['service'],
                'client_name'  => 'Demo User',
                'email'        => 'demo@demo.com',
                'price'        => $o['price'],
                'status'       => $o['status'],
                'details'      => [
                    'kind'         => $o['kind'],
                    'package'      => $o['package'],
                    'businessName' => 'Demo Business',
                    'industry'     => 'Technology',
                ],
            ]);
        }
    }
}