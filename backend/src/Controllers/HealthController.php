<?php

declare(strict_types=1);

namespace App\Controllers;

/**
 * Health Check Controller
 * 
 * Provides API health status endpoint
 */
class HealthController
{
    /**
     * Check API health status
     */
    public function check(): void
    {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'API is running',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}
