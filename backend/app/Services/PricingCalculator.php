<?php

namespace App\Services;

class PricingCalculator
{
    // ─── Base prices per service ──────────────────────────────────────────────

    private const BASE_PRICES = [
        'web_design' => [
            'starter' => 1200,
            'pro'     => 3500,
            'elite'   => 7500,
        ],
        'ai_automation' => [
            'starter'    => 800,
            'growth'     => 2500,
            'enterprise' => 6000,
        ],
        'brand_identity' => [
            'basic'    => 900,
            'standard' => 2800,
            'premium'  => 6500,
        ],
        'seo' => [
            'starter'   => 600,
            'growth'    => 1800,
            'authority' => 4500,
        ],
    ];

    // ─── Addon prices: null = unavailable, 0 = included, N = costs N ─────────

    private const ADDON_PRICES = [
        'web_design' => [
            'seo'      => ['starter' => 400,  'pro' => 400,  'elite' => 400],
            'mobile'   => ['starter' => null, 'pro' => 800,  'elite' => 800],
            'branding' => ['starter' => 600,  'pro' => 600,  'elite' => 600],
            'support'  => ['starter' => 300,  'pro' => 300,  'elite' => 0],
            'security' => ['starter' => 500,  'pro' => 500,  'elite' => 500],
        ],
        'ai_automation' => [
            'voice'      => ['starter' => 600,  'growth' => 600,  'enterprise' => 600],
            'multilang'  => ['starter' => 400,  'growth' => 400,  'enterprise' => 400],
            'whitelabel' => ['starter' => null, 'growth' => 800,  'enterprise' => 800],
            'support'    => ['starter' => 300,  'growth' => 300,  'enterprise' => 0],
            'training'   => ['starter' => 500,  'growth' => 500,  'enterprise' => 0],
        ],
        'brand_identity' => [
            'stylescape'  => ['basic' => 400,  'standard' => 400,  'premium' => 0],
            'motion'      => ['basic' => null, 'standard' => 600,  'premium' => 600],
            'social'      => ['basic' => 300,  'standard' => 300,  'premium' => 0],
            'print'       => ['basic' => 500,  'standard' => 500,  'premium' => 500],
            'guidelines'  => ['basic' => null, 'standard' => 0,    'premium' => 0],
        ],
        'seo' => [
            'localSeo'     => ['starter' => 300,  'growth' => 300,  'authority' => 0],
            'ecommerce'    => ['starter' => null, 'growth' => 500,  'authority' => 500],
            'linkBuilding' => ['starter' => 400,  'growth' => 400,  'authority' => 0],
            'contentPlan'  => ['starter' => 350,  'growth' => 350,  'authority' => 0],
            'support'      => ['starter' => 200,  'growth' => 200,  'authority' => 0],
        ],
    ];

    private const RUSH_MULTIPLIER = 1.2;
    private const RUSH_DEADLINE   = 'ASAP (rush fee)';

    // ─── Web design page upcharge ─────────────────────────────────────────────

    private const PAGES_UPCHARGE = [
        'web_design' => [
            'pro' => ['15+' => 500],
        ],
    ];

    // ─── Public method ────────────────────────────────────────────────────────

    public function calculate(string $service, array $details): ?float
    {
        // Custom orders have no fixed price
        if (($details['kind'] ?? '') === 'custom') {
            return null;
        }

        $package  = $details['package']  ?? null;
        $addons   = $details['addons']   ?? [];
        $deadline = $details['deadline'] ?? '';
        $pages    = $details['pages']    ?? '';

        // Validate service and package exist
        if (!isset(self::BASE_PRICES[$service][$package])) {
            return null;
        }

        $total = self::BASE_PRICES[$service][$package];

        // Rush fee
        if ($deadline === self::RUSH_DEADLINE) {
            $total = (int) round($total * self::RUSH_MULTIPLIER);
        }

        // Pages upcharge (web design pro + 15+)
        $pageUp = self::PAGES_UPCHARGE[$service][$package][$pages] ?? 0;
        $total += $pageUp;

        // Addons
        foreach ($addons as $addonId) {
            $cost = self::ADDON_PRICES[$service][$addonId][$package] ?? null;
            if (is_int($cost) && $cost > 0) {
                $total += $cost;
            }
        }

        return (float) $total;
    }
}